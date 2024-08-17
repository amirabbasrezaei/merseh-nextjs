import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./Components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        black1: "#303030",
        lightBlack: "#7C7C7C",
        hover1: "#F3F3F3",
        green1: "#00BD84",
        green2: "#00A573",
      },
      spacing: {
        radius: "10px",
      },
      fontFamily: {
        yekanbakh: ["YekanBakh"],
        iranyekan: ["IRANYekanXFaNum"],
        iransansx: ["IRANSansXFaNum"],
      },
    },
  },
  plugins: [],
};
export default config;
