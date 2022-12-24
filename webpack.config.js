module.exports = {
  mode: 'production',
  entry: {
    lib: './src/index',
  },
  output: {
    library: {
      name: 'GASClient',
      type: 'umd',
    },
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
};
