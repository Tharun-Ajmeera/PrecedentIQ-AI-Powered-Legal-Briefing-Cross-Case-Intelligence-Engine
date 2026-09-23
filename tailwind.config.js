import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  content: [
    path.join(__dirname, 'client/index.html'),
    path.join(__dirname, 'client/src/**/*.{js,ts,jsx,tsx}'),
    './client/index.html',
    './client/src/**/*.{js,ts,jsx,tsx}',
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        legal: {
          dark: '#0B1120',
          card: '#0F172A',
          border: '#1E293B',
          muted: '#64748B',
          accent: '#D97706',
          gold: '#B45309',
          lightGold: '#FEF3C7',
          surface: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
