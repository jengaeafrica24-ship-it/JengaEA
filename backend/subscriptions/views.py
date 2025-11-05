from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import SubscriptionPlan, UserSubscription, PaymentTransaction, UsageLog
from .serializers import (
    SubscriptionPlanSerializer, UserSubscriptionSerializer, PaymentTransactionSerializer,
    UsageLogSerializer, SubscriptionCreateSerializer, SubscriptionUpgradeSerializer
)


class SubscriptionPlanListView(generics.ListAPIView):
    """List all available subscription plans"""
    
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = []


class UserSubscriptionListView(generics.ListCreateAPIView):
    """List user subscriptions and create new ones"""
    
    serializer_class = UserSubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = SubscriptionCreateSerializer(data=request.data)
        if serializer.is_valid():
            plan = get_object_or_404(SubscriptionPlan, id=serializer.validated_data['plan_id'])
            user = request.user
            
            # Create subscription
            start_date = timezone.now()
            end_date = None
            
            if plan.plan_type != 'lifetime':
                duration_months = plan.duration_months or 6
                end_date = start_date + timedelta(days=duration_months * 30)
            
            subscription = UserSubscription.objects.create(
                user=user,
                plan=plan,
                start_date=start_date,
                end_date=end_date,
                estimates_limit=plan.estimates_limit,
                payment_method=serializer.validated_data['payment_method'],
                auto_renew=serializer.validated_data['auto_renew']
            )
            
            # Create payment transaction
            payment_ref = str(uuid.uuid4())
            PaymentTransaction.objects.create(
                user=user,
                subscription=subscription,
                transaction_type='subscription',
                amount=plan.price,
                currency=plan.currency,
                payment_reference=payment_ref,
                payment_method=serializer.validated_data['payment_method'],
                description=f"Subscription to {plan.name}"
            )
            
            # TODO: Process payment with external provider
            
            return Response(
                UserSubscriptionSerializer(subscription).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserSubscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or cancel user subscription"""
    
    serializer_class = UserSubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_subscription(request):
    """Get user's current active subscription"""
    
    try:
        subscription = UserSubscription.objects.filter(
            user=request.user,
            status='active'
        ).first()
        
        if not subscription or not subscription.is_active:
            return Response({
                'has_subscription': False,
                'message': 'No active subscription found'
            })
        
        return Response({
            'has_subscription': True,
            'subscription': UserSubscriptionSerializer(subscription).data
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upgrade_subscription(request):
    """Upgrade user's subscription"""
    
    serializer = SubscriptionUpgradeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = request.user
        new_plan = get_object_or_404(SubscriptionPlan, id=serializer.validated_data['new_plan_id'])
        
        # Get current subscription
        current_subscription = UserSubscription.objects.filter(
            user=user,
            status='active'
        ).first()
        
        if not current_subscription:
            return Response(
                {'error': 'No active subscription found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate upgrade cost
        upgrade_cost = new_plan.price - current_subscription.plan.price
        
        if upgrade_cost <= 0:
            return Response(
                {'error': 'New plan must be more expensive than current plan'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create payment transaction
        payment_ref = str(uuid.uuid4())
        PaymentTransaction.objects.create(
            user=user,
            subscription=current_subscription,
            transaction_type='upgrade',
            amount=upgrade_cost,
            currency=new_plan.currency,
            payment_reference=payment_ref,
            payment_method=serializer.validated_data['payment_method'],
            description=f"Upgrade from {current_subscription.plan.name} to {new_plan.name}"
        )
        
        # TODO: Process payment with external provider
        
        # Update subscription
        current_subscription.plan = new_plan
        current_subscription.estimates_limit = new_plan.estimates_limit
        current_subscription.save()
        
        return Response({
            'message': 'Subscription upgraded successfully',
            'subscription': UserSubscriptionSerializer(current_subscription).data,
            'upgrade_cost': upgrade_cost
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """Cancel user's subscription"""
    
    try:
        subscription = UserSubscription.objects.filter(
            user=request.user,
            status='active'
        ).first()
        
        if not subscription:
            return Response(
                {'error': 'No active subscription found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription.status = 'cancelled'
        subscription.auto_renew = False
        subscription.save()
        
        return Response({
            'message': 'Subscription cancelled successfully',
            'subscription': UserSubscriptionSerializer(subscription).data
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_usage(request):
    """Get user's subscription usage statistics"""
    
    try:
        subscription = UserSubscription.objects.filter(
            user=request.user,
            status='active'
        ).first()
        
        if not subscription:
            return Response({
                'has_subscription': False,
                'message': 'No active subscription found'
            })
        
        # Get usage logs for current subscription
        usage_logs = UsageLog.objects.filter(subscription=subscription)
        
        # Calculate usage statistics
        total_estimates = usage_logs.filter(action='estimate_created').count()
        total_reports = usage_logs.filter(action='report_generated').count()
        
        return Response({
            'subscription': UserSubscriptionSerializer(subscription).data,
            'usage': {
                'estimates_used': subscription.estimates_used,
                'estimates_limit': subscription.estimates_limit,
                'estimates_remaining': subscription.estimates_remaining,
                'total_estimates_created': total_estimates,
                'total_reports_generated': total_reports,
                'usage_percentage': (
                    (subscription.estimates_used / subscription.estimates_limit * 100)
                    if subscription.estimates_limit else 0
                )
            },
            'recent_activity': UsageLogSerializer(
                usage_logs.order_by('-created_at')[:10], 
                many=True
            ).data
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_usage(request):
    """Record usage for quota tracking"""
    
    try:
        subscription = UserSubscription.objects.filter(
            user=request.user,
            status='active'
        ).first()
        
        if not subscription:
            return Response(
                {'error': 'No active subscription found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action = request.data.get('action')
        resource_type = request.data.get('resource_type')
        resource_id = request.data.get('resource_id', '')
        
        if not action or not resource_type:
            return Response(
                {'error': 'Action and resource_type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has quota remaining
        if subscription.estimates_limit and subscription.estimates_used >= subscription.estimates_limit:
            return Response(
                {'error': 'Usage quota exceeded'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Record usage
        usage_log = UsageLog.objects.create(
            user=request.user,
            subscription=subscription,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id
        )
        
        # Update subscription usage count if applicable
        if action == 'estimate_created':
            subscription.estimates_used += 1
            subscription.save()
        
        return Response({
            'message': 'Usage recorded successfully',
            'usage_log': UsageLogSerializer(usage_log).data,
            'remaining_quota': subscription.estimates_remaining
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request):
    """Get user's payment history"""
    
    transactions = PaymentTransaction.objects.filter(
        user=request.user
    ).order_by('-created_at')
    
    return Response({
        'transactions': PaymentTransactionSerializer(transactions, many=True).data,
        'total_count': transactions.count()
    })



