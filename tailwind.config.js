export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { cream: '#FAF7F2', bone: '#EDE7DD', stone: '#D9D2C5', taupe: '#8C857A', ink: '#242424', teal: { DEFAULT: '#243F3B', dark: '#1D332F' }, gold: '#B89B65' },
      fontFamily: { serif: ['"Cormorant Garamond"', 'Georgia', 'serif'], sans: ['Inter', 'system-ui', 'sans-serif'] },
      keyframes: { rise: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'none' } } },
      animation: { rise: 'rise .45s ease-out both' },
    },
  },
  plugins: [],
}
