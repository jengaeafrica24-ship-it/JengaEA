from django.db import models
from accounts.models import User

class ExcelTemplate(models.Model):
    """Model for storing construction cost Excel templates"""
    TEMPLATE_TYPES = [
        ('residential', 'Residential Construction'),
        ('commercial', 'Commercial Construction'),
        ('infrastructure', 'Infrastructure'),
        ('industrial', 'Industrial Construction'),
    ]
    
    name = models.CharField(max_length=200)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    file = models.FileField(upload_to='excel_templates/')
    description = models.TextField(blank=True)
    base_currency = models.CharField(max_length=3, default='USD')
    includes_labor = models.BooleanField(default=True)
    includes_materials = models.BooleanField(default=True)
    includes_equipment = models.BooleanField(default=True)
    location_based = models.BooleanField(default=True)
    seasonal_adjustment = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Construction Cost Template'
        verbose_name_plural = 'Construction Cost Templates'

    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"

class GeneratedData(models.Model):
    """Model for storing generated data based on templates"""
    QUOTA_CHOICES = [
        ('Q1', 'First Quarter'),
        ('Q2', 'Second Quarter'),
        ('Q3', 'Third Quarter'),
        ('Q4', 'Fourth Quarter'),
    ]

    template = models.ForeignKey(ExcelTemplate, on_delete=models.CASCADE)
    quota_period = models.CharField(max_length=2, choices=QUOTA_CHOICES)
    year = models.IntegerField()
    generated_file = models.FileField(upload_to='generated_data/')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['template', 'quota_period', 'year']
        ordering = ['year', 'quota_period']

    def __str__(self):
        return f"{self.template.name} - {self.year} {self.quota_period}"