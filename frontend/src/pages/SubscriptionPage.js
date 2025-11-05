import React from 'react';
import { Check, Crown, Zap, Star } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/helpers';

const SubscriptionPage = () => {
  const { currentSubscription, usage } = { currentSubscription: null, usage: null }; // Mock data

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: 0,
      duration: 'Forever',
      description: 'Perfect for trying out our platform',
      features: [
        '5 estimates per month',
        'Basic project types',
        'PDF reports',
        'Email support',
      ],
      limitations: ['Limited project types', 'No priority support'],
      popular: false,
      icon: Zap,
    },
    {
      id: '6months',
      name: 'Professional',
      price: 49,
      duration: '6 months',
      description: 'Ideal for contractors and small teams',
      features: [
        'Unlimited estimates',
        'All project types',
        'PDF & Excel reports',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
      ],
      limitations: [],
      popular: true,
      icon: Star,
    },
    {
      id: '12months',
      name: 'Enterprise',
      price: 89,
      duration: '12 months',
      description: 'For large construction companies',
      features: [
        'Everything in Professional',
        'Team collaboration',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Training sessions',
      ],
      limitations: [],
      popular: false,
      icon: Crown,
    },
  ];

  const currentPlan = currentSubscription?.has_subscription 
    ? plans.find(plan => plan.id === currentSubscription.plan?.plan_type)
    : plans[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
            Subscription Plans
          </span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that best fits your construction estimation needs.
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="mb-12">
          <Card className="transform hover:scale-[1.01] transition-transform duration-300">
            <Card.Body>
              <div className="flex flex-col md:flex-row items-center justify-between p-2">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-2">
                    Active Subscription
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {currentPlan?.name}
                  </h2>
                  <p className="text-gray-600">
                    {currentSubscription.has_subscription 
                      ? `Active until ${new Date(currentSubscription.subscription?.end_date).toLocaleDateString()}`
                      : 'Free trial active'
                    }
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                    {currentSubscription.has_subscription 
                      ? formatCurrency(currentPlan?.price || 0)
                      : 'Free'
                    }
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    per {currentPlan?.duration}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Usage Statistics */}
      {usage && (
        <div className="mb-12">
          <Card className="bg-white shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
            <Card.Header className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-primary-500" />
                Usage Statistics
              </h2>
            </Card.Header>
            <Card.Body className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-4 rounded-lg bg-primary-50">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mb-4">
                    <Zap className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {usage.estimates_used}
                  </div>
                  <div className="text-sm font-medium text-primary-700">Estimates Used</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {usage.estimates_remaining || '∞'}
                  </div>
                  <div className="text-sm font-medium text-green-700">Remaining</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {usage.usage_percentage || 0}%
                  </div>
                  <div className="text-sm font-medium text-blue-700">Usage</div>
                  {usage.usage_percentage > 0 && (
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${usage.usage_percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan?.id === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transform transition-all duration-300 hover:scale-[1.02] ${
                plan.popular ? 'ring-2 ring-primary-500 shadow-xl' : 'hover:shadow-lg'
              } ${isCurrentPlan ? 'bg-gradient-to-b from-primary-50 to-white' : 'bg-white'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 text-white text-sm font-medium shadow-lg">
                    <Crown className="w-4 h-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <Card.Body className="text-center p-8">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transform transition-transform duration-300 hover:scale-110 ${
                  plan.id === 'free' ? 'bg-gradient-to-br from-gray-100 to-gray-200' :
                  plan.id === '6months' ? 'bg-gradient-to-br from-primary-100 to-primary-200' : 'bg-gradient-to-br from-yellow-100 to-yellow-200'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    plan.id === 'free' ? 'text-gray-700' :
                    plan.id === '6months' ? 'text-primary-600' : 'text-yellow-600'
                  }`} />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {plan.name}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>
                
                <div className="mb-8">
                  <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    {formatCurrency(plan.price)}
                  </div>
                  <div className="text-gray-600 font-medium mt-1">
                    per {plan.duration}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm group">
                      <div className="flex-shrink-0 w-5 h-5 mr-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center transform transition-transform group-hover:scale-110">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full py-3 text-base font-medium transform transition-all duration-300 hover:scale-[1.02] ${
                    isCurrentPlan 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular 
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg' 
                        : ''
                  }`}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card className="bg-gradient-to-br from-gray-50 to-white transform hover:scale-[1.01] transition-transform duration-300">
        <Card.Header className="border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
              Frequently Asked Questions
            </span>
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-8">
              <div className="group">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors flex items-center">
                  <Check className="w-5 h-5 text-primary-500 mr-2" />
                  Can I change my plan at any time?
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div className="group">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors flex items-center">
                  <Check className="w-5 h-5 text-primary-500 mr-2" />
                  What happens if I exceed my quota?
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                  You'll be notified when you're approaching your limit. You can upgrade your plan or wait for the next billing cycle.
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="group">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors flex items-center">
                  <Check className="w-5 h-5 text-primary-500 mr-2" />
                  Do you offer refunds?
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                  We offer a 30-day money-back guarantee for all paid plans. Contact our support team for assistance.
                </p>
              </div>
              <div className="group">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors flex items-center">
                  <Check className="w-5 h-5 text-primary-500 mr-2" />
                  Need help choosing a plan?
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                  Our team is here to help you find the perfect plan for your needs. Contact us for a personalized consultation.
                </p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SubscriptionPage;



