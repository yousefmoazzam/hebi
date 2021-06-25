'use strict'

const { VueLoaderPlugin } = require('vue-loader')
const path = require('path');
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: {
    processing: './src/processing.js',
    login: './src/login.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false
            }
          },
          'sass-loader'
        ]
      },
//      {
//        test: /\.js$/,
//        enforce: 'pre',
//        use: ['source-map-loader'],
//      }
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      FEDID: JSON.stringify(DUMMY_FEDID),
      ACTIVATE_CAS_AUTH: JSON.stringify(DUMMY_ACTIVATE_CAS_AUTH),
      CAS_SERVER: JSON.stringify(DUMMY_CAS_SERVER),
      SERVICE: JSON.stringify(DUMMY_SERVICE),
      ACTIVATE_WEBSOCKET: JSON.stringify(DUMMY_ACTIVATE_WEBSOCKET),
      WEBSOCKET_SERVER: JSON.stringify(DUMMY_WEBSOCKET_SERVER)
    })
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  }
}
