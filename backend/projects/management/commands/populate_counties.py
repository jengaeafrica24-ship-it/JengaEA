from django.core.management.base import BaseCommand
from projects.models import Location


class Command(BaseCommand):
    help = 'Populate all 47 Kenyan counties with their details'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing counties before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing counties...')
            Location.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing counties cleared'))

        counties_data = [
            # Coast Region
            {
                'county_code': '001',
                'county_name': 'Mombasa',
                'region': 'Coast',
                'major_towns': 'Mombasa, Likoni, Changamwe',
                'latitude': -4.0435,
                'longitude': 39.6682,
                'cost_multiplier': 1.15,
            },
            {
                'county_code': '002',
                'county_name': 'Kwale',
                'region': 'Coast',
                'major_towns': 'Kwale, Ukunda, Msambweni',
                'latitude': -4.1820,
                'longitude': 39.4604,
                'cost_multiplier': 1.05,
            },
            {
                'county_code': '003',
                'county_name': 'Kilifi',
                'region': 'Coast',
                'major_towns': 'Kilifi, Malindi, Watamu',
                'latitude': -3.6309,
                'longitude': 39.8492,
                'cost_multiplier': 1.10,
            },
            {
                'county_code': '004',
                'county_name': 'Tana River',
                'region': 'Coast',
                'major_towns': 'Hola, Garsen, Bura',
                'latitude': -1.5225,
                'longitude': 39.8875,
                'cost_multiplier': 0.90,
            },
            {
                'county_code': '005',
                'county_name': 'Lamu',
                'region': 'Coast',
                'major_towns': 'Lamu, Mpeketoni, Witu',
                'latitude': -2.2717,
                'longitude': 40.9020,
                'cost_multiplier': 1.05,
            },
            {
                'county_code': '006',
                'county_name': 'Taita-Taveta',
                'region': 'Coast',
                'major_towns': 'Voi, Wundanyi, Taveta',
                'latitude': -3.3157,
                'longitude': 38.4858,
                'cost_multiplier': 1.00,
            },
            
            # North Eastern Region
            {
                'county_code': '007',
                'county_name': 'Garissa',
                'region': 'North Eastern',
                'major_towns': 'Garissa, Dadaab, Masalani',
                'latitude': -0.4569,
                'longitude': 39.6582,
                'cost_multiplier': 0.85,
            },
            {
                'county_code': '008',
                'county_name': 'Wajir',
                'region': 'North Eastern',
                'major_towns': 'Wajir, Habaswein, Buna',
                'latitude': 1.7471,
                'longitude': 40.0571,
                'cost_multiplier': 0.85,
            },
            {
                'county_code': '009',
                'county_name': 'Mandera',
                'region': 'North Eastern',
                'major_towns': 'Mandera, Rhamu, Elwak',
                'latitude': 3.9366,
                'longitude': 41.8669,
                'cost_multiplier': 0.85,
            },
            
            # Eastern Region
            {
                'county_code': '010',
                'county_name': 'Marsabit',
                'region': 'Eastern',
                'major_towns': 'Marsabit, Moyale, Loiyangalani',
                'latitude': 2.3284,
                'longitude': 37.9891,
                'cost_multiplier': 0.90,
            },
            {
                'county_code': '011',
                'county_name': 'Isiolo',
                'region': 'Eastern',
                'major_towns': 'Isiolo, Garbatulla, Merti',
                'latitude': 0.3556,
                'longitude': 37.5843,
                'cost_multiplier': 0.95,
            },
            {
                'county_code': '012',
                'county_name': 'Meru',
                'region': 'Eastern',
                'major_towns': 'Meru, Maua, Timau',
                'latitude': 0.0469,
                'longitude': 37.6528,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '013',
                'county_name': 'Tharaka-Nithi',
                'region': 'Eastern',
                'major_towns': 'Chuka, Kathwana, Marimanti',
                'latitude': -0.3762,
                'longitude': 37.6528,
                'cost_multiplier': 0.95,
            },
            {
                'county_code': '014',
                'county_name': 'Embu',
                'region': 'Eastern',
                'major_towns': 'Embu, Siakago, Runyenjes',
                'latitude': -0.5373,
                'longitude': 37.4570,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '015',
                'county_name': 'Kitui',
                'region': 'Eastern',
                'major_towns': 'Kitui, Mwingi, Mutomo',
                'latitude': -1.3669,
                'longitude': 38.0106,
                'cost_multiplier': 0.90,
            },
            {
                'county_code': '016',
                'county_name': 'Machakos',
                'region': 'Eastern',
                'major_towns': 'Machakos, Kangundo, Athi River',
                'latitude': -1.5177,
                'longitude': 37.2634,
                'cost_multiplier': 1.05,
            },
            {
                'county_code': '017',
                'county_name': 'Makueni',
                'region': 'Eastern',
                'major_towns': 'Wote, Makindu, Kibwezi',
                'latitude': -2.0906,
                'longitude': 37.6223,
                'cost_multiplier': 0.95,
            },
            
            # Central Region
            {
                'county_code': '018',
                'county_name': 'Nyandarua',
                'region': 'Central',
                'major_towns': 'Ol Kalou, Nyahururu, Engineer',
                'latitude': -0.1808,
                'longitude': 36.4644,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '019',
                'county_name': 'Nyeri',
                'region': 'Central',
                'major_towns': 'Nyeri, Karatina, Othaya',
                'latitude': -0.4197,
                'longitude': 36.9475,
                'cost_multiplier': 1.05,
            },
            {
                'county_code': '020',
                'county_name': 'Kirinyaga',
                'region': 'Central',
                'major_towns': 'Kerugoya, Kutus, Baricho',
                'latitude': -0.6589,
                'longitude': 37.3831,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '021',
                'county_name': "Murang'a",
                'region': 'Central',
                'major_towns': "Murang'a, Kenol, Kangema",
                'latitude': -0.7833,
                'longitude': 37.0000,
                'cost_multiplier': 1.05,
            },
            {
                'county_code': '022',
                'county_name': 'Kiambu',
                'region': 'Central',
                'major_towns': 'Kiambu, Thika, Ruiru, Limuru',
                'latitude': -1.0317,
                'longitude': 36.8350,
                'cost_multiplier': 1.15,
            },
            
            # Rift Valley Region
            {
                'county_code': '023',
                'county_name': 'Turkana',
                'region': 'Rift Valley',
                'major_towns': 'Lodwar, Kakuma, Kalokol',
                'latitude': 3.1192,
                'longitude': 35.5973,
                'cost_multiplier': 0.85,
            },
            {
                'county_code': '024',
                'county_name': 'West Pokot',
                'region': 'Rift Valley',
                'major_towns': 'Kapenguria, Makutano, Sigor',
                'latitude': 1.6208,
                'longitude': 35.1122,
                'cost_multiplier': 0.90,
            },
            {
                'county_code': '025',
                'county_name': 'Samburu',
                'region': 'Rift Valley',
                'major_towns': 'Maralal, Baragoi, Wamba',
                'latitude': 1.2153,
                'longitude': 36.9899,
                'cost_multiplier': 0.90,
            },
            {
                'county_code': '026',
                'county_name': 'Trans-Nzoia',
                'region': 'Rift Valley',
                'major_towns': 'Kitale, Endebess, Kiminini',
                'latitude': 1.0152,
                'longitude': 34.9503,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '027',
                'county_name': 'Uasin Gishu',
                'region': 'Rift Valley',
                'major_towns': 'Eldoret, Burnt Forest, Turbo',
                'latitude': 0.5199,
                'longitude': 35.2698,
                'cost_multiplier': 1.10,
            },
            {
                'county_code': '028',
                'county_name': 'Elgeyo-Marakwet',
                'region': 'Rift Valley',
                'major_towns': 'Iten, Kapsowar, Chepkorio',
                'latitude': 0.9999,
                'longitude': 35.4692,
                'cost_multiplier': 0.95,
            },
            {
                'county_code': '029',
                'county_name': 'Nandi',
                'region': 'Rift Valley',
                'major_towns': 'Kapsabet, Mosoriot, Nandi Hills',
                'latitude': 0.1832,
                'longitude': 35.1286,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '030',
                'county_name': 'Baringo',
                'region': 'Rift Valley',
                'major_towns': 'Kabarnet, Marigat, Eldama Ravine',
                'latitude': 0.8213,
                'longitude': 36.0839,
                'cost_multiplier': 0.95,
            },
            {
                'county_code': '031',
                'county_name': 'Laikipia',
                'region': 'Rift Valley',
                'major_towns': 'Nanyuki, Nyahururu, Rumuruti',
                'latitude': 0.3556,
                'longitude': 36.7820,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '032',
                'county_name': 'Nakuru',
                'region': 'Rift Valley',
                'major_towns': 'Nakuru, Naivasha, Gilgil',
                'latitude': -0.3031,
                'longitude': 36.0800,
                'cost_multiplier': 1.10,
            },
            {
                'county_code': '033',
                'county_name': 'Narok',
                'region': 'Rift Valley',
                'major_towns': 'Narok, Kilgoris, Suswa',
                'latitude': -1.0833,
                'longitude': 35.8711,
                'cost_multiplier': 0.95,
            },
            {
                'county_code': '034',
                'county_name': 'Kajiado',
                'region': 'Rift Valley',
                'major_towns': 'Kajiado, Ngong, Kitengela',
                'latitude': -2.0978,
                'longitude': 36.7820,
                'cost_multiplier': 1.10,
            },
            {
                'county_code': '035',
                'county_name': 'Kericho',
                'region': 'Rift Valley',
                'major_towns': 'Kericho, Litein, Londiani',
                'latitude': -0.3677,
                'longitude': 35.2839,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '036',
                'county_name': 'Bomet',
                'region': 'Rift Valley',
                'major_towns': 'Bomet, Sotik, Longisa',
                'latitude': -0.8008,
                'longitude': 35.3089,
                'cost_multiplier': 0.95,
            },
            
            # Western Region
            {
                'county_code': '037',
                'county_name': 'Kakamega',
                'region': 'Western',
                'major_towns': 'Kakamega, Mumias, Malava',
                'latitude': 0.2827,
                'longitude': 34.7519,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '038',
                'county_name': 'Vihiga',
                'region': 'Western',
                'major_towns': 'Mbale, Hamisi, Luanda',
                'latitude': 0.0668,
                'longitude': 34.7055,
                'cost_multiplier': 0.95,
            },
            {
                'county_code': '039',
                'county_name': 'Bungoma',
                'region': 'Western',
                'major_towns': 'Bungoma, Webuye, Kimilili',
                'latitude': 0.5635,
                'longitude': 34.5608,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '040',
                'county_name': 'Busia',
                'region': 'Western',
                'major_towns': 'Busia, Malaba, Butula',
                'latitude': 0.4608,
                'longitude': 34.1112,
                'cost_multiplier': 0.95,
            },
            
            # Nyanza Region
            {
                'county_code': '041',
                'county_name': 'Siaya',
                'region': 'Nyanza',
                'major_towns': 'Siaya, Bondo, Yala',
                'latitude': 0.0617,
                'longitude': 34.2880,
                'cost_multiplier': 0.95,
            },
            {
                'county_code': '042',
                'county_name': 'Kisumu',
                'region': 'Nyanza',
                'major_towns': 'Kisumu, Ahero, Maseno',
                'latitude': -0.0917,
                'longitude': 34.7680,
                'cost_multiplier': 1.10,
            },
            {
                'county_code': '043',
                'county_name': 'Homa Bay',
                'region': 'Nyanza',
                'major_towns': 'Homa Bay, Mbita, Ndhiwa',
                'latitude': -0.5273,
                'longitude': 34.4571,
                'cost_multiplier': 0.95,
            },
            {
                'county_code': '044',
                'county_name': 'Migori',
                'region': 'Nyanza',
                'major_towns': 'Migori, Awendo, Rongo',
                'latitude': -1.0634,
                'longitude': 34.4731,
                'cost_multiplier': 0.95,
            },
            {
                'county_code': '045',
                'county_name': 'Kisii',
                'region': 'Nyanza',
                'major_towns': 'Kisii, Ogembo, Keroka',
                'latitude': -0.6817,
                'longitude': 34.7680,
                'cost_multiplier': 1.00,
            },
            {
                'county_code': '046',
                'county_name': 'Nyamira',
                'region': 'Nyanza',
                'major_towns': 'Nyamira, Keroka, Nyansiongo',
                'latitude': -0.5669,
                'longitude': 34.9344,
                'cost_multiplier': 0.95,
            },
            
            # Nairobi Region
            {
                'county_code': '047',
                'county_name': 'Nairobi',
                'region': 'Nairobi',
                'major_towns': 'Nairobi CBD, Westlands, Karen, Embakasi',
                'latitude': -1.2864,
                'longitude': 36.8172,
                'cost_multiplier': 1.25,
            },
        ]

        created_count = 0
        updated_count = 0

        for county_data in counties_data:
            county, created = Location.objects.update_or_create(
                county_code=county_data['county_code'],
                defaults=county_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created: {county.county_name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated: {county.county_name}')
                )

        self.stdout.write('\n' + '='*50)
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully populated {len(counties_data)} counties!'
            )
        )
        self.stdout.write(f'Created: {created_count}')
        self.stdout.write(f'Updated: {updated_count}')
        self.stdout.write('='*50 + '\n')