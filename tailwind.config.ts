import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#f6f2ea",
        ink: "#1f1a17",
        clay: "#9c6b4f",
        line: "#e6ddd0",
        card: "#fffdf9"
      }
    }
  },
  plugins: []
};

export default config;
