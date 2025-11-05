UI refresh and upload improvements

What I added:
- Frontend
  - Drag-and-drop upload UX with per-row validation feedback (frontend/src/pages/EstimatePage.js)
  - Hero and small UI tweaks (Card/Input/Button hover/animations)
  - Walkthrough page (frontend/src/pages/WalkthroughPage.js)
  - FFmpeg helper script for stitching frames into an MP4: `frontend/tools/generate_walkthrough.sh`

- Backend
  - Upload endpoint now returns per-row validation errors in `row_errors` (backend/estimates/views.py)
  - Example template generator `backend/utils/generate_template.py` which produces `backend/resources/estimate_template.xlsx`

How to create the example Excel template:

1. Activate your backend venv and install dependencies (if not already):

```bash
source venv/bin/activate
pip install -r requirements.txt
```

2. Run the generator:

```bash
python backend/utils/generate_template.py
```

This creates `backend/resources/estimate_template.xlsx` which you can download or open and edit.

How to build the walkthrough MP4 (local):

1. Place sequential PNG frames in `frontend/tools/frames/` named `001.png`, `002.png`, ...
2. Run the script:

```bash
cd frontend/tools
bash generate_walkthrough.sh
```

This will create `frontend/tools/out/walkthrough.mp4`.

Notes:
- Run Django migrations (the new `source` and `original_filename` fields were added to the `Estimate` model) before using the upload endpoint:

```bash
python manage.py makemigrations estimates
python manage.py migrate
```

- The upload endpoint expects sheet names `Estimate` and `Items` (or a single sheet with `project_name` header). See `backend/docs/estimate_upload_format.md` for details.

If you want, I can:
- Add per-row detailed errors to the UI with inline table preview and CSV download of failed rows.
- Persist uploaded files (add FileField + MEDIA settings).
- Create a polished MP4 for you if you provide the storyboard/screenshots (I can generate frames and the ffmpeg command).