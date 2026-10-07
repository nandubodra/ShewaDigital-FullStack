/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1d4ed8',
        accent: '#f59e0b',
        ink: '#0f172a',
        soft: '#f8fafc'
      }
    }
  },
  plugins: []
};
