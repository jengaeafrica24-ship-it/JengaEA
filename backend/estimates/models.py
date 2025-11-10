from django.db import models
from django.core.validators import MinValueValidator, FileExtensionValidator
from django.utils import timezone
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
        ('processing', 'Processing'),
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
    
    # Foreign Keys
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='estimates',
        help_text="User who created this estimate"
    )
    project_type = models.ForeignKey(
        ProjectType, 
        on_delete=models.CASCADE, 
        related_name='estimates', 
        null=True, 
        blank=True,
        help_text="Type of project (e.g., Residential, Commercial)"
    )
    location = models.ForeignKey(
        Location, 
        on_delete=models.CASCADE, 
        related_name='estimates', 
        null=True, 
        blank=True,
        help_text="Geographic location of the project"
    )
    project_template = models.ForeignKey(
        ProjectTemplate, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Template used for this estimate"
    )
    
    # Source and file management
    source = models.CharField(
        max_length=20, 
        default='manual', 
        help_text="How this estimate was created: manual, upload, or ai"
    )
    original_filename = models.CharField(
        max_length=255, 
        null=True, 
        blank=True, 
        help_text="Original uploaded filename if created via upload"
    )
    file_path = models.CharField(
        max_length=255, 
        null=True, 
        blank=True, 
        help_text="Storage path for uploaded file"
    )
    
    # Project details
    project_name = models.CharField(max_length=200, help_text="Name of the construction project")
    construction_type = models.CharField(
        max_length=20, 
        choices=PROJECT_TYPE_CHOICES, 
        default='new_construction',
        help_text="Type of construction work"
    )
    building_type = models.CharField(
        max_length=20, 
        choices=BUILDING_TYPE_CHOICES, 
        null=True, 
        blank=True,
        help_text="Category of building"
    )
    data_period = models.CharField(
        max_length=10, 
        choices=DATA_PERIOD_CHOICES, 
        default='Q1',
        help_text="Time period for cost data"
    )
    project_description = models.TextField(
        max_length=150, 
        blank=True, 
        help_text="Brief description of the project (max 150 characters)"
    )
    total_area = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        help_text="Total project area in square meters"
    )
    
    # Cost calculations
    base_cost_per_sqm = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Base construction cost per square meter"
    )
    location_multiplier = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=1.00,
        help_text="Location-based cost adjustment multiplier"
    )
    adjusted_cost_per_sqm = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Base cost adjusted for location"
    )
    total_estimated_cost = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0,
        help_text="Total estimated project cost"
    )
    
    # Additional costs
    contingency_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=10.00,
        help_text="Contingency percentage (default 10%)"
    )
    contingency_amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0,
        help_text="Calculated contingency amount"
    )
    
    # Status and metadata
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft',
        help_text="Current status of the estimate"
    )
    is_public = models.BooleanField(
        default=False,
        help_text="Whether this estimate is publicly visible"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Processing metadata (for async operations)
    task_id = models.CharField(
        max_length=36, 
        null=True, 
        blank=True, 
        help_text="Celery task ID for async processing"
    )
    processing_started_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When async processing started"
    )
    processing_completed_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When async processing completed"
    )
    processing_error = models.TextField(
        null=True, 
        blank=True,
        help_text="Error message if processing failed"
    )
    
    class Meta:
        db_table = 'estimates'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['project_type', '-created_at']),
        ]
        verbose_name = 'Estimate'
        verbose_name_plural = 'Estimates'
        
    def __str__(self):
        return f"{self.project_name} - {self.user.email} (KES {self.total_estimated_cost:,.2f})"
    
    def save(self, *args, **kwargs):
        """Override save to calculate derived fields"""
        # Set default base cost if not provided
        if self.base_cost_per_sqm is None:
            self.base_cost_per_sqm = Decimal('50000.00')  # 50,000 KES per sqm default
            
        # Ensure location multiplier is set
        if self.location_multiplier is None:
            self.location_multiplier = Decimal('1.00')
        
        # Convert to Decimal if needed to avoid type errors
        if self.base_cost_per_sqm is not None:
            self.base_cost_per_sqm = Decimal(str(self.base_cost_per_sqm))
        if self.location_multiplier is not None:
            self.location_multiplier = Decimal(str(self.location_multiplier))
            
        # Calculate adjusted cost per sqm
        self.adjusted_cost_per_sqm = self.base_cost_per_sqm * self.location_multiplier
        
        # Calculate total estimated cost if total_area is provided
        if self.total_area is not None and self.total_area > 0:
            total_area_decimal = Decimal(str(self.total_area))
            self.total_estimated_cost = self.adjusted_cost_per_sqm * total_area_decimal
        elif self.total_estimated_cost == 0:
            # If no area but we have items, sum them (handled by signal/method)
            pass
        
        # Ensure total_estimated_cost is Decimal
        if self.total_estimated_cost is not None:
            self.total_estimated_cost = Decimal(str(self.total_estimated_cost))
            
        # Calculate contingency amount
        if self.total_estimated_cost > 0 and self.contingency_percentage is not None:
            contingency_pct = Decimal(str(self.contingency_percentage))
            self.contingency_amount = (self.total_estimated_cost * contingency_pct) / Decimal('100')
        else:
            self.contingency_amount = Decimal('0.00')
            
        super().save(*args, **kwargs)
    
    @property
    def grand_total(self):
        """Total cost including contingency"""
        return self.total_estimated_cost + self.contingency_amount
    
    @property
    def is_ai_generated(self):
        """Check if this estimate was generated by AI"""
        return hasattr(self, 'ai_estimate') or hasattr(self, 'labor_estimate')
    
    @property
    def processing_duration(self):
        """Calculate processing duration if completed"""
        if self.processing_started_at and self.processing_completed_at:
            return self.processing_completed_at - self.processing_started_at
        return None


class EstimateItem(models.Model):
    """Individual line items in an estimate (materials, labor, equipment, etc.)"""
    
    CATEGORY_CHOICES = [
        ('material', 'Material'),
        ('labor', 'Labor'),
        ('equipment', 'Equipment'),
        ('overhead', 'Overhead'),
        ('other', 'Other'),
    ]
    
    estimate = models.ForeignKey(
        Estimate, 
        on_delete=models.CASCADE, 
        related_name='items',
        help_text="Parent estimate"
    )
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES,
        help_text="Item category"
    )
    name = models.CharField(
        max_length=200,
        help_text="Item name or description"
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed description of the item"
    )
    quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)],
        help_text="Quantity required"
    )
    unit = models.CharField(
        max_length=20,
        help_text="Unit of measurement (e.g., kg, m², hours)"
    )
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)],
        help_text="Price per unit"
    )
    total_price = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        help_text="Total price (quantity × unit price)"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes or specifications"
    )
    
    class Meta:
        db_table = 'estimate_items'
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['estimate', 'category']),
        ]
        verbose_name = 'Estimate Item'
        verbose_name_plural = 'Estimate Items'
        
    def __str__(self):
        return f"{self.name} - {self.estimate.project_name}"
    
    def save(self, *args, **kwargs):
        """Calculate total price before saving"""
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class EstimateRevision(models.Model):
    """Track changes and revisions to estimates"""
    
    estimate = models.ForeignKey(
        Estimate, 
        on_delete=models.CASCADE, 
        related_name='revisions',
        help_text="Estimate being revised"
    )
    revision_number = models.PositiveIntegerField(
        help_text="Sequential revision number"
    )
    changes_summary = models.TextField(
        help_text="Summary of changes made in this revision"
    )
    previous_total_cost = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        help_text="Total cost before this revision"
    )
    new_total_cost = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        help_text="Total cost after this revision"
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        help_text="User who created this revision"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'estimate_revisions'
        ordering = ['-created_at']
        unique_together = ['estimate', 'revision_number']
        indexes = [
            models.Index(fields=['estimate', '-revision_number']),
        ]
        verbose_name = 'Estimate Revision'
        verbose_name_plural = 'Estimate Revisions'
        
    def __str__(self):
        return f"Revision {self.revision_number} - {self.estimate.project_name}"
    
    @property
    def cost_change(self):
        """Calculate the change in cost"""
        return self.new_total_cost - self.previous_total_cost
    
    @property
    def cost_change_percentage(self):
        """Calculate percentage change in cost"""
        if self.previous_total_cost > 0:
            return ((self.new_total_cost - self.previous_total_cost) / self.previous_total_cost) * 100
        return Decimal('0.00')


class EstimateShare(models.Model):
    """Share estimates with external parties via secure links"""
    
    estimate = models.ForeignKey(
        Estimate, 
        on_delete=models.CASCADE, 
        related_name='shares',
        help_text="Estimate being shared"
    )
    shared_with_email = models.EmailField(
        help_text="Email address of recipient"
    )
    shared_with_name = models.CharField(
        max_length=200, 
        blank=True,
        help_text="Name of recipient"
    )
    access_token = models.CharField(
        max_length=100, 
        unique=True,
        help_text="Unique token for accessing shared estimate"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this share link is active"
    )
    expires_at = models.DateTimeField(
        help_text="When this share link expires"
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        help_text="User who created this share"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'estimate_shares'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['access_token']),
            models.Index(fields=['estimate', '-created_at']),
        ]
        verbose_name = 'Estimate Share'
        verbose_name_plural = 'Estimate Shares'
        
    def __str__(self):
        return f"Share: {self.estimate.project_name} → {self.shared_with_email}"
    
    @property
    def is_expired(self):
        """Check if share link has expired"""
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        """Check if share link is valid (active and not expired)"""
        return self.is_active and not self.is_expired


class AIEstimate(models.Model):
    """AI-generated comprehensive construction cost estimates"""
    
    estimate = models.OneToOneField(
        Estimate, 
        on_delete=models.CASCADE, 
        related_name='ai_estimate',
        help_text="Parent estimate record"
    )
    
    # Cost per square meter calculations
    base_cost_per_sqm = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Base cost per square meter"
    )
    location_multiplier = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Location adjustment factor"
    )
    adjusted_cost_per_sqm = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Adjusted cost per square meter"
    )
    
    # Detailed breakdowns (stored as JSON)
    materials_breakdown = models.JSONField(
        help_text="Detailed breakdown of material costs and quantities"
    )
    labor_breakdown = models.JSONField(
        help_text="Detailed breakdown of labor costs and hours"
    )
    equipment_details = models.JSONField(
        help_text="Equipment requirements and associated costs"
    )
    recommendations = models.JSONField(
        help_text="AI-generated recommendations for cost optimization"
    )
    risk_factors = models.JSONField(
        help_text="Identified risk factors that may impact costs"
    )
    
    # Confidence and quality metrics
    confidence_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="AI confidence score for the estimate (0-100)"
    )
    
    # Optional advanced features
    sustainability_metrics = models.JSONField(
        null=True, 
        blank=True, 
        help_text="Environmental impact and sustainability considerations"
    )
    timeline_impact = models.JSONField(
        null=True, 
        blank=True,
        help_text="Estimated timeline impacts of different choices"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_estimates'
        ordering = ['-created_at']
        verbose_name = 'AI Estimate'
        verbose_name_plural = 'AI Estimates'

    def __str__(self):
        return f"AI Estimate for {self.estimate.project_name}"

    @property
    def total_estimated_cost(self):
        """Calculate total cost based on adjusted cost per sqm and area"""
        if self.estimate.total_area:
            base_total = self.adjusted_cost_per_sqm * self.estimate.total_area
            return round(base_total, 2)
        return Decimal('0.00')


class LaborEstimate(models.Model):
    """AI-generated labor-specific cost estimates"""
    
    estimate = models.OneToOneField(
        Estimate, 
        on_delete=models.CASCADE, 
        related_name='labor_estimate',
        help_text="Parent estimate record"
    )
    
    # AI model information
    raw_response = models.JSONField(
        help_text="Complete raw response from AI model"
    )
    model_version = models.CharField(
        max_length=100, 
        help_text="AI model used for generation (e.g., gemini-2.0-flash-exp)"
    )
    
    # Structured labor cost data
    labor_roles = models.JSONField(
        help_text="List of labor roles with details (role, skill level, workers, duration, rates, costs)"
    )
    subtotal = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0,
        help_text="Subtotal of all labor costs before deductions"
    )
    statutory_deductions = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0,
        help_text="Statutory deductions and benefits (NSSF, NHIF, etc.)"
    )
    total_cost = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0,
        help_text="Total labor cost including deductions"
    )
    recommendations = models.JSONField(
        default=list, 
        help_text="AI-generated recommendations for workforce optimization"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'labor_estimates'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['estimate']),
            models.Index(fields=['-created_at']),
        ]
        verbose_name = 'Labor Estimate'
        verbose_name_plural = 'Labor Estimates'
    
    def __str__(self):
        return f"Labor Estimate for {self.estimate.project_name}"
    
    @property
    def total_workers(self):
        """Calculate total number of workers across all roles"""
        return sum(role.get('numberOfWorkers', 0) for role in self.labor_roles)
    
    @property
    def average_daily_rate(self):
        """Calculate average daily rate across all roles"""
        if not self.labor_roles:
            return Decimal('0.00')
        
        total_rate = sum(role.get('dailyRate', 0) for role in self.labor_roles)
        return Decimal(str(total_rate / len(self.labor_roles)))
    
    @property
    def deductions_percentage(self):
        """Calculate deductions as percentage of subtotal"""
        if self.subtotal > 0:
            return (self.statutory_deductions / self.subtotal) * 100
        return Decimal('0.00')