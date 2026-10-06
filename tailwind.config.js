export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { cream: '#FAF7F2', bone: '#F1ECE3', stone: '#D9D2C5', taupe: '#8C857A', ink: '#1F1E1C' },
      fontFamily: { serif: ['"Cormorant Garamond"', 'Georgia', 'serif'], sans: ['Inter', 'system-ui', 'sans-serif'] },
      keyframes: { rise: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'none' } } },
      animation: { rise: 'rise .9s ease-out both' },
    },
  },
  plugins: [],
}
