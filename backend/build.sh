#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=========================================="
echo "Starting Build Process..."
echo "=========================================="

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "=========================================="
echo "Collecting static files..."
echo "=========================================="
python manage.py collectstatic --no-input

echo "=========================================="
echo "Running database migrations..."
echo "=========================================="
python manage.py migrate --no-input

echo "=========================================="
echo "Populating database with initial data..."
echo "=========================================="
echo "Running populate_project_types..."
python manage.py populate_project_types || echo "WARNING: populate_project_types failed"
echo "Running populate_locations..."
python manage.py populate_locations || echo "WARNING: populate_locations failed"
echo "Running populate_counties..."
python manage.py populate_counties || echo "WARNING: populate_counties failed"

echo "=========================================="
echo "Build completed successfully!"
echo "=========================================="
echo "=========================================="