import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        dekor: {
          background: '#F7F4EA',
          card: '#EBD9D1',
          accent: '#B87C4C',
          success: '#A8BBA3'
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(168,187,163,0.25), rgba(183,124,76,0.25))'
      },
      boxShadow: {
        glass: '0 8px 30px rgba(184,124,76,0.15)'
      }
    }
  },
  plugins: []
};

export default config;
