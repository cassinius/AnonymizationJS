var path      = require('path');
var webpack   = require('webpack');
var ignore    = new webpack.IgnorePlugin(/^graphinius$/);

module.exports = {
  entry: './index.js',
  output: {
    path: __dirname + '/build/',
    filename: 'anonymization.js'
  },
  target: "web",
  web: {
    graphinius: false
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json!'
      }
    ]
  },
  node: {
    fs          : "empty",
    http        : "empty",
    net         : "empty",
    tls         : "empty",
    graphinius  : "empty"
  },
  resolve: {
    root: [
      path.join( __dirname, 'node_modules' ),
      path.join( __dirname, 'src' ),
      path.join( __dirname, 'node_modules/har-validator/lib/schemas/')
    ],
    extensions: [ '', '.js', 'json']
  },
  // plugins: [ignore],
  externals: {
    'graphinius': '$G'
  }
};
