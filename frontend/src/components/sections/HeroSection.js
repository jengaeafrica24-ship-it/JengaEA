import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => (
  <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center justify-center overflow-hidden">
    {/* Animated Background Image with Ken Burns Effect */}
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-slowZoom"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1591892155856-ea8e9f3b0f3d?auto=format&fit=crop&w=2000&q=80')`,
      }}
    >
      {/* Animated Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/75 animate-gradient" />
      
      {/* Animated gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-900/30 via-transparent to-blue-900/30 animate-gradientFlow" />
      
      {/* Animated mesh gradient layers */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-blue-500/20 to-transparent rounded-full blur-3xl animate-blobAlt" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-amber-400/15 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
      </div>
    </div>

    {/* Floating Decorative Elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating circles */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-amber-500/10 rounded-full blur-xl animate-float-delayed" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-yellow-500/10 rounded-full blur-xl animate-float-delayed" style={{ animationDelay: '3s' }} />
      
      {/* Geometric shapes */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
      <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 right-1/5 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '2.5s' }} />
    </div>

    {/* Content with staggered animations */}
    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28 text-center">
      {/* Animated heading with gradient text */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
        <span className="block animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          Make construction estimates
        </span>
        <span 
          className="block bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent animate-gradient-text"
          style={{ 
            animation: 'fadeInUp 1s ease-out 0.4s both, gradient 3s ease infinite',
            animationDelay: '0.4s',
            backgroundSize: '200% auto'
          }}
        >
          simple for Africa
        </span>
      </h1>
      
      {/* Animated description */}
      <p 
        className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl text-slate-200 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4 animate-fadeInUp"
        style={{ animationDelay: '0.6s' }}
      >
        Accurate, fast, and collaborative estimating tools built for East African contractors. Start your free trial and transform how you bid on construction projects across Kenya, Tanzania, Uganda, and Rwanda.
      </p>

      {/* Animated CTA buttons */}
      <div 
        className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 animate-fadeInUp"
        style={{ animationDelay: '0.8s' }}
      >
        <Link
          to="/register"
          className="group relative w-full sm:w-auto rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-semibold text-white overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-orange-500/50"
        >
          {/* Animated shine effect */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Glow effect */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
          
          <span className="relative z-10 flex items-center justify-center gap-2">
            Get Started
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </Link>

        <Link 
          to="/features" 
          className="group w-full sm:w-auto text-sm sm:text-base md:text-lg font-medium text-white hover:text-orange-400 transition-all duration-300 flex items-center justify-center gap-2 relative"
        >
          <span className="relative z-10">Learn more</span>
          <span className="hidden sm:inline relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
          
          {/* Underline animation */}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-scroll-down" />
        </div>
      </div>
    </div>

    {/* Animated gradient border at bottom */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent animate-gradient" />
  </section>
);

export default HeroSection;
