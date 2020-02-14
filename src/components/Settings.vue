<template>
    <el-card class="settings">
        <img style="margin-top: 160px; width: 240px; height: 240px; border-radius: 120px" :src="this.$store.getters.user.avatar">
        <h2>作者： masiroonen@gmail.com</h2>
        <h2>github地址： https://github.com/exview</h2>
        <h2>版本号： 1.0</h2>
        <h2>本作品仅用于学习，如有其他用途请邮箱联系，谢谢支持。</h2>
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

</style>