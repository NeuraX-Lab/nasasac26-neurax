"""Read-only verification of pinned Viet DATA/UI handoff; no ML imports/inference."""
from pathlib import Path
from datetime import datetime, timezone
import csv
import argparse
import hashlib
import json

ROOT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--bundle', type=Path, default=ROOT / 'viet-v2-data-02e3de3' / 'handoffs' / 'v2-data-hung')
parser.add_argument('--out', type=Path, default=ROOT / 'viet-v2-data-review.json')
args = parser.parse_args()
BUNDLE = args.bundle
manifest = json.loads((BUNDLE / 'manifest.json').read_text(encoding='utf-8'))
checks = []
for entry in manifest['files']:
    path = BUNDLE / entry['path']
    payload = path.read_bytes()
    checks.append({'path': entry['path'], 'bytes_ok': len(payload) == entry['bytes'],
                   'sha256_ok': hashlib.sha256(payload).hexdigest() == entry['sha256']})
assert all(x['bytes_ok'] and x['sha256_ok'] for x in checks)

with (BUNDLE / 'files/data/processed/v2/monthly.csv').open(encoding='utf-8', newline='') as f:
    reader = csv.DictReader(f)
    monthly = list(reader)
    columns = reader.fieldnames
months = [row['period_start'] for row in monthly]
expected = [f'{year:04}-{month:02}-01' for year in range(1984, 2027)
            for month in range(1, 13) if (year, month) <= (2026, 10)]
assert months == expected
overview = json.loads((BUNDLE / 'overview.json').read_text(encoding='utf-8'))
analysis = json.loads((BUNDLE / 'analyze-empty-farm.json').read_text(encoding='utf-8'))
assert overview['schema_version'] == analysis['schema_version'] == 'fieldshift-2'
assert overview['region_id'] == analysis['region_id'] == 'MT-BLOCK-01'
assert analysis['decision']['farm'] == {}
options = analysis['decision']['options']
assert {x['id'] for x in options} == {'R0', 'R1', 'R2'}
assert all(x['status'] == 'needs_information' and x['score'] is None
           and x['rank'] is None and x['probability_of_success'] is None
           and x['domain_approved'] is False for x in options)
forecasts = overview['forecasts']
assert len(forecasts) == 6
assert {(x['target'], x['horizon_months']) for x in forecasts} == {
    (target, horizon) for target in ['precip_sum_mm', 'air_temp_mean_c', 'air_rh_mean_pct']
    for horizon in [1, 3]}
assert all(x['target_month'] == {1: '2026-12-01', 3: '2027-02-01'}[x['horizon_months']]
           and x['lower'] <= x['value'] <= x['upper'] for x in forecasts)

report = {
    'checked_at_utc': datetime.now(timezone.utc).isoformat(),
    'source_commit': '02e3de3f0ac2883f29e19183524c4c767de7c5b8',
    'source_branch': 'data/v2-hung-handoff',
    'bundle_version': manifest['version'],
    'all_hashes_and_sizes_pass': True, 'file_count': len(checks),
    'monthly_rows': len(monthly), 'monthly_contiguous_unique_sorted': months == expected,
    'monthly_period': [months[0], months[-1]], 'columns': columns,
    'missing_values_by_column': {key: sum(row[key] == '' for row in monthly) for key in columns},
    'overview_months': len(overview['months']),
    'overview_run_id': overview['run_id'], 'analysis_run_id': analysis['run_id'],
    'schema_version': overview['schema_version'], 'region_id': overview['region_id'],
    'forecast_records': [{key: x[key] for key in [
        'target', 'horizon_months', 'target_month', 'value', 'unit', 'lower', 'upper',
        'method', 'data_through', 'feature_data_cutoff', 'nominal_coverage', 'backtest_coverage']}
        for x in forecasts],
    'analysis_status': analysis['status'],
    'empty_farm_option_statuses': {x['id']: x['status'] for x in options},
    'empty_farm_rag': analysis['rag'],
    'model_joblib_count_inside_bundle': len(list(BUNDLE.rglob('*.joblib'))),
    'full_training_cache_included': manifest['full_training_cache_included'],
    'file_checks': checks,
    'not_verified': ['upstream source correctness or independent scientific review',
                     'model deserialization or inference replay', 'full live v2 API',
                     'physical hardware', 'new frontend behavior or usability'],
}
output = args.out
output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({key: report[key] for key in [
    'all_hashes_and_sizes_pass', 'file_count', 'monthly_rows', 'monthly_contiguous_unique_sorted',
    'missing_values_by_column', 'overview_months', 'model_joblib_count_inside_bundle',
    'empty_farm_option_statuses']}, ensure_ascii=False))
print(output)
