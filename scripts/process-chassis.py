#!/usr/bin/env python3
"""
Process T2 Chassis Master data to create chassis lookup JSON.
Creates a lookup table: Make -> Model -> Year -> Chassis Range
"""

import pandas as pd
import json
from collections import defaultdict

INPUT_FILE = '/sessions/practical-relaxed-newton/mnt/uploads/Master Data - T2 Chassis Master.xlsx'
OUTPUT_FILE = '/sessions/practical-relaxed-newton/mnt/IntroCar - US Website Prototype/data/json/chassis-years.json'

def process_chassis():
    print("Loading T2 Chassis Master...")
    df = pd.read_excel(INPUT_FILE)
    print(f"Loaded {len(df)} chassis records")

    # Build the hierarchy: Make -> Model -> Year -> {chassisStart, chassisEnd, count}
    result = defaultdict(lambda: defaultdict(dict))

    # Group by Make, Model, Year
    grouped = df.groupby(['Make', 'Model', 'Year start']).agg({
        'Chassis': ['count', 'first', 'last']
    }).reset_index()

    grouped.columns = ['make', 'model', 'year', 'count', 'chassisFirst', 'chassisLast']

    # Also get numeric chassis ranges where possible
    for _, row in grouped.iterrows():
        make = row['make']
        model = row['model']
        year = int(row['year'])
        count = int(row['count'])
        first_chassis = str(row['chassisFirst'])
        last_chassis = str(row['chassisLast'])

        # Try to extract numeric chassis
        try:
            # For numeric chassis (like 30001, 33327)
            first_num = int(''.join(filter(str.isdigit, first_chassis)))
            last_num = int(''.join(filter(str.isdigit, last_chassis)))
        except:
            first_num = None
            last_num = None

        result[make][model][year] = {
            'chassisFirst': first_chassis,
            'chassisLast': last_chassis,
            'chassisNumericStart': first_num,
            'chassisNumericEnd': last_num,
            'count': count
        }

    # Convert to regular dict for JSON
    output = {}
    for make in result:
        output[make] = {}
        for model in result[make]:
            years = result[make][model]
            # Sort years
            sorted_years = {str(y): years[y] for y in sorted(years.keys())}
            # Also add year range summary
            year_list = list(years.keys())
            output[make][model] = {
                'yearStart': min(year_list),
                'yearEnd': max(year_list),
                'years': sorted_years
            }

    # Write output
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Created {OUTPUT_FILE}")
    print(f"   Makes: {len(output)}")
    print(f"   Total models: {sum(len(m) for m in output.values())}")

    # Show sample
    print("\n📋 Sample: Bentley T2")
    if 'Bentley' in output and 'T2' in output['Bentley']:
        t2 = output['Bentley']['T2']
        print(f"   Year range: {t2['yearStart']}-{t2['yearEnd']}")
        for year, data in list(t2['years'].items())[:3]:
            print(f"   {year}: chassis {data['chassisFirst']}-{data['chassisLast']} ({data['count']} cars)")

if __name__ == '__main__':
    process_chassis()
