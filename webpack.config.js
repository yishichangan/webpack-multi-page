var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var Ex = require("extract-text-webpack-plugin");
var glob = require('glob');

var config = {};
var SRC_PATH = path.resolve(__dirname, 'src');
var BUILD_PATH = path.resolve(__dirname, 'dist');

//模块存在apps中便于查询
var files = glob.sync('./src/pages/**/*.html');
var entries = {};
var plugins = [];

files.forEach(function(f) {
  var name = /.*\/(.*?\/.*?\/.*)\.html/.exec(f)[1]; //得到home/index这样的文件名
  if (!name) return;
  
  //glob是通过html文件查到的filename
  var jsname = f.replace(/\.html$/, '.js');
  var jsfile = glob.sync(jsname);
  if(jsfile && jsfile.length){
    entries[name] = jsname;
  }
  var plug = new HtmlWebpackPlugin({
    favicon:'./src/images/favicon.ico', //favicon路径
    filename: path.resolve(BUILD_PATH, name + '.html'),
    //加上chunks之后每个页面会引入自己的chunks
    chunks: ['common/common','common/vendor', name],
    template: path.resolve(SRC_PATH, name + '.html'),
    inject: true
  });
  plugins.push(plug);
});

config = {
  entry: Object.assign(entries,{
    'common/vendor': ['./src/common/common'],
  }),
  output: {
    path: BUILD_PATH,
    filename: '[name].js',
    publicPath: "/dist",
  },
  module: {
    loaders: [
    {
      test: /\.(s)?css$/,
      use: Ex.extract({
        fallback: 'style-loader',
        use: ['css-loader', 'sass-loader']
      })
    },
    {
      test: /\.(png|jpg|gif|jpeg|ico)$/,
      loader: 'url-loader?limit=1000&name=[path][name].[ext]'
    }, {
      test: /\.js$/, //js 加载器
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015'] //转换 es6编码为 es5
      }
    },
    {
      test: /\.html$/,
      loader: "html-withimg-loader"
    }]
  },
  plugins: plugins.concat([
    new Ex('[name].css'),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common/common',
      chunks: Object.keys(entries)
    }),
  ]),
  devServer: {
    port: 3001,
    contentBase: './dist/pages',
    historyApiFallback: false,
    open: true, // 打开地址
    compress: true, // 开启gzip压缩
    watchContentBase : true
  }
}

module.exports = config;