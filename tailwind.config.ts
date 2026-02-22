import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lavender: '#CFA3EA',
          violet: '#831DC6',
          purple: '#560BAD',
          indigo: '#3A0CA3',
          blue: '#4361EE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3A0CA3 0%, #560BAD 30%, #831DC6 60%, #CFA3EA 100%)',
        'gradient-brand-r': 'linear-gradient(135deg, #4361EE 0%, #560BAD 50%, #831DC6 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(259,100%,30%,0.5) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(261,100%,44%,0.4) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(251,100%,32%,0.4) 0px, transparent 50%)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(131, 29, 198, 0.4), 0 0 40px rgba(67, 97, 238, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(131, 29, 198, 0.8), 0 0 80px rgba(67, 97, 238, 0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(131, 29, 198, 0.3)',
        'glow': '0 0 20px rgba(131, 29, 198, 0.5)',
        'glow-lg': '0 0 40px rgba(131, 29, 198, 0.6)',
        'glow-blue': '0 0 20px rgba(67, 97, 238, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config
