Estimate upload format

Supported Excel (.xlsx) format (two recommended sheets):

1) Sheet name: Estimate (single-row)
Columns (case-insensitive):
- project_name (required)
- project_type (required)  — either an existing ProjectType.id or exact ProjectType.name
- location (required)      — either Location.id or exact Location.name
- total_area (required)    — numeric
- base_cost_per_sqm (required) — numeric
- location_multiplier (optional, default 1.0)
- contingency_percentage (optional, default 10.0)
- project_description (optional)

2) Sheet name: Items (rows of line-items)
Columns (case-insensitive):
- category (optional, default 'other')
- name (required)
- description (optional)
- quantity (numeric, default 0)
- unit (optional)
- unit_price (numeric, default 0)
- notes (optional)

Notes:
- If you provide only a single sheet, the parser will look for a header containing `project_name` and will use the first row as metadata and the remaining rows (if they match item columns) as items.
- Use existing `ProjectType` and `Location` names or ids. The parser does a case-insensitive name lookup.

How to use the endpoint:
- POST multipart/form-data to `/api/estimates/upload/` with field `file` set to the uploaded Excel file.
- Authentication required (token/session)

After upload the API returns the created estimate data.

Template and helper scripts
---------------------------

- Example template generator: `backend/utils/generate_template.py` — run this script (requires openpyxl) to create `backend/resources/estimate_template.xlsx`.
- Walkthrough video helper: `frontend/tools/generate_walkthrough.sh` — place sequential PNG frames in `frontend/tools/frames/` and run the script to create an MP4. See `frontend/tools/frames/README.md` for details.
