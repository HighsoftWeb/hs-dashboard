import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./core/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        highsoft: {
          cinza: "#A4A5A6",
          primario: "#094A73",
          secundario: "#048ABF",
          terciario: "#04B2D9",
          sucesso: "#10B981",
          erro: "#EF4444",
          aviso: "#F59E0B",
        },
      },
    },
  },
  plugins: [],
};

export default config;
