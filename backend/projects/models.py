from django.db import models
from django.core.validators import MinValueValidator


class ProjectType(models.Model):
    """Model for different types of construction projects"""
    
    CATEGORY_CHOICES = [
        ('residential', 'Residential'),
        ('commercial', 'Commercial'),
        ('infrastructure', 'Infrastructure'),
        ('industrial', 'Industrial'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    base_cost_per_sqm = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Base cost per square meter in KES"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_types'
        ordering = ['category', 'name']
        
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class MaterialCategory(models.Model):
    """Model for material categories"""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'material_categories'
        verbose_name_plural = 'Material Categories'
        
    def __str__(self):
        return self.name


class Material(models.Model):
    """Model for construction materials"""
    
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('m', 'Meter'),
        ('m2', 'Square Meter'),
        ('m3', 'Cubic Meter'),
        ('piece', 'Piece'),
        ('bag', 'Bag'),
        ('ton', 'Ton'),
        ('litre', 'Litre'),
    ]
    
    name = models.CharField(max_length=200)
    category = models.ForeignKey(MaterialCategory, on_delete=models.CASCADE, related_name='materials')
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'materials'
        unique_together = ['name', 'category']
        
    def __str__(self):
        return f"{self.name} ({self.unit})"


class Location(models.Model):
    """Model for Kenyan counties with pricing variations"""
    
    COUNTY_CHOICES = [
        ('001', 'Mombasa'),
        ('002', 'Kwale'),
        ('003', 'Kilifi'),
        ('004', 'Tana River'),
        ('005', 'Lamu'),
        ('006', 'Taita-Taveta'),
        ('007', 'Garissa'),
        ('008', 'Wajir'),
        ('009', 'Mandera'),
        ('010', 'Marsabit'),
        ('011', 'Isiolo'),
        ('012', 'Meru'),
        ('013', 'Tharaka-Nithi'),
        ('014', 'Embu'),
        ('015', 'Kitui'),
        ('016', 'Machakos'),
        ('017', 'Makueni'),
        ('018', 'Nyandarua'),
        ('019', 'Nyeri'),
        ('020', 'Kirinyaga'),
        ('021', 'Murang\'a'),
        ('022', 'Kiambu'),
        ('023', 'Turkana'),
        ('024', 'West Pokot'),
        ('025', 'Samburu'),
        ('026', 'Trans-Nzoia'),
        ('027', 'Uasin Gishu'),
        ('028', 'Elgeyo-Marakwet'),
        ('029', 'Nandi'),
        ('030', 'Baringo'),
        ('031', 'Laikipia'),
        ('032', 'Nakuru'),
        ('033', 'Narok'),
        ('034', 'Kajiado'),
        ('035', 'Kericho'),
        ('036', 'Bomet'),
        ('037', 'Kakamega'),
        ('038', 'Vihiga'),
        ('039', 'Bungoma'),
        ('040', 'Busia'),
        ('041', 'Siaya'),
        ('042', 'Kisumu'),
        ('043', 'Homa Bay'),
        ('044', 'Migori'),
        ('045', 'Kisii'),
        ('046', 'Nyamira'),
        ('047', 'Nairobi'),
    ]
    
    county_code = models.CharField(max_length=3, choices=COUNTY_CHOICES, unique=True)
    county_name = models.CharField(max_length=100)
    region = models.CharField(
        max_length=50,
        help_text="Region (e.g., Central, Rift Valley, Western, etc.)"
    )
    major_towns = models.TextField(
        blank=True,
        help_text="Comma-separated list of major towns in the county"
    )
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    cost_multiplier = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=1.00,
        help_text="Multiplier for cost adjustment (1.00 = base price, 1.2 = 20% more expensive)"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'locations'
        ordering = ['county_code']
        verbose_name = 'County'
        verbose_name_plural = 'Counties'
        
    def __str__(self):
        return f"{self.county_name} ({self.county_code})"
    
    def get_county_display(self):
        """Get the full county name from the code"""
        return dict(self.COUNTY_CHOICES).get(self.county_code, self.county_name)


class MaterialPrice(models.Model):
    """Model for material prices by county"""
    
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='prices')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='material_prices')
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price in KES"
    )
    currency = models.CharField(max_length=3, default='KES')
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'material_prices'
        unique_together = ['material', 'location']
        indexes = [
            models.Index(fields=['material', 'location']),
            models.Index(fields=['is_active', 'last_updated']),
        ]
        
    def __str__(self):
        return f"{self.material.name} - {self.location.county_name}: KES {self.price}/{self.material.unit}"


class LaborCategory(models.Model):
    """Model for labor categories"""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    skill_level = models.CharField(
        max_length=20,
        choices=[
            ('unskilled', 'Unskilled'),
            ('semi_skilled', 'Semi-Skilled'),
            ('skilled', 'Skilled'),
            ('professional', 'Professional'),
        ],
        default='skilled'
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'labor_categories'
        verbose_name_plural = 'Labor Categories'
        ordering = ['name']
        
    def __str__(self):
        return f"{self.name} ({self.get_skill_level_display()})"


class LaborPrice(models.Model):
    """Model for labor prices by county"""
    
    category = models.ForeignKey(LaborCategory, on_delete=models.CASCADE, related_name='prices')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='labor_prices')
    daily_rate = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Daily rate in KES"
    )
    currency = models.CharField(max_length=3, default='KES')
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'labor_prices'
        unique_together = ['category', 'location']
        indexes = [
            models.Index(fields=['category', 'location']),
            models.Index(fields=['is_active', 'last_updated']),
        ]
        
    def __str__(self):
        return f"{self.category.name} - {self.location.county_name}: KES {self.daily_rate}/day"


class ProjectTemplate(models.Model):
    """Model for project templates with standard specifications"""
    
    project_type = models.ForeignKey(ProjectType, on_delete=models.CASCADE, related_name='templates')
    name = models.CharField(max_length=200)
    description = models.TextField()
    total_area = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Total area in square meters"
    )
    specifications = models.JSONField(
        default=dict,
        help_text="JSON field containing material quantities and specifications"
    )
    estimated_duration_days = models.IntegerField(
        null=True,
        blank=True,
        help_text="Estimated project duration in days"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_templates'
        ordering = ['project_type', 'name']
        
    def __str__(self):
        return f"{self.name} - {self.project_type.name}"