import React from 'react';
import { Users, Building2, Calculator, Award, Clock } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '3,500+',
    label: 'Active Users',
    description: 'Professional contractors & firms',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Building2,
    value: '20,000+',
    label: 'Projects Estimated',
    description: 'Across East Africa',
    gradient: 'from-orange-500 to-amber-500'
  },
  {
    icon: Clock,
    value: '85%',
    label: 'Time Saved',
    description: 'Faster than manual estimation',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Calculator,
    value: '98%',
    label: 'Accuracy Rate',
    description: 'In cost predictions',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Award,
    value: '#1',
    label: 'Platform',
    description: 'In construction tech',
    gradient: 'from-red-500 to-orange-500'
  }
];

const StatsSection = () => {
  return (
    <section className="relative py-24 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_-50%,rgba(249,115,22,0.1),rgba(15,23,42,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_150%,rgba(249,115,22,0.1),rgba(15,23,42,0))]" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Trusted by Construction Professionals
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full mb-6" />
          <p className="text-slate-400 text-lg">
            Our platform has transformed construction estimation across East Africa
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-500"
            >
              {/* Stat Card Effects */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-all duration-500 bg-gradient-to-br blur-xl" style={{
                backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                '--tw-gradient-from': `rgb(var(--${stat.gradient.split(' ')[0].split('-')[1]}-500))`,
                '--tw-gradient-to': `rgb(var(--${stat.gradient.split(' ')[2].split('-')[1]}-500))`
              }} />

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 mb-4`}>
                <stat.icon className="w-full h-full text-white" />
              </div>

              {/* Stats Content */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">
                  {stat.label}
                </p>
                <p className="text-sm text-slate-400">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;