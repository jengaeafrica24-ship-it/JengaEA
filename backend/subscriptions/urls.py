from django.urls import path
from .views import (
    SubscriptionPlanListView, UserSubscriptionListView, UserSubscriptionDetailView,
    current_subscription, upgrade_subscription, cancel_subscription,
    subscription_usage, record_usage, payment_history
)

urlpatterns = [
    # Subscription plans
    path('plans/', SubscriptionPlanListView.as_view(), name='subscription_plans'),
    
    # User subscriptions
    path('', UserSubscriptionListView.as_view(), name='user_subscriptions'),
    path('<int:pk>/', UserSubscriptionDetailView.as_view(), name='user_subscription_detail'),
    path('current/', current_subscription, name='current_subscription'),
    path('upgrade/', upgrade_subscription, name='upgrade_subscription'),
    path('cancel/', cancel_subscription, name='cancel_subscription'),
    
    # Usage tracking
    path('usage/', subscription_usage, name='subscription_usage'),
    path('record-usage/', record_usage, name='record_usage'),
    
    # Payment history
    path('payments/', payment_history, name='payment_history'),
]



