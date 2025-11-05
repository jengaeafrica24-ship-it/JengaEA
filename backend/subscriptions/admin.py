from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, PaymentTransaction, UsageLog


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'plan_type', 'price', 'currency', 'duration_months', 'estimates_limit', 'is_active')
    list_filter = ('plan_type', 'is_active', 'currency')
    search_fields = ('name', 'description')
    ordering = ['price']


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'status', 'start_date', 'end_date', 'estimates_used', 'is_active')
    list_filter = ('status', 'plan', 'auto_renew', 'start_date')
    search_fields = ('user__email', 'payment_reference')
    readonly_fields = ('estimates_used', 'created_at', 'updated_at')
    ordering = ['-created_at']


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'transaction_type', 'status', 'amount', 'currency', 'payment_reference', 'created_at')
    list_filter = ('transaction_type', 'status', 'provider', 'created_at')
    search_fields = ('user__email', 'payment_reference', 'provider_transaction_id')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ['-created_at']


@admin.register(UsageLog)
class UsageLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'subscription', 'action', 'resource_type', 'quantity_used', 'created_at')
    list_filter = ('action', 'resource_type', 'created_at')
    search_fields = ('user__email', 'resource_id')
    readonly_fields = ('created_at',)
    ordering = ['-created_at']



