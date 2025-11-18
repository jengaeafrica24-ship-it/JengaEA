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
    <div className="relative flex flex-col items-start p-6 sm:p-7 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-orange-500/50 hover:bg-slate-700/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/20">
      <div className={`absolute -left-4 -top-4 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center text-white shadow-lg shadow-${step.gradient.split('-')[1]}-500/30`}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
      </div>
      <div className="mt-6 sm:mt-8 w-full">
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3">{step.title}</h3>
        <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
};

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900/30 via-slate-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 px-4">
            How It Works
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto px-4 leading-relaxed">
            Get accurate construction estimates in four simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 relative">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <StepCard step={step} index={index} />
              {index < steps.length - 1 && (
                <>
                  {/* Desktop arrow - horizontal between cards (4 columns) */}
                  <div 
                    className="hidden lg:flex absolute top-1/2 z-10 items-center justify-center"
                    style={{
                      left: `calc(${25 * (index + 1)}% - 1rem)`,
                      transform: 'translateY(-50%)'
                    }}
                  >
                    <ArrowRight className="text-orange-400 w-6 h-6 drop-shadow-lg" />
                  </div>
                  {/* Tablet arrow - vertical between rows (2 columns) */}
                  {index === 1 && (
                    <div className="hidden sm:flex lg:hidden absolute left-1/2 z-10 items-center justify-center rotate-90" style={{ top: 'calc(50% + 1rem)', transform: 'translate(-50%, -50%)' }}>
                      <ArrowRight className="text-orange-400 w-6 h-6 drop-shadow-lg" />
                    </div>
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}