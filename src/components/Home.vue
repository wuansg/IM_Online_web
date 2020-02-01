<template>
    <div class="home">
        <div class="header">
            <h1>IM Online</h1>
            <div class="user-home">
                <img :src="user.avatar"/>
                <p>{{ user.username }}</p>
                <el-link type="danger" @click="logout">退出登录</el-link>
            </div>
        </div>
        <el-card class="sidebar" :class="{ open: !isCollapse }">
            <el-menu class="im-menu"
                    background-color="#2c3e50" text-color="#ffffff" :default-active="default_active"
                     @open="open_sidebar" @close="close_sidebar" :collapse="isCollapse" router>
                <el-menu-item
                        v-for="menu in menus" :key="menu.index" :index="menu.index"
                         @mouseenter||mouseleave="openOrClose" :route="menu.path">
                    <i :class="menu.icon"/>
                    <span slot="title">{{ menu.title }}</span>
                </el-menu-item>
            </el-menu>
        </el-card>
        <div class="body">
            <router-view></router-view>
<!--            <el-button type="primary" @click="openOrClose">click</el-button>-->
        </div>
        <div class="footer">
            <h4>silverspoon</h4>
        </div>
    </div>
</template>

<script>

    export default {
        name: "Home.vue",
        data() {
            return {
                user: this.$store.getters.user,
                default_active: this.$route.meta.parentPath,
                isCollapse: false,
                menus: [
                    {
                        index: "0",
                        icon: "el-icon-time",
                        title: "最近聊天记录",
                        path: "/home/recent",
                    },
                    {
                        index: "1",
                        icon: "el-icon-user",
                        title: "好友列表",
                        path: "/home/friends",
                    },
                    {
                        index: "2",
                        icon: "el-icon-bell",
                        title: "通知",
                        path: "/home/notification"
                    },
                    {
                        index: "3",
                        icon: "el-icon-info",
                        title: "关于",
                        path: "/home/settings",
                    }
                ],
            };
        },
        watch: {
            $route() {
                if (this.$route.meta.parentPath) {
                    this.default_active = this.$route.meta.parentPath;
                }
            }
        },
        methods: {
            open_sidebar(key, keyPath) {
                // eslint-disable-next-line no-console
                console.log(key,keyPath);
            },
            close_sidebar(key, keyPath) {
                // eslint-disable-next-line no-console
                console.log(key, keyPath);
            },
            openOrClose() {
                this.isCollapse = !this.isCollapse;
            },
            logout() {
                // alert("logout");
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("isLogin");
                sessionStorage.removeItem("recentMessages");
                sessionStorage.removeItem("friends")
                this.$router.push({
                    path: '/'
                });
            }
            // menu_click(index) {
            //     // this.$router.push({
            //     //     path: this.menus[index].path
            //     // });
            // }
        }
    }

</script>

<style scoped>
    * {
        margin: 0 0;
        border: 0;
    }
    .home {
        height: 100%;
        width: 100%;
        background-color: rgba(44,62,80,0.85);
    }
    .user-home {
        height: 60px;
        width: 200px;
        position: absolute;
        right: 160px;
        top: 8px;
    }
    .user-home * {
        float: left;
    }
    .user-home img {
        width: 60px;
        height: 60px;
        border-radius: 30px;
    }
    .user-home p{
        height: 30px;
        color: #FFFFFF;
        margin-top: 10px;
        padding-left: 10px;
    }
    .user-home a {
        padding-left: 10px;
    }
    .header {
        height: 60px;
        background-color: #2c3e50;
    }
    .header>h1 {
        padding-top: 7px;
        text-align: center;
        margin-top: 0;
        color: aliceblue;
    }
    .sidebar {
        background-color: #2c3e50;
        width: 84px;
        float: left;
        /*margin-right: 20px;*/
        margin-left: 20px;
        margin-top: 240px;
    }
    .open {
        width: 220px;
    }
    .el-menu-vertical-demo {
        width: 180px;
    }
    .im-menu {
        margin: 0 0;
        border: 0;
        text-align: left;
    }
    /deep/ .el-card__body {
    }
    .im-menu>i {}
    .body {
        /*float: left;*/
        /*position: absolute;*/
        /*left: 360px;*/
        margin: 40px 0 40px 420px;
    }
    .im-menu:not(.el-menu--collapse) {
        width: 200px;
        min-height: 168px;
    }
    .footer {
        margin-top: 70px;
        /*position: absolute;*/
        /*bottom: 0;*/
        /*margin-left: 900px;*/
    }
    .footer h4 {
        color: #FFFFFF;
    }
</style>