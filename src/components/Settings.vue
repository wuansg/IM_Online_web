<template>
    <el-card class="settings">
        <div class="settings-header">
            <el-avatar :size="128" :src="this.$store.getters.user.avatar"/>
        </div>
        <div class="settings-body">
            <span>作者</span> <h2> silverspoon </h2><br/>
            <span>邮箱地址</span> <h2> masiroonen@gmail.com </h2>
            <span>github地址</span> <h2> https://github.com/exview</h2><br/>
            <span>版本号</span> <h2> 1.0</h2><br/>
            <p>本作品仅用于学习，如有其他用途请邮箱联系，谢谢支持。</p>
        </div>
    </el-card>
</template>

<script>
    export default {
        name: "Settings"
    }
</script>

<style scoped>
    * {
        font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
        margin: 0;
        padding: 0;
        border: 0;
    }
    .settings {
        /*padding: 200px 0 0 0;*/
        height: 720px;
        width: 1200px;
        background-color: #FFFFFF;
        border-radius: 12px;
        text-align: center;
    }
    /deep/ .el-card__body {
        padding: 0;
    }
    .settings-header {
        margin: 100px 240px 20px;
        padding: 10px 20px;
        border-bottom: 1px solid lightgray
    }
    .settings-body {
        text-align: left;
        margin: 0 240px;
        padding: 10px 100px;
        border-bottom: 1px solid lightgray;
    }
    .settings-body>span {
        display: inline-block;
        width: 120px;
        margin: 5px 10px;
        font-size: 20px;
    }
    .settings-body>h2 {
        display: inline-block;
    }
    .settings-body>p {
        text-align: center;
        margin: 40px 20px 0;
    }

</style>