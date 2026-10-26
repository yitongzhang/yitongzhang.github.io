# Public food & workout diary

`_data/diary.json` on `master` is the canonical **public diary**. Jekyll renders it at
<https://zhayitong.com/log/>. There is no backend, database, credential in the site,
or second locally authoritative diary. Temporary local files are working copies.

## Publication boundary

Only publish the user's authorized meal/workout diary subset. Never copy a private
tracker wholesale. Exclude health records, BodySpec, private source/chat IDs, chat
transcripts, targets, race benchmarks and images. The validator rejects unknown
fields, but cannot determine whether allowed text contains private information:
review every string before publishing. Git history is public and persistent.

Dates are local calendar dates in `America/Los_Angeles`, not UTC dates. Resolve
“today/yesterday” in that zone, or use the user's explicit meal/workout date. Do
not invent times or convert a date-only record via UTC. Preserve stable IDs across
corrections (even a corrected date); allocate a new public ID only for a genuinely
new entry. Check existing entries before assigning an ID to a repeated report.

Days have `food_log_status`: `not_logged`, `incomplete`, or `complete`. New food
days should be `incomplete`; only mark complete with confirmation that the day's
food intake is fully logged. No logged food is **unknown**, not zero. Totals are
computed from meals; never store competing daily totals. Keep estimates, portion
assumptions and uncertainty explicit. Workout status is `completed` or `planned`;
only completed workouts describe work actually done.

## Validate and update

Python 3 standard library only:

```sh
python3 scripts/diary.py validate _data/diary.json
python3 -m unittest discover -s scripts -p 'test_diary.py'
python3 scripts/diary.py totals _data/diary.json
python3 scripts/diary.py apply _data/diary.json /tmp/diary-patch.json
```

The patch format is `{"operations": [...]}`. Each operation is:

```json
{"collection":"meals","key":"meal-example-001","before":null,"after":{"...":"complete public meal entry"}}
```

The abbreviated `after` above is illustrative, not a valid entry. Use the schema
in `scripts/diary.py` and existing data for exact required fields. Collections are
`days`, `meals`, `workouts`; the key is `date` for days and `id` otherwise. `before`
is the complete entry originally read (or null for creation), `after` the complete
replacement (or null for deletion). Include a new day and its meal in one batch.
Never put private provenance in either side of a patch or in the commit message.

Updates are compare-and-swap: if current equals `after`, replay is a no-op; if it
equals `before`, the update applies; otherwise it conflicts and requires deliberate
reconciliation. Unrelated entries survive. The entire result validates before an
atomic local file replacement. Run only one local writer per working copy; remote
concurrency is protected by the GitHub blob-SHA lease below, not by the local CLI.

## Publish each authorized log or correction

1. Fetch **latest** `_data/diary.json` from repository
   `yitongzhang/yitongzhang.github.io`, ref `master`, using GitHub `fetch_file`.
   Retain its exact current blob SHA. Do not publish from a stale cached snapshot.
2. Construct a targeted stable-ID patch from the entry version originally read;
   apply it to the fetched file, validate, run tests and review the diff for privacy.
3. Use GitHub `update_file` with `repository_full_name` as above, `branch: master`,
   `path: _data/diary.json`, `sha` equal to that fetched blob SHA, and `content`
   equal to the complete validated result. This is an optimistic atomic update.
   Keep other paths untouched for ordinary diary updates. No force push.
4. On a conflict/409, fetch the latest file and SHA and reapply the **same patch**.
   Unrelated concurrent changes remain. If the same entry changed, stop and
   reconcile; never replace it blindly. If the result is already present, do not
   issue another write. On a timeout/uncertain outcome, read remote state and
   commit history first to determine whether it landed before any retry.
5. Verify the returned commit is on `master` and the remote JSON equals the
   intended merged result. Inspect the GitHub Actions `pages build and deployment`
   run for that exact SHA until success; a commit alone is not a deployed page.
   Verify <https://zhayitong.com/log/> shows the entry, correct local date and totals.
   Report a build/publication failure rather than claiming it is live.

For authenticated git instead, start from latest master, apply the same patch,
validate, commit only the diary file, and use a normal fast-forward push. If rejected,
fetch latest and reapply the patch on a clean latest-master working copy; do not
force or blindly resolve data conflicts. Preserve the failed attempt for diagnosis.

No scheduled job is needed: each authorized new diary report triggers this workflow.

## Display labels and training types

`_data/diary.json` remains the full canonical diary. `_data/diary_display.yml`
contains presentation-only food emoji mappings and training classifications.
Food emoji keys match the normalized `labels` value (or the original title).
Supply a meaningful short label; the template exposes it as an accessible name
and hover/focus/tap tooltip with the matching canonical food titles. Repeated matching labels are counted. Unknown foods use a plate
emoji until mapped. Do not remove canonical details when shortening the display.

For each new workout, assign its stable ID in `training` to one of the
`training_types` keys: `gym`, `crossfit` (Crossfit (Flagship)), `barrys`,
`hyrox_sim`, `run`, `bike`, `swim`. Use only confirmed venue/type information;
unknown sessions default to Gym. Use Hyrox Sim when explicitly reported as such; do not infer additional stations
or distances from that label. Do not classify scheduled classes as completed. A run within a gym/class
session is not a separate session unless explicitly reported as one.
Standalone Run/Bike/Swim labels derive known distance from matching canonical
exercise details in meters and display kilometers; leave genuinely unknown
distances unspecified rather than inventing them. Keep exercise names Run,
Bike, or Swim for these distance-bearing details. Tooltip content comes from
canonical description and duration. Hover/focus opens it; click/tap pins it;
a second click/tap, Escape, outside click, resize or scroll dismisses it.

Run `node scripts/test_log.js` after changing tooltip behavior. When a diary
update needs display mappings too, atomically commit both against latest master
using its base tree, then update the branch with the expected-head lease and no
force. Reconcile rejected leases rather than overwriting concurrent changes.


Food groups have no inter-group spacing or decorative underlines. Repeated groups
retain their count and all matching canonical food titles in the accessible tooltip.
