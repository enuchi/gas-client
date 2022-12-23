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
    library: {
      name: 'GASClient',
      type: 'umd',
    },
    // libraryTarget: 'umd',
    filename: 'index.js',
    // globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
};
