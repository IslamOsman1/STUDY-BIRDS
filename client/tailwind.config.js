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
        fusion:
          "linear-gradient(128deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 24%), linear-gradient(142deg, rgba(251,146,60,0.16) 0%, rgba(249,115,22,0.08) 18%, rgba(15,23,42,0) 19%), linear-gradient(328deg, rgba(251,191,36,0.10) 0%, rgba(15,23,42,0) 16%), radial-gradient(136% 70% at -10% 0%, rgba(34, 62, 114, 0.96) 0%, rgba(20, 45, 93, 0.88) 30%, transparent 31%), linear-gradient(160deg, #223e72 0%, #132a56 26%, #0A1931 60%, #050b14 100%)",
        "fusion-soft":
          "linear-gradient(138deg, rgba(251,146,60,0.07) 0%, rgba(255,255,255,0) 22%), radial-gradient(112% 58% at -8% 0%, rgba(34, 62, 114, 0.10) 0%, rgba(20, 45, 93, 0.05) 28%, transparent 29%), linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)",
        "workflow-panel":
          "linear-gradient(140deg, rgba(251,146,60,0.10) 0%, rgba(255,255,255,0) 18%), radial-gradient(120% 58% at -6% 0%, rgba(34, 62, 114, 0.12) 0%, rgba(20, 45, 93, 0.07) 28%, transparent 29%), linear-gradient(180deg, #f4f8fd 0%, #f8fbff 100%)",
      },
    },
  },
  plugins: [],
};
