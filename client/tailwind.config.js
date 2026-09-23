import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
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
          obsidian: '#070B14',
          slate: '#0D1527',
          panel: '#131C31',
          card: '#0F172A',
          border: '#1E2B45',
          borderLight: '#2D3D5E',
          muted: '#64748B',
          gold: '#D97706',
          goldHover: '#B45309',
          brass: '#CA8A04',
          amber: '#F59E0B',
          lightGold: '#FEF3C7',
          surface: '#111827',
          accent: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
