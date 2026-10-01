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
        ivory: "#FCF8F5",
        blush: {
          100: "#F7EDE7",
          200: "#EFDCD2",
        },
        mauve: {
          400: "#C98C93",
          600: "#A35D69",
          700: "#8A4A55",
        },
        plum: {
          900: "#3B2330",
        },
        champagne: "#D9B99B",
        hairline: "#EDE4DE",
        sand: "#F6F0EB",
      },
      spacing: {
        radius: "10px",
        section: "clamp(3.5rem, 7vw, 7rem)",
      },
      fontSize: {
        "display-xl": [
          "clamp(2.5rem, 5.4vw, 4.5rem)",
          { lineHeight: "1.3", fontWeight: "700" },
        ],
        "display-lg": [
          "clamp(1.625rem, 3vw, 2.5rem)",
          { lineHeight: "1.4", fontWeight: "600" },
        ],
        lede: ["clamp(1rem, 1.25vw, 1.125rem)", { lineHeight: "1.9" }],
        eyebrow: ["13px", { lineHeight: "1.4", fontWeight: "500" }],
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
        panel: "28px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(48 48 48 / 0.06)",
        raised: "0 8px 24px rgb(48 48 48 / 0.08)",
        float: "0 16px 40px rgb(59 35 48 / 0.08)",
        lift: "0 24px 60px -24px rgb(59 35 48 / 0.22)",
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
