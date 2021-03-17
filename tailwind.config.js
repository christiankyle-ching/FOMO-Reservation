const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    colors: {
      darkPrimary: colors.amber[700],
      primary: colors.amber[600],
      lightPrimary: colors.amber[200],

      darkSecondary: colors.gray[700],
      secondary: colors.gray[600],
      lightSecondary: colors.gray[200],

      darkSuccess: colors.green[700],
      success: colors.green[600],
      lightSuccess: colors.green[200],

      darkInfo: colors.blue[700],
      info: colors.blue[600],
      lightInfo: colors.blue[200],

      darkDanger: colors.red[700],
      danger: colors.red[600],
      lightDanger: colors.red[200],

      light: colors.white,
      dark: colors.gray[900],

      // Default
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
    },
    borderColor: (theme) => ({
      ...theme("colors"),
      DEFAULT: theme("colors.lightSecondary", "currentColor"),
    }),
  },
  variants: {
    extend: {
      backgroundColor: ["checked"],
      borderColor: ["checked"],
      ringWidth: ["hover"],
    },
  },
  plugins: [],
};
