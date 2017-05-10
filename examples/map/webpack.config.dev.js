var path = require('path');
var webpack = require('webpack');

// css单独打包
// https://github.com/webpack/extract-text-webpack-plugin/blob/webpack-1/README.md
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// 生产html
// https://www.npmjs.com/package/html-webpack-plugin
// The plugin will generate an HTML5 file for you that includes all your
// webpack bundles in the body
var HtmlWebpackPlugin = require('html-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);
// __dirname中的src目录，以此类推
var APP_PATH = ROOT_PATH;
// index.js路径
var APP_FILE = path.resolve(APP_PATH, 'index');
// 发布文件所存在的目录
var BUILD_PATH = path.resolve(ROOT_PATH, 'debug');
// node_modules
var NODE_MODULES = path.resolve(ROOT_PATH, 'node_modules');


module.exports = {
    entry: {
        index: APP_FILE
    },
    output: {
        publicPath: '/debug/', // 编译好的文件，在服务器的路径，这是静态资源引用路径
        path: BUILD_PATH, // 编译到当前目录
        filename: '[name].js', // 编译后的文件名字
        // http://react-china.org/t/webpack-output-filename-output-chunkfilename/2256
        chunkFilename: '[name].[chunkhash:5].min.js'
    },
    debug: true,
    devtool: 'inline-source-map',
    module: {
        loaders:[{
            test: /\.js$/,
            exclude: /^node_modules$/,
            loader: 'babel',
            include: [APP_PATH]
        },{
            test: /\.css$/,
            exclude: /^node_modules$/,
            loader: ExtractTextPlugin.extract('style', ['css', 'autoprefixer']),
            include: [APP_PATH]
        }, {
            test: /\.less$/,
            exclude: /^node_modules$/,
            loader: ExtractTextPlugin.extract('style', ['css', 'autoprefixer', 'less']),
            include: [APP_PATH]
        }, {
            test: /\.scss$/,
            exclude: /^node_modules$/,
            loader: ExtractTextPlugin.extract('style', ['css', 'autoprefixer', 'sass']),
            include: [APP_PATH]
        }, {
            test: /\.(eot|woff|svg|ttf|woff2|gif|appcache)(\?|$)/,
            exclude: /^node_modules$/,
            loader: 'file-loader?name=[name].[ext]',
            include: [APP_PATH]
        }, {
            test: /\.(png|jpg)$/,
            exclude: /^node_modules$/,
            loader: 'url-loader?limit=8192&name=images/[hash:8].[name].[ext]',
            //注意后面那个limit的参数，当你图片大小小于这个限制的时候，会自动启用base64编码图片
            include: [APP_PATH]
        }, {
            test: /\.jsx$/,
            exclude: /^node_modules$/,
            loaders: ['jsx', 'babel'],
            include: [APP_PATH]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development') //定义编译环境
            }
        }),
         
        new ExtractTextPlugin('[name].css')
    ],
    resolve: {
        extensions: ['', '.js', '.jsx', '.less', '.scss', '.css'], //后缀名自动补全
    },
    devServer: {
        // contentBase is based on root directory, that is 'kd-tree-javascript'
        contentBase: "./examples/map"
    }
};