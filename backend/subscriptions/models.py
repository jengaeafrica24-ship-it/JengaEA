from django.db import models
from django.core.validators import MinValueValidator
from accounts.models import User


class SubscriptionPlan(models.Model):
    """Model for subscription plans"""
    
    PLAN_TYPES = [
        ('free', 'Free Trial'),
        ('6months', '6 Months'),
        ('12months', '12 Months'),
        ('lifetime', 'Lifetime'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    description = models.TextField()
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='USD')
    duration_months = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Duration in months (null for lifetime)"
    )
    estimates_limit = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Maximum number of estimates (null for unlimited)"
    )
    features = models.JSONField(
        default=list,
        help_text="List of features included in this plan"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscription_plans'
        ordering = ['price']
        
    def __str__(self):
        return f"{self.name} - ${self.price}"


class UserSubscription(models.Model):
    """Model for user subscriptions"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
        ('pending', 'Pending Payment'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='user_subscriptions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Subscription dates
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    
    # Usage tracking
    estimates_used = models.PositiveIntegerField(default=0)
    estimates_limit = models.PositiveIntegerField(null=True, blank=True)
    
    # Payment information
    payment_reference = models.CharField(max_length=200, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Metadata
    auto_renew = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_subscriptions'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.email} - {self.plan.name} ({self.status})"
    
    @property
    def is_active(self):
        """Check if subscription is currently active"""
        if self.status != 'active':
            return False
        
        if self.plan.plan_type == 'lifetime':
            return True
            
        from django.utils import timezone
        return timezone.now() < self.end_date if self.end_date else False
    
    @property
    def estimates_remaining(self):
        """Get number of estimates remaining"""
        if self.estimates_limit is None:
            return None  # Unlimited
        return max(0, self.estimates_limit - self.estimates_used)


class PaymentTransaction(models.Model):
    """Model for payment transactions"""
    
    TRANSACTION_TYPES = [
        ('subscription', 'Subscription Payment'),
        ('upgrade', 'Plan Upgrade'),
        ('renewal', 'Subscription Renewal'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_transactions')
    subscription = models.ForeignKey(
        UserSubscription, 
        on_delete=models.CASCADE, 
        related_name='transactions',
        null=True,
        blank=True
    )
    
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_reference = models.CharField(max_length=200, unique=True)
    payment_method = models.CharField(max_length=50)
    
    # External payment provider details
    provider = models.CharField(max_length=50, default='stripe')  # stripe, paypal, etc.
    provider_transaction_id = models.CharField(max_length=200, blank=True)
    
    # Metadata
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_transactions'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.email} - {self.transaction_type} - ${self.amount} ({self.status})"


class UsageLog(models.Model):
    """Model for tracking user usage"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='usage_logs')
    subscription = models.ForeignKey(
        UserSubscription, 
        on_delete=models.CASCADE, 
        related_name='usage_logs'
    )
    
    action = models.CharField(max_length=50)  # 'estimate_created', 'report_generated', etc.
    resource_type = models.CharField(max_length=50)  # 'estimate', 'report', etc.
    resource_id = models.CharField(max_length=100, blank=True)
    
    # Usage details
    quantity_used = models.PositiveIntegerField(default=1)
    cost_impact = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'usage_logs'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.created_at.date()}"



