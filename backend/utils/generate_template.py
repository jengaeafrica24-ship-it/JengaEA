"""
Generate an example Excel template for estimate uploads.
Run this script from the backend virtualenv where openpyxl is installed.

Usage:
    python backend/utils/generate_template.py

It will create `estimate_template.xlsx` in the repository root under `backend/resources/`.
"""
from openpyxl import Workbook
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'resources')
os.makedirs(OUT_DIR, exist_ok=True)
OUT_PATH = os.path.join(OUT_DIR, 'estimate_template.xlsx')

wb = Workbook()
# Estimate sheet
ws_meta = wb.active
ws_meta.title = 'Estimate'
headers_meta = ['project_name', 'project_type', 'location', 'total_area', 'base_cost_per_sqm', 'location_multiplier', 'contingency_percentage', 'project_description']
ws_meta.append(headers_meta)
# Example row
ws_meta.append(['Sample 3-Bedroom House', '3-Bedroom House', 'Nairobi', 120, 25000, 1.0, 10, 'Example project created from template'])

# Items sheet
ws_items = wb.create_sheet('Items')
headers_items = ['category', 'name', 'description', 'quantity', 'unit', 'unit_price', 'notes']
ws_items.append(headers_items)
# Example rows
ws_items.append(['material', 'Cement (50kg bag)', 'Portland cement', 100, 'bag', 700, 'Local price estimate'])
ws_items.append(['labor', 'Mason labor', 'Masonry works', 200, 'hour', 500, 'Skilled labor'])
ws_items.append(['equipment', 'Concrete mixer', 'Mixer rent per day', 5, 'day', 3500, 'Rental'])

wb.save(OUT_PATH)
print(f"Wrote example template to: {OUT_PATH}")
