module.exports = {
  // configureWebpack: {
  //   module: {
  //     rules: [
  //       {
  //         test: /\.(glsl|vs|fs|vert|frag)$/,
  //         exclude: /node_modules/,
  //         use: ["raw-loader"]
  //       }
  //     ]
  //   }
  // },
  chainWebpack: (config) => {
    config.module
      .rule("text")
      .test(/\.(glsl|vs|fs|vert|frag)$/)
      .use("raw-loader")
      .loader("raw-loader")
      .end();
  }
};
