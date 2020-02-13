// main modules
const path = require('path');

require("babel-register");

const SCRIPTS = {
  index: './src/client/index.ts'
};

const STYLES = [
  './src/client/app/styles/pages/index.sass'
];

// main config
module.exports = {
  entry: { index: './src/client/index.tsx' },// Object.assign(SCRIPTS, { styles: STYLES }),
  output: {
    path: path.resolve(__dirname, '../dist/public'),
    filename: 'js/[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(fbx|obj|gltf|bin)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'models/',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
              emitFile: true, // Don't forget emit images.
              outputPath: 'img/',
              name: '[name]-[hash].[ext]',
              mozjpeg: {
                progressive: true,
                quality: 70
              }
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
              name: 'img/[name].[ext]',
            }
          },
          // 'webp-loader?{quality: 13}'
        ]
      },
      {
        test: /\.(mov|mp4)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'media/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.html$/,
        loader: 'html-loader?attrs[]=video:src'
      },
      {
        test: /\.(pug|jade)$/,
        exclude: /(node_modules|bower_components)/,
        use:  [
          'html-loader',
          {
          loader: 'pug-html-loader',
          options: {
            data: {}
          }}
        ]
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true
            }
          }
        ]
      },
      // {
      //   test: /\.sass$/,
      //   use: [
      //     // {
      //     //   loader: 'file-loader',
      //     //   options: {
      //     //     name: 'css/[name].css'
      //     //   }
      //     // },
      //     // 'extract-loader',
      //     'style-loader',
      //     'css-loader',
      //     'sass-loader'
      //   ]
      // },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]-[hash].[ext]',
            outputPath: 'fonts/'
          }
        },
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.jsx', '.mjs', 'sass', 'css', '*' ],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  optimization: {
    minimize: false
  }
};
