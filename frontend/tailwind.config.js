/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      colors: {
        dark: { 950: '#050508', 900: '#0a0a12', 800: '#0d0d18', 700: '#111120', 600: '#161628' },
        indigo: { 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5' },
        cyan: { 400: '#22d3ee', 500: '#06b6d4' },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(99,102,241,0.25)',
        'glow': '0 0 24px rgba(99,102,241,0.35)',
        'glow-lg': '0 0 48px rgba(99,102,241,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 16px 48px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
        glowPulse: { '0%,100%': { boxShadow: '0 0 12px rgba(99,102,241,0.3)' }, '50%': { boxShadow: '0 0 28px rgba(99,102,241,0.6)' } },
      },
    },
  },
  plugins: [],
};
