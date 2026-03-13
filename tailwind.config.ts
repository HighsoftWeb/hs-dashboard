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
          cinza: "#94a3b8",
          primario: "#64748b",
          secundario: "#94a3b8",
          terciario: "#cbd5e1",
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
