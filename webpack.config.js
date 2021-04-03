const path = require('path');

module.exports = {
  entry: ['babel-polyfill', 'src/index.ts'],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
  mode: 'production',
  externals: {
    leaflet: {
      commonjs: 'leaflet',
      commonjs2: 'leaflet',
      amd: 'leaflet',
      root: 'L', // indicates global variable
    },
  },
  module: {
    rules: [
      {
        test: /\.(glsl)$/,
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  output: {
    filename: 'leaflet-webgl-renderer.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
  },
};
