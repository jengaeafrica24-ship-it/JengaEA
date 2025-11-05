from django.db import models
from django.core.validators import MinValueValidator, FileExtensionValidator
from accounts.models import User
from projects.models import ProjectType, Location, ProjectTemplate
from decimal import Decimal


class Estimate(models.Model):
    """Model for construction cost estimates"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processing', 'Processing'),  # For file upload processing
    ]
    
    PROJECT_TYPE_CHOICES = [
        ('new_construction', 'New Construction'),
        ('repair', 'Repair'),
    ]
    
    BUILDING_TYPE_CHOICES = [
        ('residential', 'Residential'),
        ('commercial', 'Commercial'),
        ('infrastructure', 'Infrastructure'),
        ('industrial', 'Industrial'),
    ]
    
    DATA_PERIOD_CHOICES = [
        ('Q1', 'Q1 (Quarter 1)'),
        ('Q2', 'Q2 (Quarter 2)'),
        ('Q3', 'Q3 (Quarter 3)'),
        ('Q4', 'Q4 (Quarter 4)'),
        ('3months', '3 Months'),
        ('6months', '6 Months'),
        ('9months', '9 Months'),
        ('12months', '12 Months'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='estimates')
    project_type = models.ForeignKey(ProjectType, on_delete=models.CASCADE, related_name='estimates', null=True, blank=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='estimates', null=True, blank=True)
    project_template = models.ForeignKey(ProjectTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Source and file management
    source = models.CharField(max_length=20, default='manual', help_text="How this estimate was created: manual or upload")
    original_filename = models.CharField(max_length=255, null=True, blank=True, help_text="Original uploaded filename if created via upload")
    file_path = models.CharField(max_length=255, null=True, blank=True, help_text="Storage path for uploaded file")
    
    # Project details
    project_name = models.CharField(max_length=200)
    construction_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES, default='new_construction')
    building_type = models.CharField(max_length=20, choices=BUILDING_TYPE_CHOICES, null=True, blank=True)
    data_period = models.CharField(max_length=10, choices=DATA_PERIOD_CHOICES, default='Q1')
    project_description = models.TextField(max_length=150, blank=True, help_text="Limited to 150 characters")
    total_area = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Total area in square meters",
        null=True,
        blank=True
    )
    
    # Cost calculations
    base_cost_per_sqm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location_multiplier = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    adjusted_cost_per_sqm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_estimated_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Additional costs
    contingency_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=10.00,
        help_text="Contingency percentage (default 10%)"
    )
    contingency_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Processing metadata
    task_id = models.CharField(max_length=36, null=True, blank=True, help_text="Celery task ID for async processing")
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    processing_error = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'estimates'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.project_name} - {self.user.email} (${self.total_estimated_cost})"
    
    def save(self, *args, **kwargs):
        # Set default base cost if not provided
        if self.base_cost_per_sqm is None:
            # Default base cost per square meter (you can adjust this value)
            self.base_cost_per_sqm = 50000.00  # 50,000 KES per sqm default
            
        # Ensure location multiplier is set
        if self.location_multiplier is None:
            self.location_multiplier = 1.00
            
        # Calculate adjusted cost per sqm
        self.adjusted_cost_per_sqm = float(self.base_cost_per_sqm) * float(self.location_multiplier)
        
        # Calculate total estimated cost if total_area is provided
        if self.total_area is not None:
            self.total_estimated_cost = float(self.adjusted_cost_per_sqm) * float(self.total_area)
        else:
            self.total_estimated_cost = 0
            
        # Calculate contingency amount
        if self.total_estimated_cost > 0 and self.contingency_percentage is not None:
            self.contingency_amount = (float(self.total_estimated_cost) * float(self.contingency_percentage)) / 100
        else:
            self.contingency_amount = 0
            
        super().save(*args, **kwargs)


class EstimateItem(models.Model):
    """Model for individual items in an estimate"""
    
    CATEGORY_CHOICES = [
        ('material', 'Material'),
        ('labor', 'Labor'),
        ('equipment', 'Equipment'),
        ('overhead', 'Overhead'),
        ('other', 'Other'),
    ]
    
    estimate = models.ForeignKey(Estimate, on_delete=models.CASCADE, related_name='items')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=20)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    total_price = models.DecimalField(max_digits=15, decimal_places=2)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'estimate_items'
        ordering = ['category', 'name']
        
    def __str__(self):
        return f"{self.name} - {self.estimate.project_name}"
    
    def save(self, *args, **kwargs):
        # Calculate total price
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class EstimateRevision(models.Model):
    """Model for tracking estimate revisions"""
    
    estimate = models.ForeignKey(Estimate, on_delete=models.CASCADE, related_name='revisions')
    revision_number = models.PositiveIntegerField()
    changes_summary = models.TextField()
    previous_total_cost = models.DecimalField(max_digits=15, decimal_places=2)
    new_total_cost = models.DecimalField(max_digits=15, decimal_places=2)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'estimate_revisions'
        ordering = ['-created_at']
        unique_together = ['estimate', 'revision_number']
        
    def __str__(self):
        return f"Revision {self.revision_number} - {self.estimate.project_name}"


class EstimateShare(models.Model):
    """Model for sharing estimates with others"""
    
    estimate = models.ForeignKey(Estimate, on_delete=models.CASCADE, related_name='shares')
    shared_with_email = models.EmailField()
    shared_with_name = models.CharField(max_length=200, blank=True)
    access_token = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'estimate_shares'
        
    def __str__(self):
        return f"Share: {self.estimate.project_name} -> {self.shared_with_email}"


class AIEstimate(models.Model):
    """Model for AI-generated construction cost estimates"""
    
    estimate = models.OneToOneField(Estimate, on_delete=models.CASCADE, related_name='ai_estimate')
    base_cost_per_sqm = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    location_multiplier = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    adjusted_cost_per_sqm = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    
    # Detailed breakdowns stored as JSON
    materials_breakdown = models.JSONField(help_text="Detailed breakdown of material costs and quantities")
    labor_breakdown = models.JSONField(help_text="Detailed breakdown of labor costs and hours")
    equipment_details = models.JSONField(help_text="Equipment requirements and associated costs")
    recommendations = models.JSONField(help_text="AI-generated recommendations for cost optimization")
    risk_factors = models.JSONField(help_text="Identified risk factors that may impact costs")
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))],
                                        help_text="AI confidence score for the estimate (0-100)")
    
    sustainability_metrics = models.JSONField(null=True, blank=True, 
                                           help_text="Environmental impact and sustainability considerations")
    timeline_impact = models.JSONField(null=True, blank=True,
                                     help_text="Estimated timeline impacts of different choices")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_estimates'
        ordering = ['-created_at']

    def __str__(self):
        return f"AI Estimate for {self.estimate.project_name}"

    @property
    def total_estimated_cost(self):
        """Calculate total cost based on all factors"""
        base_total = self.adjusted_cost_per_sqm * self.estimate.total_area
        return round(base_total, 2)
