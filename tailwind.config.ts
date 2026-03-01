import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void: '#00000A',
        space: {
          950: '#03030F',
          900: '#060614',
          800: '#0A0A1E',
          700: '#0F0F2A',
          600: '#141435',
        },
        nebula: {
          300: '#93E6FB',
          400: '#67E8F9',
          500: '#22D3EE',
          600: '#0EA5E9',
          700: '#0284C7',
        },
        aurora: {
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          900: '#2E1065',
        },
        star: {
          100: '#F0F4FF',
          200: '#E2E8F7',
          300: '#C8D3E8',
          400: '#94A3B8',
          500: '#64748B',
        },
        pulsar: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
        // Keep old brand colors for backward compat
        brand: {
          lavender: '#CFA3EA',
          violet:   '#831DC6',
          purple:   '#560BAD',
          indigo:   '#3A0CA3',
          blue:     '#4361EE',
        },
      },
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #3A0CA3 0%, #560BAD 30%, #831DC6 60%, #CFA3EA 100%)',
        'gradient-brand-r':  'linear-gradient(135deg, #4361EE 0%, #560BAD 50%, #831DC6 100%)',
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'dot-grid':          'radial-gradient(rgba(103,232,249,0.08) 1px, transparent 1px)',
        'scanlines':         'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(14,165,233,0.015) 2px, rgba(14,165,233,0.015) 4px)',
      },
      backgroundSize: {
        'grid-40': '40px 40px',
      },
      animation: {
        'glow-pulse':      'glow-pulse 2s ease-in-out infinite',
        'float':           'float 6s ease-in-out infinite',
        'float-orb':       'floatOrb 8s ease-in-out infinite',
        'nebula-drift':    'nebulaFloat 20s ease-in-out infinite alternate',
        'twinkle':         'twinkle 3s ease-in-out infinite',
        'orbit-ring':      'orbitRing 20s linear infinite',
        'orbit-ring-rev':  'orbitRingRev 26s linear infinite',
        'orbit-ring-slow': 'orbitRing 34s linear infinite',
        'scanline-sweep':  'scanlineSweep 0.7s ease-out forwards',
        'cursor-ring-spin':'spin 12s linear infinite',
        'blink':           'blink 1s step-end infinite',
        'blink-dot':       'blinkDot 1.4s ease-in-out infinite',
        'slide-up':        'slide-up 0.6s ease-out',
        'fade-in':         'fade-in 0.8s ease-out',
        'spin-slow':       'spin 20s linear infinite',
        'pulse-ring':      'pulseRing 2s ease-out infinite',
        'count-dots':      'countDots 1.2s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34,211,238,0.3), 0 0 40px rgba(14,165,233,0.15)' },
          '50%':      { boxShadow: '0 0 40px rgba(34,211,238,0.6), 0 0 80px rgba(14,165,233,0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'floatOrb': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-18px) rotate(1deg)' },
        },
        'nebulaFloat': {
          '0%':   { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(30px, -20px)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1' },
        },
        'orbitRing': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'orbitRingRev': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'scanlineSweep': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'blinkDot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.7)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulseRing': {
          '0%':    { transform: 'scale(1)', opacity: '0.8' },
          '100%':  { transform: 'scale(2)', opacity: '0' },
        },
        'countDots': {
          '0%, 100%': { opacity: '0.2' },
          '50%':      { opacity: '1' },
        },
      },
      boxShadow: {
        'nebula-sm': '0 0 10px rgba(34,211,238,0.25)',
        'nebula':    '0 0 20px rgba(34,211,238,0.4)',
        'nebula-lg': '0 0 40px rgba(34,211,238,0.3)',
        'aurora-sm': '0 0 10px rgba(139,92,246,0.3)',
        'aurora':    '0 0 20px rgba(139,92,246,0.5)',
        'glow-sm':   '0 0 10px rgba(131, 29, 198, 0.3)',
        'glow':      '0 0 20px rgba(131, 29, 198, 0.5)',
        'glow-lg':   '0 0 40px rgba(131, 29, 198, 0.6)',
        'glow-blue': '0 0 20px rgba(67, 97, 238, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config
