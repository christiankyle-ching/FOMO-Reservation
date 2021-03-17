const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    colors: {
      nightPrimary: colors.amber[800],
      darkPrimary: colors.amber[700],
      primary: colors.amber[600],
      lightPrimary: colors.amber[300],

      darkSecondary: colors.gray[700],
      secondary: colors.gray[600],
      lightSecondary: colors.gray[300],

      darkSuccess: colors.green[700],
      success: colors.green[600],
      lightSuccess: colors.green[300],

      darkInfo: colors.blue[700],
      info: colors.blue[600],
      lightInfo: colors.blue[300],

      darkDanger: colors.red[700],
      danger: colors.red[600],
      lightDanger: colors.red[300],

      light: colors.white,
      darkText: colors.gray[200],
      dark1: colors.gray[700],
      dark2: colors.gray[800],
      dark3: colors.gray[900],

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
