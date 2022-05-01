const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/scripts/main.ts',
  mode: 'production',
  devServer: {
    compress: true,
    port: 8080,
    client: {
      progress: true,
    },
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      minify: false
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/styles', to: 'styles' },
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.ts'],
    fallback: {
      "assert": false,
      "buffer": false,
      "child_process": false,
      "fs": false,
      "http": false,
      "https": false,
      "net": false,
      "os": false,
      "path": false,
      "stream": false,
      "tls": false,
      "util": false,
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}