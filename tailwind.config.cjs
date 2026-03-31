/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        flexi: {
          blue: '#7C3AED',
          midnight: '#FFFFFF',
          gold: '#A78BFA',
          slate: '#111827',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(2, 6, 23, 0.45)',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(circle at top, rgba(124, 58, 237, 0.16), transparent 34%), radial-gradient(circle at bottom right, rgba(167, 139, 250, 0.12), transparent 28%), linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        fadeUp: 'fadeUp 0.45s ease-out both',
        pulseSoft: 'pulseSoft 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.65 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
