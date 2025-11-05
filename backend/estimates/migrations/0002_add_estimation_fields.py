from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('estimates', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='estimate',
            name='construction_type',
            field=models.CharField(
                choices=[('new_construction', 'New Construction'), ('repair', 'Repair')],
                default='new_construction',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='estimate',
            name='building_type',
            field=models.CharField(
                choices=[('residential', 'Residential'), ('commercial', 'Commercial'), 
                        ('infrastructure', 'Infrastructure'), ('industrial', 'Industrial')],
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='estimate',
            name='data_period',
            field=models.CharField(
                choices=[('3months', '3 Months'), ('6months', '6 Months'),
                        ('9months', '9 Months'), ('12months', '12 Months')],
                default='3months',
                max_length=10
            ),
        ),
        migrations.AlterField(
            model_name='estimate',
            name='project_description',
            field=models.TextField(blank=True, help_text='Limited to 150 characters', max_length=150),
        ),
    ]