import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '2,999',
    description: 'Perfect for small contractors and individual professionals',
    features: [
      'Up to 5 projects per month',
      'Basic cost estimation',
      'County-specific pricing',
      'PDF report generation',
      'Email support'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Professional',
    price: '4,999',
    description: 'Ideal for growing construction companies',
    features: [
      'Up to 20 projects per month',
      'Advanced cost estimation',
      'All counties access',
      'Detailed PDF reports',
      'Priority email support',
      'Project timeline planning',
      'Material quantity takeoff'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited projects',
      'Custom estimation models',
      'API access',
      'Dedicated account manager',
      '24/7 priority support',
      'Custom integrations',
      'Team collaboration tools',
      'Advanced analytics'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-950 to-slate-900 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-orange-500 tracking-wider uppercase mb-4 animate-fadeInUp">Pricing Plans</span>
          <h2 className="text-4xl font-bold mb-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            Flexible pricing options to match your estimation needs
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 mx-auto rounded-full mt-6 animate-fadeInUp" style={{ animationDelay: '0.6s' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group rounded-2xl p-8 transition-all duration-500 animate-fadeInUp ${
                plan.popular
                  ? 'bg-gradient-to-br from-orange-600 to-yellow-600'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              style={{ animationDelay: `${0.8 + (index * 0.2)}s` }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 'Custom' ? 'Custom' : `KSh ${plan.price}`}
                  </span>
                  {plan.price !== 'Custom' && <span className="text-gray-400">/month</span>}
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 mt-0.5 ${plan.popular ? 'text-yellow-200' : 'text-orange-500'}`} />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.cta === 'Contact Sales' ? '/contact' : '/register'}
                className="block"
              >
                <button
                  className={`group relative w-full overflow-hidden rounded-xl px-6 py-3 font-semibold transition-all duration-500 ${
                    plan.popular
                      ? 'bg-white text-orange-600 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600'
                  }`}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;