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
        line: "#E6E6E6",
        tint: "#F3FAF7",
      },
      spacing: {
        radius: "10px",
      },
      fontSize: {
        display: ["28px", { lineHeight: "1.35", fontWeight: "600" }],
        "display-md": ["32px", { lineHeight: "1.35", fontWeight: "600" }],
        h2: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "h2-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        h3: ["14px", { lineHeight: "1.5", fontWeight: "500" }],
        "h3-md": ["16px", { lineHeight: "1.5", fontWeight: "500" }],
        body: ["16px", { lineHeight: "1.7", fontWeight: "400" }],
        small: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.45", fontWeight: "400" }],
      },
      borderRadius: {
        card: "12px",
        tile: "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(48 48 48 / 0.06)",
        raised: "0 8px 24px rgb(48 48 48 / 0.08)",
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
