#!/usr/bin/env python3
"""Validate the public diary and apply idempotent, optimistic entry patches."""
import argparse
import copy
import datetime as dt
import json
import math
import os
from pathlib import Path
import re
import tempfile

TZ = 'America/Los_Angeles'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def fields(value, names, label):
    require(isinstance(value, dict) and set(value) == set(names.split()),
            f'{label}: expected exactly {names}')


def text(value, label):
    require(isinstance(value, str) and bool(value.strip()) and len(value) <= 4000,
            f'{label}: expected nonempty text, at most 4000 characters')


def number(value, label, nullable=False):
    if nullable and value is None:
        return
    require(type(value) in (int, float) and math.isfinite(value) and value >= 0,
            f'{label}: expected finite nonnegative number')


def date(value):
    require(isinstance(value, str) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', value), 'invalid date')
    dt.date.fromisoformat(value)


def validate(data):
    fields(data, 'schema_version default_timezone display_notes days meals workouts', 'diary')
    require(type(data['schema_version']) is int and data['schema_version'] == 1, 'unsupported schema')
    require(data['default_timezone'] == TZ, 'timezone must be America/Los_Angeles')
    require(isinstance(data['display_notes'], list), 'display_notes must be a list')
    for note in data['display_notes']:
        text(note, 'display note')
    for collection in ('days', 'meals', 'workouts'):
        require(isinstance(data[collection], list), f'{collection} must be a list')
    days = {}
    for day in data['days']:
        fields(day, 'date timezone food_log_status', 'day')
        date(day['date'])
        require(day['date'] not in days, 'duplicate day')
        require(day['timezone'] == TZ, 'invalid day timezone')
        require(day['food_log_status'] in ('not_logged', 'incomplete', 'complete'), 'invalid food status')
        days[day['date']] = day
    ids = set()
    for collection in ('meals', 'workouts'):
        for entry in data[collection]:
            if collection == 'meals':
                fields(entry, 'id date timezone title portion_notes nutrition calorie_range confidence estimate_note', 'meal')
            else:
                fields(entry, 'id date timezone title status duration_minutes description details notes', 'workout')
            prefix = 'meal' if collection == 'meals' else 'workout'
            require(isinstance(entry['id'], str) and re.fullmatch(prefix + r'-[a-z0-9][a-z0-9-]{0,99}', entry['id']), 'invalid stable ID')
            require(entry['id'] not in ids, 'duplicate entry ID')
            ids.add(entry['id'])
            date(entry['date'])
            require(entry['date'] in days, 'entry has no day')
            require(entry['timezone'] == TZ, 'invalid entry timezone')
            text(entry['title'], 'title')
            if collection == 'meals':
                require(days[entry['date']]['food_log_status'] != 'not_logged', 'meal day cannot be not_logged')
                for key in ('portion_notes', 'estimate_note'):
                    text(entry[key], key)
                fields(entry['nutrition'], 'calories_kcal protein_g carbs_g fat_g', 'nutrition')
                for key, value in entry['nutrition'].items():
                    number(value, key)
                fields(entry['calorie_range'], 'low high', 'calorie range')
                lo, hi = entry['calorie_range']['low'], entry['calorie_range']['high']
                number(lo, 'low', True)
                number(hi, 'high', True)
                require((lo is None) == (hi is None), 'range needs both endpoints or neither')
                if lo is not None:
                    require(lo <= entry['nutrition']['calories_kcal'] <= hi, 'estimate outside range')
                require(entry['confidence'] in ('low', 'medium', 'high'), 'invalid confidence')
            else:
                require(entry['status'] in ('completed', 'planned'), 'invalid workout status')
                number(entry['duration_minutes'], 'duration', True)
                text(entry['description'], 'description')
                text(entry['notes'], 'notes')
                require(isinstance(entry['details'], list), 'details must be a list')
                for detail in entry['details']:
                    fields(detail, 'exercise reps load distance_meters', 'workout detail')
                    text(detail['exercise'], 'exercise')
                    number(detail['reps'], 'reps', True)
                    number(detail['distance_meters'], 'distance', True)
                    if detail['load'] is not None:
                        fields(detail['load'], 'value unit', 'load')
                        number(detail['load']['value'], 'load')
                        require(detail['load']['unit'] in ('lb', 'kg'), 'load unit must be lb or kg')
    return data


def apply_patch(data, patch):
    """Apply an atomic batch: before/after are complete public entries, not fragments."""
    validate(data)
    fields(patch, 'operations', 'patch')
    require(isinstance(patch['operations'], list), 'operations must be a list')
    result = copy.deepcopy(data)
    touched = set()
    for op in patch['operations']:
        fields(op, 'collection key before after', 'operation')
        collection, key = op['collection'], op['key']
        require(collection in ('days', 'meals', 'workouts'), 'invalid collection')
        require(isinstance(key, str), 'key must be text')
        require((collection, key) not in touched, 'duplicate patch target')
        touched.add((collection, key))
        keyfield = 'date' if collection == 'days' else 'id'
        for side in ('before', 'after'):
            value = op[side]
            require(value is None or (isinstance(value, dict) and value.get(keyfield) == key), 'patch key mismatch')
        rows = result[collection]
        current = next((row for row in rows if row[keyfield] == key), None)
        if current == op['after']:
            continue  # This exact operation already landed.
        require(current == op['before'], f'conflict for {collection}/{key}; refetch and reconcile')
        if current is not None:
            rows.remove(current)
        if op['after'] is not None:
            rows.append(copy.deepcopy(op['after']))
    validate(result)
    for collection in ('days', 'meals', 'workouts'):
        result[collection].sort(key=lambda row: (row['date'], row.get('id', '')))
    return result


def totals(data):
    validate(data)
    result = {}
    for day in data['days']:
        meals = [m for m in data['meals'] if m['date'] == day['date']]
        result[day['date']] = {
            'food_log_status': day['food_log_status'],
            'logged_meals': len(meals),
            'nutrition': ({k: round(sum(m['nutrition'][k] for m in meals), 2)
                           for k in ('calories_kcal', 'protein_g', 'carbs_g', 'fat_g')}
                          if meals else None)}
    return result


def read(path):
    def unique_pairs(pairs):
        value = {}
        for key, item in pairs:
            require(key not in value, f'duplicate JSON key {key}')
            value[key] = item
        return value
    return json.loads(Path(path).read_text(), object_pairs_hook=unique_pairs)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('validate', 'apply', 'totals'))
    parser.add_argument('file', type=Path)
    parser.add_argument('patch', nargs='?', type=Path)
    args = parser.parse_args()
    try:
        data = validate(read(args.file))
        if args.command == 'apply':
            require(args.patch is not None, 'apply requires a patch file')
            result = apply_patch(data, read(args.patch))
            if result != data:
                fd, name = tempfile.mkstemp(prefix='.diary-', dir=args.file.parent)
                try:
                    with os.fdopen(fd, 'w') as stream:
                        json.dump(result, stream, ensure_ascii=False, indent=2, allow_nan=False)
                        stream.write('\n')
                        stream.flush()
                        os.fsync(stream.fileno())
                    os.replace(name, args.file)
                finally:
                    if os.path.exists(name):
                        os.unlink(name)
            print('Valid diary; patch applied (or already present).')
        elif args.command == 'totals':
            print(json.dumps(totals(data), indent=2))
        else:
            print('Valid public diary.')
    except (ValueError, OSError, TypeError, KeyError) as exc:
        parser.exit(1, f'{exc}\n')


if __name__ == '__main__':
    main()
