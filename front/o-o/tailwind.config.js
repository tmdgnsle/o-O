/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // colors
      colors: {
        primary: "#263A6B",
        background: "#FAFAFA",
        "semi-white": "#F8F9FA",
        "semi-black": "#333333",
        "black-gray": "#383737",
        "deep-gray": "#828181",
        gray: "#D5D5D5",
        danger: "#E33B2E"
      },

      // background
      backgroundImage: {
        dotted: 'radial-gradient(#CFCFCF 1px, transparent 0.8px)',
      },
      backgroundSize: {
        dotted: '30px 30px',
      },

      // font
      fontFamily: {
        paperlogy: ["Paperlogy", "system-ui" ,"sans-serif"],
      },
    },
  },
  plugins: [],
}

