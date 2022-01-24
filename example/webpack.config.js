const path = require('path')

module.exports = {
  entry: './index.js',
  output: {
    filename: 'build/[name].js',
    path: path.join(__dirname, './')
  },
  resolve: { fallback: { fs: false } },
  devServer: { static: { directory: __dirname }, open: true }
}
