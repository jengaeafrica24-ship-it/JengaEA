/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#1E40AF',
          700: '#1E3A8A',
          800: '#1E3A8A',
          900: '#172554'
        },
        secondary: {
          DEFAULT: '#F97316',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12'
        },
        accent: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B'
        },
        neutral: {
          DEFAULT: '#F3F4F6',
          50: '#FFFFFF',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'ken-burns': 'ken-burns 20s ease-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'scroll-down': 'scroll-down 2s ease-in-out infinite',
        'ripple': 'ripple 1s ease-out infinite',
        'gradient': 'gradient 8s linear infinite',
        'blob': 'blob 7s infinite',
        'slowZoom': 'slowZoom 20s infinite alternate',
        'fadeIn': 'fadeIn 1s ease-in forwards',
        'slideUp': 'slideUp 0.5s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
        'reverse-spin': 'reverse-spin 8s linear infinite',
        'gradientFlow': 'gradientFlow 15s ease infinite',
        'floatingPattern': 'floatingPattern 30s linear infinite'
      },
      keyframes: {
        'ken-burns': {
          '0%': { transform: 'scale(1.0) translate(0px)' },
          '100%': { transform: 'scale(1.1) translate(-20px, -20px)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scroll-down': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' }
        },
        'ripple': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        blob: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0, 0) scale(1)' }
        },
        slowZoom: { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(1.05)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        'reverse-spin': { '0%': { transform: 'rotate(360deg)' }, '100%': { transform: 'rotate(0deg)' } },
        gradientFlow: {
          '0%, 100%': { backgroundImage: 'linear-gradient(to right, var(--tw-gradient-stops))', backgroundPosition: '0% 50%' },
          '50%': { backgroundImage: 'linear-gradient(to left, var(--tw-gradient-stops))', backgroundPosition: '100% 50%' }
        },
        floatingPattern: { '0%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' }, '100%': { transform: 'translateY(0)' } },
        meshFloat: { '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.2' }, '50%': { transform: 'translateY(-20px) scale(1.1)', opacity: '0.3' } },
        particle: { '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '0' }, '10%': { opacity: '1' }, '90%': { opacity: '1' }, '100%': { transform: 'translateY(-100vh) rotate(360deg)', opacity: '0' } },
        floatComplex: { '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '0.3' }, '25%': { transform: 'translate(10px, -10px) rotate(90deg)', opacity: '0.6' }, '50%': { transform: 'translate(-5px, 15px) rotate(180deg)', opacity: '0.3' }, '75%': { transform: 'translate(-15px, -5px) rotate(270deg)', opacity: '0.6' } },
        shimmer: { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        blobAlt: { '0%': { transform: 'translate(0, 0) scale(1)' }, '33%': { transform: 'translate(30px, -50px) scale(1.1)' }, '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }, '100%': { transform: 'translate(0, 0) scale(1)' } }
      }
    }
  },
  plugins: []
};



