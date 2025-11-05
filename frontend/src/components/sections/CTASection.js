import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const features = [
  "7-day free trial, no credit card required",
  "Instant access to all features",
  "County-specific pricing data",
  "Export to PDF and Excel",
  "Team collaboration tools",
  "24/7 customer support"
];

const CTASection = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-slate-900/50 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-50%,rgba(249,115,22,0.15),rgba(15,23,42,0))]" />
      </div>

      {/* Animated Shapes */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem]">
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-3xl animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-orange-600/10 blur-2xl animate-pulse delay-1000" />
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Column - Text Content */}
            <div className="relative">
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  Transform Your Construction 
                  <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                    Cost Estimation Today
                  </span>
                </h2>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                  Join thousands of construction professionals who trust JengaAfrica for accurate, instant, and location-based cost estimates.
                </p>

                {/* Feature List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register" className="w-full sm:w-auto">
                    <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </Link>
                  <Link to="/demo" className="w-full sm:w-auto">
                    <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-semibold rounded-xl border border-slate-700 hover:bg-white/5 transition-all duration-300">
                      Watch Demo
                      <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative lg:h-[500px] flex items-center justify-center">
              <div className="relative w-full max-w-lg mx-auto">
                {/* Background Glow */}
                <div className="absolute inset-0 scale-[0.80] bg-orange-500/30 rounded-full blur-3xl" />
                
                {/* Card Visual */}
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-2.5">
                      <Building2 className="w-full h-full text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Professional Plan</h3>
                      <p className="text-slate-400">Most Popular</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">KSh 4,999</span>
                      <span className="text-slate-400">/month</span>
                    </div>
                    <p className="text-slate-300 mt-2">Perfect for growing construction firms</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Up to 20 projects per month",
                      "Advanced cost estimation",
                      "All counties access",
                      "Priority support",
                      "Material quantity takeoff"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/register" className="block">
                    <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300">
                      Get Started
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;