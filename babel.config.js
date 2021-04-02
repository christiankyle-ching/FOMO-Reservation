const _plugins = [];

// Remove console.log in production
if (process.env.NODE_ENV === "production") {
  _plugins.push([
    "transform-remove-console",
    {
      exclude: ["error", "warn"],
    },
  ]);
}

module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: _plugins,
};
