import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

const initialState = {
  currentSubscription: null,
  subscriptionPlans: [],
  usage: null,
  isLoading: false,
};

const subscriptionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_SUBSCRIPTION':
      return {
        ...state,
        currentSubscription: action.payload,
      };
    case 'SET_PLANS':
      return {
        ...state,
        subscriptionPlans: action.payload,
      };
    case 'SET_USAGE':
      return {
        ...state,
        usage: action.payload,
      };
    case 'UPDATE_USAGE':
      return {
        ...state,
        usage: {
          ...state.usage,
          estimates_used: state.usage.estimates_used + 1,
          estimates_remaining: state.usage.estimates_remaining > 0 
            ? state.usage.estimates_remaining - 1 
            : 0,
        },
      };
    default:
      return state;
  }
};

export const SubscriptionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Fetch subscription data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionData();
      fetchSubscriptionPlans();
      fetchUsageData();
    }
  }, [isAuthenticated]);

  const fetchSubscriptionData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.get('/api/subscriptions/current/');
      dispatch({ type: 'SET_SUBSCRIPTION', payload: response.data });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      dispatch({ type: 'SET_SUBSCRIPTION', payload: null });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await axios.get('/api/subscriptions/plans/');
      dispatch({ type: 'SET_PLANS', payload: response.data });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const fetchUsageData = async () => {
    try {
      const response = await axios.get('/api/subscriptions/usage/');
      dispatch({ type: 'SET_USAGE', payload: response.data.usage });
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  };

  const subscribeToPlan = async (planId, paymentMethod, autoRenew = false) => {
    try {
      const response = await axios.post('/api/subscriptions/', {
        plan_id: planId,
        payment_method: paymentMethod,
        auto_renew: autoRenew,
      });
      
      // Refresh subscription data
      await fetchSubscriptionData();
      await fetchUsageData();
      
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Subscription failed';
      return { success: false, error: message };
    }
  };

  const upgradeSubscription = async (newPlanId, paymentMethod) => {
    try {
      const response = await axios.post('/api/subscriptions/upgrade/', {
        new_plan_id: newPlanId,
        payment_method: paymentMethod,
      });
      
      // Refresh subscription data
      await fetchSubscriptionData();
      await fetchUsageData();
      
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Upgrade failed';
      return { success: false, error: message };
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await axios.post('/api/subscriptions/cancel/');
      
      // Refresh subscription data
      await fetchSubscriptionData();
      await fetchUsageData();
      
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Cancellation failed';
      return { success: false, error: message };
    }
  };

  const recordUsage = async (action, resourceType, resourceId = '') => {
    try {
      const response = await axios.post('/api/subscriptions/record-usage/', {
        action,
        resource_type: resourceType,
        resource_id: resourceId,
      });
      
      // Update local usage state
      if (action === 'estimate_created') {
        dispatch({ type: 'UPDATE_USAGE' });
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to record usage';
      return { success: false, error: message };
    }
  };

  const checkQuota = () => {
    if (!state.usage) return true;
    
    // If unlimited (estimates_limit is null), return true
    if (state.usage.estimates_limit === null) return true;
    
    // Check if user has remaining quota
    return state.usage.estimates_remaining > 0;
  };

  const getQuotaStatus = () => {
    if (!state.usage) return { hasQuota: true, percentage: 0 };
    
    if (state.usage.estimates_limit === null) {
      return { hasQuota: true, percentage: 0, isUnlimited: true };
    }
    
    const percentage = (state.usage.estimates_used / state.usage.estimates_limit) * 100;
    const hasQuota = state.usage.estimates_remaining > 0;
    
    return { hasQuota, percentage, isUnlimited: false };
  };

  const value = {
    ...state,
    subscribeToPlan,
    upgradeSubscription,
    cancelSubscription,
    recordUsage,
    checkQuota,
    getQuotaStatus,
    refreshData: () => {
      fetchSubscriptionData();
      fetchUsageData();
    },
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};



