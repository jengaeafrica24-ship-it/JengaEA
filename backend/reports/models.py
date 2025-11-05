from django.db import models
from accounts.models import User
from estimates.models import Estimate


class Report(models.Model):
    """Model for generated reports"""
    
    REPORT_TYPES = [
        ('estimate', 'Cost Estimate'),
        ('comparison', 'Project Comparison'),
        ('summary', 'Summary Report'),
        ('detailed', 'Detailed Breakdown'),
    ]
    
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    estimate = models.ForeignKey(Estimate, on_delete=models.CASCADE, related_name='reports')
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    
    # Report details
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # File information
    file_path = models.CharField(max_length=500)
    file_size = models.PositiveIntegerField(null=True, blank=True)
    download_count = models.PositiveIntegerField(default=0)
    
    # Sharing
    is_public = models.BooleanField(default=False)
    share_token = models.CharField(max_length=100, unique=True, blank=True)
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'reports'
        ordering = ['-generated_at']
        
    def __str__(self):
        return f"{self.title} - {self.user.email}"


class ReportTemplate(models.Model):
    """Model for report templates"""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    template_type = models.CharField(max_length=20, choices=Report.REPORT_TYPES)
    format = models.CharField(max_length=10, choices=Report.FORMAT_CHOICES)
    
    # Template content
    header_template = models.TextField(blank=True)
    body_template = models.TextField(blank=True)
    footer_template = models.TextField(blank=True)
      
    # Styling
    styles = models.JSONField(default=dict)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'report_templates'
        
    def __str__(self):
        return f"{self.name} ({self.get_format_display()})"


class ReportShare(models.Model):
    """Model for sharing reports"""
    
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='shares')
    shared_with_email = models.EmailField()
    shared_with_name = models.CharField(max_length=200, blank=True)
    access_token = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'report_shares'
        
    def __str__(self):
        return f"Share: {self.report.title} -> {self.shared_with_email}"



