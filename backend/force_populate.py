#!/usr/bin/env python
"""
Emergency script to populate ProjectTypes, Locations, and Counties
Run this directly on Render shell if build.sh populate commands didn't work
Usage: python force_populate.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jengaest.settings')
django.setup()

from projects.models import ProjectType, Location
from decimal import Decimal

def populate_project_types():
    """Populate project types"""
    project_types = [
        {
            'name': 'Industrial',
            'category': 'industrial',
            'description': 'Industrial projects category',
            'base_cost_per_sqm': Decimal('50000.00')
        },
        {
            'name': 'Residential',
            'category': 'residential',
            'description': 'Residential projects category',
            'base_cost_per_sqm': Decimal('45000.00')
        },
        {
            'name': 'Commercial',
            'category': 'commercial',
            'description': 'Commercial projects category',
            'base_cost_per_sqm': Decimal('65000.00')
        },
        {
            'name': 'Infrastructure',
            'category': 'infrastructure',
            'description': 'Infrastructure projects category',
            'base_cost_per_sqm': Decimal('25000.00')
        },
        {
            'name': 'Single Family Home',
            'category': 'residential',
            'description': 'Standard single family residential construction',
            'base_cost_per_sqm': Decimal('45000.00')
        },
        {
            'name': 'Apartment Building',
            'category': 'residential',
            'description': 'Multi-unit residential building',
            'base_cost_per_sqm': Decimal('55000.00')
        },
        {
            'name': 'Office Building',
            'category': 'commercial',
            'description': 'Standard office building construction',
            'base_cost_per_sqm': Decimal('65000.00')
        },
        {
            'name': 'Shopping Mall',
            'category': 'commercial',
            'description': 'Retail shopping center',
            'base_cost_per_sqm': Decimal('75000.00')
        },
        {
            'name': 'Factory',
            'category': 'industrial',
            'description': 'Industrial manufacturing facility',
            'base_cost_per_sqm': Decimal('50000.00')
        },
        {
            'name': 'Warehouse',
            'category': 'industrial',
            'description': 'Storage warehouse facility',
            'base_cost_per_sqm': Decimal('35000.00')
        },
        {
            'name': 'Road Construction',
            'category': 'infrastructure',
            'description': 'Road and highway construction',
            'base_cost_per_sqm': Decimal('25000.00')
        },
        {
            'name': 'Bridge',
            'category': 'infrastructure',
            'description': 'Bridge construction project',
            'base_cost_per_sqm': Decimal('85000.00')
        },
    ]
    
    count = 0
    for pt_data in project_types:
        obj, created = ProjectType.objects.get_or_create(
            name=pt_data['name'],
            defaults={
                'category': pt_data['category'],
                'description': pt_data['description'],
                'base_cost_per_sqm': pt_data['base_cost_per_sqm']
            }
        )
        if created:
            print(f'✓ Created project type: {pt_data["name"]}')
            count += 1
        else:
            print(f'- Already exists: {pt_data["name"]}')
    
    print(f'\n✓ {count} new project types created')
    return count

def populate_locations():
    """Populate location cost multipliers"""
    locations = [
        {'county_name': 'Nairobi', 'cost_multiplier': Decimal('1.2')},
        {'county_name': 'Mombasa', 'cost_multiplier': Decimal('1.15')},
        {'county_name': 'Kisumu', 'cost_multiplier': Decimal('1.1')},
        {'county_name': 'Nakuru', 'cost_multiplier': Decimal('1.05')},
        {'county_name': 'Kiambu', 'cost_multiplier': Decimal('1.1')},
        {'county_name': 'Machakos', 'cost_multiplier': Decimal('1.0')},
        {'county_name': 'Kajiado', 'cost_multiplier': Decimal('1.0')},
        {'county_name': 'Eldoret', 'cost_multiplier': Decimal('1.05')},
    ]
    
    count = 0
    for loc_data in locations:
        obj, created = Location.objects.get_or_create(
            county_name=loc_data['county_name'],
            defaults={'cost_multiplier': loc_data['cost_multiplier']}
        )
        if created:
            print(f'✓ Created location: {loc_data["county_name"]}')
            count += 1
        else:
            print(f'- Already exists: {loc_data["county_name"]}')
    
    print(f'\n✓ {count} new locations created')
    return count

if __name__ == '__main__':
    print("=" * 50)
    print("EMERGENCY DATABASE POPULATION")
    print("=" * 50)
    print()
    
    print("Current database state:")
    print(f"ProjectTypes count: {ProjectType.objects.count()}")
    print(f"Locations count: {Location.objects.count()}")
    print()
    
    print("=" * 50)
    print("Populating ProjectTypes...")
    print("=" * 50)
    pt_count = populate_project_types()
    
    print()
    print("=" * 50)
    print("Populating Locations...")
    print("=" * 50)
    loc_count = populate_locations()
    
    print()
    print("=" * 50)
    print("FINAL DATABASE STATE")
    print("=" * 50)
    print(f"Total ProjectTypes: {ProjectType.objects.count()}")
    print(f"Total Locations: {Location.objects.count()}")
    print()
    
    # List all ProjectTypes to verify Infrastructure exists
    print("All ProjectTypes in database:")
    for pt in ProjectType.objects.all().order_by('name'):
        print(f"  - {pt.name} ({pt.category})")
    
    print()
    print("✓ Database population complete!")
