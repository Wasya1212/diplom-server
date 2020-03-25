// main modules
const path = require('path');
const Webpack = require('webpack');
const BabelPresetMinify = require('babel-preset-minify');
const merge = require('webpack-merge');
const fs = require('fs');

// plugins
const MinifyPlugin = require('babel-minify-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PAGES = [
  { filename: 'index', renderFilename: 'index' }
];

function getDevelopmentHtmlPlugins(pages) {
  return pages.map(page => {
    return new HtmlWebpackPlugin({
      filename: `html/${page.renderFilename}.html`,
      inject: false,
      template: path.join('./src/client/public', `${page.filename}.pug`),
      minify: false
    });
  });
}

// main config
module.exports = merge(require('./common'), {
  plugins: [
    ...getDevelopmentHtmlPlugins(PAGES),
    new MinifyPlugin({
      removeConsole: false
    }, {
      comments: true,
      minify: BabelPresetMinify,
      include: /\.min\.js$/,
    }),
    new Webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '../../dist/public'),
    publicPath: '/',
    compress: false,
    port: 3000,
    index: `html/index.html`,
    open: true,
    overlay: {
      warnings: true,
      errors: true
    },
    historyApiFallback: true,
    inline: true,
    hotOnly: true,
    watchContentBase: true,
    progress: true,
    liveReload: true,
    proxy: {
      '/': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  // watch: true,
  devtool: 'inline-sourcemap'
});
