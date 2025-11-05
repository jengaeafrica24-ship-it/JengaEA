import React from 'react';
import { 
  Calculator, 
  MapPin, 
  Clock, 
  PieChart, 
  Building2,
  Users,
  PencilRuler,
  Smartphone
} from 'lucide-react';

const features = [
  {
    Icon: Calculator,
    title: 'Smart Cost Estimation',
    description: 'Get accurate cost estimates using our AI-powered calculation engine.'
  },
  {
    Icon: MapPin,
    title: 'Location Intelligence',
    description: 'County-specific pricing that adapts to local market conditions.'
  },
  {
    Icon: Clock,
    title: 'Real-time Updates',
    description: 'Stay current with automatically updated material prices and labor costs.'
  },
  {
    Icon: PieChart,
    title: 'Detailed Breakdowns',
    description: 'View comprehensive cost breakdowns by materials, labor, and overhead.'
  },
  {
    Icon: Building2,
    title: 'Project Templates',
    description: 'Choose from pre-built templates for different construction types.'
  },
  {
    Icon: Users,
    title: 'Team Collaboration',
    description: 'Work together with your team in real-time on estimation projects.'
  },
  {
    Icon: PencilRuler,
    title: 'Custom Measurements',
    description: 'Input custom dimensions and quantities for precise calculations.'
  },
  {
    Icon: Smartphone,
    title: 'Mobile Access',
    description: 'Access your estimates anywhere through our mobile-friendly platform.'
  }
];

const FeatureCard = ({ Icon, title, description }) => (
  <div className="p-5 sm:p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-2.5 mb-3 sm:mb-4">
      <Icon className="w-full h-full text-white" />
    </div>
    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
      {title}
    </h3>
    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

const FeaturesSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-amber-200 to-yellow-200 mb-4 sm:mb-6 px-4">
            Powerful Features for Modern Construction
          </h2>
          <p className="text-slate-400 text-base sm:text-lg md:text-xl px-4">
            Everything you need to create accurate construction estimates, backed by real-time data and advanced technology.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
