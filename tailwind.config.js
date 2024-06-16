const plugin = require("tailwindcss/plugin");
const colors = require("tailwindcss/colors");
const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,
      "panel-bg": "#202124",
      "panel-border": "#4E4E4E",
      "main-blue": "#46A8E5",
      inputBackGround: "#202020",
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: "#46A8E5",
              foreground: "#000000",
            },
            secondary: {
              DEFAULT: "#686868",
              foreground: "#FFFFFF",
            },
            focus: "#BEF264",
          },
        },
      },
    }),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".custom-input-wrapper": {
          "@apply shadow-xl bg-inputBackGround backdrop-blur-xl backdrop-saturate-200 cursor-text":
            {},
          "@apply dark:bg-inputBackGround/60": {},
          "@apply dark:hover:bg-inputBackGround/70": {},
          "@apply dark:focus:bg-inputBackGround/80": {},
        },
      });
    }),
  ],
};
