/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          300: "#7cc6ff",
          500: "#1295ff",
          700: "#1554b7",
          900: "#0a214f",
        },
        accent: "#ff8d36",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(10, 33, 79, 0.10)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(124, 198, 255, 0.28), transparent 35%), linear-gradient(135deg, #0a214f 0%, #1554b7 55%, #1295ff 100%)",
      },
    },
  },
  plugins: [],
};
