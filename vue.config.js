module.exports = {
  configureWebpack: {
    devtool: "source-map",
  },
  chainWebpack: (config) => {
    config.externals({
      "firebase/app": "firebase",
      firebaseui: "firebaseui",
      html2canvas: "html2canvas",
    });
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: true,
    },
  },
};
