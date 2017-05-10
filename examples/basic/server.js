var webpack = require('webpack');
var WebPackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.dev');

var server = new WebPackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    progress: true,
    state:{
        colors: true
    },
    // contentBase is based on root directory, that is 'kd-tree-javascript'
    contentBase: './examples/basic'
});

server.listen(8090, function(){
    console.log('正常打开8090端口');
});