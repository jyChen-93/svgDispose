const webpack = require("webpack")

module.exports = {
    //当运行 build 时生成的生产环境构建文件的目录
    outputDir: 'dist',
    //放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录
    assetsDir: './',
    devServer: {
        port: 8333, // 端口
        overlay: {
            warnings: false,
            errors: false
        }
    },
    lintOnSave: false,
    // css: {
    //   loaderOptions: {
    //     sass: {
    //       data: `
    //         @import "@/assets/styles/_variable.scss";
    //       `
    //     }
    //   }
    // },
    chainWebpack: config => {
        config.module.rule('pug')
            .test(/\.pug$/)
            .use('pug-html-loader')
            .loader('pug-html-loader')
            .end()
    },
    // configureWebpack: {
    //     plugins: [
    //         new webpack.ProvidePlugin({
    //             $: "jquery",
    //             jQuery: "jquery",
    //             "windows.jQuery": "jquery"
    //         })
    //     ]
    // }
    // productionSourceMap: false,
    // devServer: {
    //     proxy: {
    //         '/api': {
    //             target: 'http://localhost:3000',
    //             changeOrigin: true
    //         }
    //     }
    // }
    // devServer: {
    //     port: 8888, // 端口
    // }

}