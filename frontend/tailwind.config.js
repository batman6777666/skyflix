/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0f1014",
        surface: "#16181f",
        primary: "#ffffff",
        secondary: "#9ba1b3",
      },
      backgroundImage: {
        "btn-gradient": "linear-gradient(90deg, #3d0b2e 0%, #68164a 100%)",
        "hero-gradient": "linear-gradient(to right, #0f1014 0%, rgba(15,16,20,0) 50%)",
        "hero-bottom": "linear-gradient(to top, #0f1014 10%, transparent 100%)",
      },
    },
  },
  plugins: [],
};
