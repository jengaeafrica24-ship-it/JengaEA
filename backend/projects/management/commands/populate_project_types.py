from django.core.management.base import BaseCommand
from projects.models import ProjectType
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populate initial project types'

    def handle(self, *args, **kwargs):
        project_types = [
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

        for pt_data in project_types:
            ProjectType.objects.get_or_create(
                name=pt_data['name'],
                defaults={
                    'category': pt_data['category'],
                    'description': pt_data['description'],
                    'base_cost_per_sqm': pt_data['base_cost_per_sqm']
                }
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created project type: {pt_data["name"]}')
            )