// main modules
const path = require('path');
const BabelPresetMinify = require('babel-preset-minify');
const merge = require('webpack-merge');

// plugins
const MinifyPlugin = require('babel-minify-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ImageminPlugin = require("imagemin-webpack");

// clear optimization options
const common = require('./common');
delete common.optimization;

const PAGES = [
  { filename: 'index', renderFilename: 'index' }
];


function getProductionHtmlPlugins(pages) {
  return pages.map(page => {
    return new HtmlWebpackPlugin({
      filename: `html/${page.renderFilename}.html`,
      inject: false,
      template: path.join('./src/client/public', `${page.filename}.pug`),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        conservativeCollapse: true
      }
    });
  });
}

// main config
module.exports = merge(common, {
  optimization: {
    minimizer: [
      // new UglifyJsPlugin({
      //   cache: true,
      //   parallel: true,
      //   sourceMap: false // set to true if you want JS source maps
      // }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    ...getProductionHtmlPlugins(PAGES),
    new MinifyPlugin({
      removeConsole: false
    }, {
      comments: false,
      minify: BabelPresetMinify,
      include: /\.min\.js$/,
    }),
    new ImageminPlugin({
      imageminOptions: {
        cache: true,
        plugins: [
          ["gifsicle", { interlaced: true }],
          ["jpegtran", { progressive: true }],
          ["optipng", { optimizationLevel: 5 }],
          [
            "svgo",
            {
              plugins: [
                {
                  removeViewBox: false
                }
              ]
            }
          ]
        ]
      }
    })
  ]
});
