/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgColor: '#222831',
        lightBgColor:'#393E46',
        customBlue: '#00ADB5',
        textColor: '#EEEEEE'
      }
    },
  },
  plugins: [],
}