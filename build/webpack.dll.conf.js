var path = require('path');
var webpack = require('webpack'); //调用webpack内置DllPlugin插件
var ExtractTextPlugin = require('extract-text-webpack-plugin'); // 提取css
var AssetsPlugin = require('assets-webpack-plugin'); // 生成文件名，配合HtmlWebpackPlugin增加打包后dll的缓存
var CleanWebpackPlugin = require('clean-webpack-plugin'); //清空文件夹
var config = require('../config');
var env = config.build.env;

module.exports = {
  entry: {
    libs: [
      'babel-polyfill',
      'vue/dist/vue.esm.js',
      'vue-router',
      'vuex',
      'element-ui',
      'echarts',
      'mockjs',
      // "element-ui/lib/theme-default/index.css"

      // 'mint-ui',
      // 'mint-ui/lib/style.css',
    ],
  },
  output: {
    path: path.resolve(__dirname, '../libs'),
    filename: '[name].[chunkhash:7].js',
    library: '[name]_library',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env,
    }),
    new webpack.DllPlugin({
      path: path.resolve(__dirname, '../libs/[name]-mainfest.json'),
      name: '[name]_library',
      context: __dirname, // 执行的上下文环境，对之后DllReferencePlugin有用
    }),
    new ExtractTextPlugin('[name].[contenthash:7].css'),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
    new AssetsPlugin({
      filename: 'bundle-config.json',
      path: './libs',
    }),
    new CleanWebpackPlugin(['libs'], {
      root: path.join(__dirname, '../'), // 绝对路径
      verbose: true, // 是否显示到控制台
      dry: false, // 不删除所有
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        // include: [resolve('src'), resolve('test'), resolve('node_modules/element-ui')],
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true, //启用压缩
              },
            },
          ],
        }),
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]',
        },
      },
    ],
  },
};
