from rest_framework import serializers
from .models import SubscriptionPlan, UserSubscription, PaymentTransaction, UsageLog


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Serializer for subscription plans"""
    
    class Meta:
        model = SubscriptionPlan
        fields = (
            'id', 'name', 'plan_type', 'description', 'price', 'currency',
            'duration_months', 'estimates_limit', 'features', 'is_active'
        )


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for user subscriptions"""
    
    plan_data = SubscriptionPlanSerializer(source='plan', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    estimates_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = (
            'id', 'plan', 'plan_data', 'status', 'start_date', 'end_date',
            'estimates_used', 'estimates_limit', 'estimates_remaining',
            'is_active', 'auto_renew', 'created_at', 'updated_at'
        )
        read_only_fields = ('estimates_used', 'created_at', 'updated_at')


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Serializer for payment transactions"""
    
    class Meta:
        model = PaymentTransaction
        fields = (
            'id', 'subscription', 'transaction_type', 'status', 'amount',
            'currency', 'payment_reference', 'payment_method', 'provider',
            'provider_transaction_id', 'description', 'created_at'
        )
        read_only_fields = ('created_at',)


class UsageLogSerializer(serializers.ModelSerializer):
    """Serializer for usage logs"""
    
    class Meta:
        model = UsageLog
        fields = (
            'id', 'subscription', 'action', 'resource_type', 'resource_id',
            'quantity_used', 'cost_impact', 'created_at'
        )
        read_only_fields = ('created_at',)


class SubscriptionCreateSerializer(serializers.Serializer):
    """Serializer for creating subscriptions"""
    
    plan_id = serializers.IntegerField()
    payment_method = serializers.CharField(max_length=50)
    auto_renew = serializers.BooleanField(default=False)


class SubscriptionUpgradeSerializer(serializers.Serializer):
    """Serializer for upgrading subscriptions"""
    
    new_plan_id = serializers.IntegerField()
    payment_method = serializers.CharField(max_length=50)


class PaymentWebhookSerializer(serializers.Serializer):
    """Serializer for payment webhooks"""
    
    event_type = serializers.CharField()
    payment_reference = serializers.CharField()
    status = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=3)
    metadata = serializers.JSONField(required=False)



