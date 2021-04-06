module.exports = {
  configureWebpack: {
    devtool: "source-map",
  },
  productionSourceMap: process.env.NODE_ENV !== "production",
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
