import copy
from pathlib import Path
import tempfile
import unittest

from diary import apply_patch, read, totals, validate


def fixture():
    return {'schema_version': 1, 'default_timezone': 'America/Los_Angeles',
            'display_notes': ['Estimates only.'],
            'days': [{'date': '2026-10-25', 'timezone': 'America/Los_Angeles', 'food_log_status': 'incomplete'}],
            'meals': [{'id': 'meal-example-001', 'date': '2026-10-25', 'timezone': 'America/Los_Angeles',
                       'title': 'Example', 'portion_notes': 'One portion.',
                       'nutrition': {'calories_kcal': 100, 'protein_g': 5, 'carbs_g': 15, 'fat_g': 2},
                       'calorie_range': {'low': 80, 'high': 120}, 'confidence': 'low',
                       'estimate_note': 'Approximate.'}], 'workouts': []}


def correction(data):
    before = copy.deepcopy(data['meals'][0])
    after = copy.deepcopy(before)
    after['nutrition']['protein_g'] = 6
    return {'operations': [{'collection': 'meals', 'key': before['id'], 'before': before, 'after': after}]}


class DiaryTests(unittest.TestCase):
    def test_valid(self):
        validate(fixture())

    def test_duplicate_id(self):
        data = fixture()
        data['meals'].append(copy.deepcopy(data['meals'][0]))
        with self.assertRaises(ValueError): validate(data)

    def test_correction_and_retry(self):
        data = fixture()
        patch = correction(data)
        result = apply_patch(data, patch)
        self.assertEqual(result['meals'][0]['nutrition']['protein_g'], 6)
        self.assertEqual(apply_patch(result, patch), result)
        self.assertEqual(data['meals'][0]['nutrition']['protein_g'], 5)

    def test_concurrent_unrelated_entry_preserved(self):
        data = fixture()
        patch = correction(data)
        extra = copy.deepcopy(data['meals'][0])
        extra['id'] = 'meal-example-002'
        data['meals'].append(extra)
        self.assertIn(extra, apply_patch(data, patch)['meals'])

    def test_conflicting_correction(self):
        data = fixture()
        patch = correction(data)
        data['meals'][0]['title'] = 'Concurrent correction'
        with self.assertRaisesRegex(ValueError, 'conflict'): apply_patch(data, patch)

    def test_privacy_whitelist(self):
        for location in ('root', 'meal', 'nutrition'):
            data = fixture()
            target = data if location == 'root' else data['meals'][0]
            if location == 'nutrition': target = target['nutrition']
            target['private_source_id'] = 'not-for-publication'
            with self.assertRaises(ValueError): validate(data)

    def test_day_consistency(self):
        for change in ('missing', 'invalid', 'timezone', 'status'):
            data = fixture()
            if change == 'missing': data['days'] = []
            if change == 'invalid': data['days'][0]['date'] = '2026-02-30'
            if change == 'timezone': data['meals'][0]['timezone'] = 'UTC'
            if change == 'status': data['days'][0]['food_log_status'] = 'not_logged'
            with self.assertRaises(ValueError): validate(data)

    def test_numbers(self):
        for number in (True, -1, float('nan'), float('inf')):
            data = fixture()
            data['meals'][0]['nutrition']['protein_g'] = number
            with self.assertRaises(ValueError): validate(data)

    def test_atomic_day_and_meal_addition(self):
        data = fixture()
        day = {'date': '2026-10-26', 'timezone': 'America/Los_Angeles', 'food_log_status': 'incomplete'}
        meal = copy.deepcopy(data['meals'][0])
        meal.update(id='meal-example-002', date=day['date'])
        patch = {'operations': [
            {'collection': 'meals', 'key': meal['id'], 'before': None, 'after': meal},
            {'collection': 'days', 'key': day['date'], 'before': None, 'after': day}]}
        result = apply_patch(data, patch)
        self.assertEqual(len(result['meals']), 2)
        self.assertEqual(apply_patch(result, patch), result)

    def test_delete_and_retry(self):
        data = fixture()
        old = copy.deepcopy(data['meals'][0])
        patch = {'operations': [{'collection': 'meals', 'key': old['id'], 'before': old, 'after': None}]}
        result = apply_patch(data, patch)
        self.assertEqual(result['meals'], [])
        self.assertEqual(apply_patch(result, patch), result)
        self.assertIsNone(totals(result)['2026-10-25']['nutrition'])

    def test_duplicate_patch_target(self):
        data = fixture()
        patch = correction(data)
        patch['operations'] *= 2
        with self.assertRaises(ValueError): apply_patch(data, patch)

    def test_duplicate_json_key(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'test.json'
            path.write_text('{"x": 1, "x": 2}')
            with self.assertRaises(ValueError): read(path)

    def test_totals_derived(self):
        self.assertEqual(totals(fixture())['2026-10-25']['nutrition']['calories_kcal'], 100)


if __name__ == '__main__':
    unittest.main()
