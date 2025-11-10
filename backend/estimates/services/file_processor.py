import os
from django.core.files.storage import default_storage
from django.conf import settings
from pathlib import Path

def validate_file(file):
    """Validates the uploaded building plan file."""
    ALLOWED_EXTENSIONS = ['.pdf', '.dwg', '.dxf']
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    
    # Check file size
    if file.size > MAX_FILE_SIZE:
        return False, "File size too large. Maximum size is 50MB."
    
    # Check file extension
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
    
    return True, None

def handle_uploaded_file(file, estimate_id):
    """Handles file upload and storage."""
    try:
        # Create directory if it doesn't exist
        upload_dir = Path(settings.MEDIA_ROOT) / 'building_plans' / str(estimate_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file with original filename
        file_path = upload_dir / file.name
        with default_storage.open(str(file_path), 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        # Return relative path for database storage
        return str(file_path.relative_to(settings.MEDIA_ROOT))
    except Exception as e:
        return None