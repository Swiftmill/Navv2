import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/renderer/index.html',
    './app/renderer/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'var(--hyper-accent)',
          foreground: 'var(--hyper-accent-foreground)',
        },
        surface: {
          DEFAULT: '#0d0f1a',
          raised: '#141726',
          glow: '#1d2140'
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(29,33,64,0.8), rgba(12,12,24,0.6))'
      },
      boxShadow: {
        glass: '0 20px 45px rgba(0,0,0,0.45)',
      },
      borderRadius: {
        '2xl': '1.5rem'
      }
    },
  },
  plugins: [plugin(({ addUtilities }) => {
    addUtilities({
      '.glass-panel': {
        backdropFilter: 'blur(var(--hyper-blur, 18px))',
        backgroundImage: 'var(--hyper-panel-bg, linear-gradient(135deg, rgba(29,33,64,0.7), rgba(12,12,24,0.4)))',
        border: '1px solid rgba(255,255,255,0.06)',
      },
    });
  }), animate],
};

export default config;
