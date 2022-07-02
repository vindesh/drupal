'use strict';

var path = require('path'),
  webpack = require('webpack');
module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    app: './app/scripts/app.js'
  },
  output: {
    path: path.resolve(__dirname, 'build/scripts'),
    publicPath: '/build/scripts/',
    filename: '[name].built.js',
    chunkFilename: '[name].bundle.js', // name || id || chunkhash
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    ]
  },
  plugins: [

    // Use this if you want to chunk shared libraries
    // new webpack.optimize.CommonsChunkPlugin('shared.js'),

    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery'
    })
  ]
};
