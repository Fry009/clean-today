/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--accent)',
          dark: 'var(--accent-strong)'
        },
        text: {
          strong: 'var(--text-strong)',
          muted: 'var(--text-muted)'
        }
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem'
      },
      boxShadow: {
        card: 'var(--card-shadow)'
      }
    }
  },
  plugins: []
};
