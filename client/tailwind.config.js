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
          bg: '#060B16',
          bgSecondary: '#0B1220',
          surface: '#0F1728',
          surfaceElevated: '#121B2D',
          border: '#1D2A40',
          borderLight: '#2D3D5E',
          accent: '#F59E0B',
          accentHover: '#D97706',
          blue: '#3B82F6',
          emerald: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          textPrimary: '#F8FAFC',
          textSecondary: '#94A3B8',
          textMuted: '#64748B',
          // Backwards-compatible aliases
          obsidian: '#060B16',
          slate: '#0B1220',
          panel: '#0F1728',
          card: '#0F1728',
          gold: '#F59E0B',
          goldHover: '#D97706',
          brass: '#D97706',
          amber: '#F59E0B',
          lightGold: '#FEF3C7',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Source Serif 4"', '"Libre Baskerville"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
