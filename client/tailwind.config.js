/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2fb",
          100: "#d8e1f1",
          300: "#93a8cf",
          500: "#1A3A7A",
          700: "#142D5D",
          900: "#0A1931",
        },
        accent: {
          DEFAULT: "#FF9D42",
          50: "#FFF1E3",
          100: "#FFD9B8",
          300: "#FFB36F",
          500: "#FF9D42",
          700: "#E65C00",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(10, 25, 49, 0.12)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(26, 58, 122, 0.30), transparent 35%), linear-gradient(135deg, #0A1931 0%, #142D5D 52%, #1A3A7A 100%)",
        fusion: "radial-gradient(136% 70% at -10% 0%, rgba(34, 62, 114, 0.96) 0%, rgba(20, 45, 93, 0.88) 30%, transparent 31%), radial-gradient(96% 42% at 90% 32%, rgba(255, 157, 66, 0.96) 0%, rgba(230, 92, 0, 0.90) 22%, transparent 23%), radial-gradient(110% 34% at 74% 84%, rgba(255, 178, 82, 0.96) 0%, rgba(255, 123, 18, 0.92) 16%, transparent 17%), radial-gradient(104% 24% at 54% 102%, rgba(230, 92, 0, 0.94) 0%, rgba(255, 123, 18, 0.88) 16%, transparent 17%), linear-gradient(160deg, #223e72 0%, #132a56 26%, #0A1931 60%, #050b14 100%)",
        "fusion-soft": "radial-gradient(112% 58% at -8% 0%, rgba(34, 62, 114, 0.10) 0%, rgba(20, 45, 93, 0.05) 28%, transparent 29%), radial-gradient(94% 38% at 92% 18%, rgba(255, 157, 66, 0.15) 0%, rgba(230, 92, 0, 0.09) 18%, transparent 19%), linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)",
        "workflow-panel": "radial-gradient(120% 58% at -6% 0%, rgba(34, 62, 114, 0.12) 0%, rgba(20, 45, 93, 0.07) 28%, transparent 29%), radial-gradient(86% 28% at 86% 100%, rgba(255, 157, 66, 0.20) 0%, rgba(230, 92, 0, 0.12) 18%, transparent 19%), linear-gradient(180deg, #f4f8fd 0%, #fff4e9 100%)",
      },
    },
  },
  plugins: [],
};
