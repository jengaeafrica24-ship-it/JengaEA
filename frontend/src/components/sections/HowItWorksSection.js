import React from 'react';
import {
  UserPlus,
  FileSpreadsheet,
  PencilRuler,
  ClipboardCheck,
  ArrowRight
} from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create an Account',
    description: 'Sign up and verify your email to get started with JengaEA.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FileSpreadsheet,
    title: 'Choose Project Type',
    description: 'Enter your project specifications including location, type, and requirements.',
    gradient: 'from-orange-500 to-amber-500'
  },
  {
    icon: PencilRuler,
    title: 'Generate Estimate',
    description: 'Our AI-powered system generates detailed cost estimates based on your inputs.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: ClipboardCheck,
    title: 'Review and Export',
    description: 'Review the detailed breakdown and export your estimate in various formats.',
    gradient: 'from-violet-500 to-purple-500'
  }
];

const StepCard = ({ step, index }) => {
  const Icon = step.icon;
  return (
    <div className="relative flex flex-col items-start p-5 sm:p-6 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
      <div className={`absolute -left-3 -top-3 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="mt-4 sm:mt-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{step.title}</h3>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
};

export default function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 max-w-2xl mx-auto px-4">
            Get accurate construction estimates in four simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <StepCard step={step} index={index} />
              {index < steps.length - 1 && (
                <>
                  {/* Desktop arrow - horizontal, positioned between cards */}
                  <div 
                    className="hidden lg:block absolute top-1/2 z-10"
                    style={{
                      left: `calc(${25 * (index + 1)}% + ${index * 0.5}rem)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <ArrowRight className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  {/* Tablet arrow - vertical, positioned between rows */}
                  <div 
                    className="hidden sm:block lg:hidden absolute left-1/2 z-10 rotate-90"
                    style={{
                      top: index === 1 ? 'calc(50% + 1rem)' : 'calc(50% - 1rem)',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <ArrowRight className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}