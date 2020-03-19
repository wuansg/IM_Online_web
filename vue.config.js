module.exports = {
    // 开发环境中使用的端口
    devServer: {
        port: 8081
    },
    runtimeCompiler: true,

    // 取消生成map文件（map文件可以准确的输出是哪一行哪一列有错
    productionSourceMap: false,
    // 开发环境和部署环境的路径
    publicPath: '/'
    // configureWebpack: (config) => {
        // 增加iview-loader
        // config.module.rules[0].use.push({
        //     loader: 'iview-loader',
        //     options: {
        //         prefix: false
        //     }
        // })
        //在命令行使用vue inspect>o.js 可以检查修改后的webpack配置文件
    // }
}