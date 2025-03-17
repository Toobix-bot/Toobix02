module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nova-primary': '#4F46E5',
        'nova-secondary': '#10B981',
        'nova-accent': '#F59E0B',
        'nova-dark': '#1F2937',
        'nova-light': '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
