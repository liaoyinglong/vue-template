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
