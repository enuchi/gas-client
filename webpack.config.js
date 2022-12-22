module.exports = {
  // optimization: {
  //   minimize: false,
  // },
  mode: 'production',
  // devtool: 'inline-source-map',
  entry: {
    lib: './src/index',
  },
  output: {
    library: 'lib',
    libraryTarget: 'umd',
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
};
