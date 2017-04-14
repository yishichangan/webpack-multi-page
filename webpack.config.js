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
    filename: path.resolve(BUILD_PATH, name + '.html'),
    //加上chunks之后每个页面会引入自己的chunks
    chunks: [name],
    title: name,
    template: path.resolve(SRC_PATH, name + '.html'),
    inject: true
  });
  plugins.push(plug);
});

config = {
  entry: Object.assign({}, entries),
  output: {
    path: BUILD_PATH,
    filename: '[name].js'
  },
  module: {
    loaders: [{
      test: /\.css$/,
      loader: Ex.extract(['css-loader'])
    }, {
      test: /.scss$/,
      loader: Ex.extract(["style-loader", "css-loader!sass-loader"])
    }, { //对大于6000字节 的图片采取base64处理
      test: /\.(png|jpg|gif)$/,
      loader: 'url?limit=6000'
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
      loader: "handlebars-loader",
      query: {
        partialDirs: [
          path.join(SRC_PATH, 'components', 'header'),
          path.join(SRC_PATH, 'components', 'footer'),
        ]
      }
    }]
  },
  plugins: plugins.concat([
    new Ex('[name].css')
  ]),
  devServer: {
    contentBase: './dist/pages',
    hot: true
  }
}

module.exports = config;