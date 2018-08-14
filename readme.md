# **vue-cli已经发布了3.0正式版，已经升级了`webpack`4.0，使用vue-cli3.0的小伙伴已经不在需要以下优化了**
# ~~基于`vue-cli`优化的`webpack`配置~~
大概分为以下几点
- 通过 `externals` 配置来提取常用库，引用外链
- 配置`CommonsChunkPlugin`提取公用代码 （`vue-cli`已做）
- 善用`alias`（`vue-cli`配置了一部分）
- 启用`DllPlugin`和`DllReferencePlugin`预编译库文件
- `happypack`开启多核构建项目
- 将`webpack-parallel-uglify-plugin`来替换`webpack`本身的`UglifyJS`来进行代码压缩混淆
- 升级`webpack`至3.x版本开启`Scope Hoisting`


### externals
> 文档地址 https://doc.webpack-china.org/configuration/externals/
>
> 防止将某些 import 的包(package)打包到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖(external dependencies)。

### CommonsChunkPlugin
> 文档地址 https://doc.webpack-china.org/plugins/commons-chunk-plugin/
>
> CommonsChunkPlugin 插件，是一个可选的用于建立一个独立文件(又称作 chunk)的功能，这个文件包括多个入口 chunk 的公共模块。通过将公共模块拆出来，最终合成的文件能够在最开始的时候加载一次，便存起来到缓存中供后续使用。这个带来速度上的提升，因为浏览器会迅速将公共的代码从缓存中取出来，而不是每次访问一个新页面时，再去加载一个更大的文件。

### resolve.alias
> 文档地址 https://doc.webpack-china.org/configuration/resolve/#resolve-alias
>
> 创建 import 或 require 的别名，来确保模块引入变得更简单。例如，一些位于 src/ 文件夹下的常用模块：

### DllPlugin和DllReferencePlugin
> 文档地址 https://doc.webpack-china.org/plugins/dll-plugin/
>
> Dll打包以后是独立存在的，只要其包含的库没有增减、升级，hash也不会变化，因此线上的dll代码不需要随着版本发布频繁更新。使用Dll打包的基本上都是独立库文件，这类文件有一个特性就是变化不大。，只要包含的库没有升级， 增减，就不需要重新打包。这样也提高了构建速度。
>
> 一般是用于打包阶段

1. 在`build`文件夹下新建`webpack.dll.conf.js`文件
```javascript
var path = require('path');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
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
      verbose: true,
      dry: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
    ],
  },
};
```
2. 在`build`文件夹下新建`build-dll.js`文件
```javascript
var path = require("path");
var webpack = require("webpack");
var dllConfig = require("./webpack.dll.conf");
var chalk = require("chalk");
var rm = require("rimraf");
var ora = require("ora");

var spinner = ora({
  color: "green",
  text: "building for Dll..."
});
spinner.start();
rm(path.resolve(__dirname, "../libs"), err => {
  if (err) throw err;
  webpack(dllConfig, function(err, stats) {
    spinner.stop();
    if (err) throw err;
    process.stdout.write(
      stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }) + "\n\n"
    );
    console.log(chalk.cyan(" build dll succeed !.\n"));
  });
});

```
3. 修改`webpack.prod.conf.js`文件
```javascript
var bundleConfig = require("../libs/bundle-config.json");
...
...
plugins: [
  // 增加DllReferencePlugin配置
  new webpack.DllReferencePlugin({
    context: __dirname,
    manifest: require("../libs/libs-mainfest.json") // 指向生成的manifest.json
  }),
  ...
  ...
  new HtmlWebpackPlugin({
    ...
    // 增加两个变量
    libJsName: bundleConfig.libs.js,
    libCssName: bundleConfig.libs.css,
  }),
  ...
  ...
  // 增加一个静态文件目录
   new CopyWebpackPlugin([
     ...
     ...
    {
      from: path.resolve(__dirname, "../libs"),
      to: config.build.assetsSubDirectory,
      ignore: ["*.json"]
    }
  ])
]
```
4. 修改模版文件`index.html`
```ejs
<body>
  <div id="app"></div>
  <!-- built files will be auto injected -->
  <% if (htmlWebpackPlugin.options.libCssName){ %>
    <link rel="stylesheet" href="./static/<%= htmlWebpackPlugin.options.libCssName %>">
  <% } %>

  <% if (htmlWebpackPlugin.options.libJsName){ %>
  	<script src="./static/<%= htmlWebpackPlugin.options.libJsName %>"></script>
  <% } %>
</body>
```
5. 修改`package.json`，增加`scripts`
```json
"scripts": {
  // 增加
  "dll": "node build/build-dll.js"
},
```
6. `npm run dll`先执行预编译，然后在打包项目文件，如果引入的类库文件没有变更就不再需要再次执行预编译


### happypack
> 文档地址 https://github.com/amireh/happypack
>
> 一般node.js是单线程执行编译，而happypack则是启动node的多线程进行构建，大大提高了构建速度。
>
>在插件中new一个新的happypack进程出来，然后再使用使用loader的地方替换成对应的id

1. 修改`webpack.base.conf.js`文件
```javascript
var HappyPack = require('happypack');
var os = require('os');
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
...
...
// 增加plugins
 plugins: [
  new HappyPack({
    id: 'happy-babel-js',
    loaders: ['babel-loader?cacheDirectory=true'],
    threadPool: happyThreadPool,
  })
]
...
...
// 修改对应loader
{
  test: /\.js$/,
  loader: 'happypack/loader?id=happy-babel-js',
  include: [resolve('src'), resolve('test')],
}
```

### webpack-parallel-uglify-plugin
> 文档地址 https://github.com/gdborton/webpack-parallel-uglify-plugin
>
> `webpack`提供的`UglifyJS`插件由于采用单线程压缩，速度很慢 ,
`webpack-parallel-uglify-plugin`插件可以并行运行`UglifyJS`插件，这可以有效减少构建时间。

1. 修改`webpack.prod.conf.js`文件
```javascript
var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
...
...
// 删掉webpack提供的UglifyJS插件
// new webpack.optimize.UglifyJsPlugin({
//   compress: {
//     warnings: false,
//     drop_console: true
//   },
//   sourceMap: true
// }),
// 增加 webpack-parallel-uglify-plugin来替换
new ParallelUglifyPlugin({
  cacheDir: '.cache/',
  uglifyJS:{
    output: {
      comments: false
    },
    compress: {
      warnings: false
    }
  }
}),
```


### webpack 3
> webpack3新特性一览 https://juejin.im/entry/5971483951882552681c4a30
>
> webpack 3.x 提供了一个新的功能：Scope Hoisting，又译作“作用域提升”。只需在配置文件中添加一个新的插件，就可以让 Webpack 打包出来的代码文件更小、运行的更快。

1. 修改`webpack.prod.conf.js`
```javascript
...
...
plugins: [
  // 往plugins添加一个配置
  // ps 只针对es6的模块化有效
  new webpack.optimize.ModuleConcatenationPlugin(),
]
```
