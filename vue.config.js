const path = require("path");
function resolve(dir) {
  return path.join(__dirname, "/", dir);
}

module.exports = {
  publicPath: "/NtuaCraftBack/",
  lintOnSave: process.env.NODE_ENV !== "production",

  /* 設定本機port */
  devServer: {
    port: 1803, // 端口
    overlay: {
      warnings: true,
      errors: false,
    },
  },

  /* css */
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/assets/css/basic/_variable.scss";`,
      },
    },
  },

  configureWebpack: {
    devtool: "source-map",
  },
  // svg配置
  chainWebpack(config) {
    config.module
      .rule("svg")
      .exclude.add(resolve("src/icons"))
      .end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      })
      .end();
  },
};
