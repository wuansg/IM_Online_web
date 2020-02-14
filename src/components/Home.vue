<template>
    <div class="home">
        <div class="header">
            <h1>IM Online</h1>
            <div class="user-home">
                <img :src="user.avatar" @click="cropImage"/>
                <p>{{ user.username }}</p>
                <el-link type="danger" @click="logout">退出登录</el-link>
            </div>
        </div>
        <el-card class="sidebar" :class="{ open: !isCollapse }">
            <el-menu class="im-menu"
                    background-color="#2c3e50" text-color="#ffffff" :default-active='"0"' :collapse="isCollapse" router>
<!--                <el-menu-item-->
<!--                        v-for="menu in menus" :key="menu.index" :index="menu.index"-->
<!--                         @mouseenter||mouseleave="openOrClose" :route="menu.path">-->
<!--                    <el-badge :is-dot="menu.hasNew" style=" width: 100%" v-on:update:is-dot="openOrClose">-->
<!--                        <i :class="menu.icon" style=""> {{menu.title}}</i>-->
<!--                    </el-badge>-->
<!--                </el-menu-item>-->
                <el-menu-item
                        v-for="menu in menus" :key="menu.index" @click="changeIndex(menu.index)">
                    <el-badge :is-dot="menu.hasNew" style=" width: 100%">
                        <i :class="[menu.icon, {active:current === menu.index}]" > {{menu.title}}</i>
                    </el-badge>
                </el-menu-item>
            </el-menu>
        </el-card>
        <div class="body">
            <component v-on:update:menu="menus[current].hasNew = true" @update:component="changeComponent($event)"
                       :menu="menus[current]" :is="currentComponent"/>
        </div>
        <div class="footer">
            <h4>silverspoon</h4>
        </div>
        <el-dialog :visible.sync="dialogVisible" title="头像编辑">
            <img :src="user.avatar" style="width: 200px; height: 200px"/>
            <el-upload class="upload-avatar" action="" drag :auto-upload="false" :show-file-list="false" :on-change="changeUpload">
                <i class="el-icon-upload"/>
                <div class="el-upload__text">点击选择图片</div>
                <div class="el_upload__tip">支持绝大多数图片格式，单张最大支持1MB</div>
            </el-upload>
        </el-dialog>
        <el-dialog title="图片裁切" :visible.sync="avatarVisible" append-to-body>
            <div class="cropper-content">
                <div class="cropper" style="text-align: center">
                    <vueCropper
                        ref="cropper" :img="option.img" :outputSize="option.size" :outputType="option.outputType"
                        :info="true" :full="option.full" :canMove="option.canMove" :canMoveBox="option.canMoveBox"
                        :original="option.original" :autoCrop="option.autoCrop" :fixed="option.fixed" :fixedNumber="option.fixedNumber"
                        :centerBox="option.centerBox" :infoTrue="option.infoTrue" :fixedBox="option.fixedBox" ></vueCropper>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="avatarVisible = false">取消</el-button>
                <el-button type="primary" @click="finish" :loading="loading">确认</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Friends from "./Friends";
    import Recent from "./Recent";
    import Settings from "./Settings";
    import Notify from "./Notification";
    import {FRIENDS, HOME_CURRENT, ISLOGIN, RECENT_CURRENT, RECENTMESSAGES, USER} from "../utils/constant";
    import {Message, Notification} from 'element-ui'
    import {updateAvatar} from "../api/user";

    export default {
        name: "Home.vue",
        data() {
            return {
                avatarVisible: false,
                dialogVisible: false,
                current: 0,
                user: this.$store.getters.user,
                isCollapse: false,
                menus: [
                    {
                        index: 0,
                        tab: Recent,
                        icon: "el-icon-time",
                        title: "最近聊天记录",
                        hasNew: false,
                        path: "/home/recent",
                    },
                    {
                        index: 1,
                        tab: Friends,
                        icon: "el-icon-user",
                        title: "好友列表",
                        hasNew: false,
                        path: "/home/friends",
                    },
                    {
                        index: 2,
                        tab: Notify,
                        icon: "el-icon-bell",
                        title: "通知",
                        hasNew: false,
                        path: "/home/notification"
                    },
                    {
                        index: 3,
                        tab: Settings,
                        icon: "el-icon-info",
                        title: "关于",
                        path: "/home/settings",
                    }
                ],
                option: {
                    img: '', // 裁剪图片的地址
                    info: true, // 裁剪框的大小信息
                    outputSize: 0.8, // 裁剪生成图片的质量
                    outputType: 'jpeg', // 裁剪生成图片的格式
                    canScale: false, // 图片是否允许滚轮缩放
                    autoCrop: true, // 是否默认生成截图框
                    autoCropWidth: 200, // 默认生成截图框宽度
                    autoCropHeight: 200, // 默认生成截图框高度
                    fixedBox: true, // 固定截图框大小 不允许改变
                    fixed: true, // 是否开启截图框宽高固定比例
                    fixedNumber: [1,1], // 截图框的宽高比例
                    full: true, // 是否输出原图比例的截图
                    canMoveBox: false, // 截图框能否拖动
                    original: false, // 上传图片按照原始比例渲染
                    centerBox: false, // 截图框是否被限制在图片里面
                    infoTrue: true // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
                },
                loading: false
            };
        },
        computed: {
            currentComponent: function () {
                return this.menus[this.current].tab;
            }
        },
        methods: {
            changeIndex(index) {
                this.current = index;
                sessionStorage.setItem(HOME_CURRENT, this.current);
                this.menus[this.current].hasNew = false;
            },
            logout() {
                // alert("logout");
                sessionStorage.removeItem(USER);
                sessionStorage.removeItem(ISLOGIN);
                sessionStorage.removeItem(RECENTMESSAGES);
                sessionStorage.removeItem(RECENT_CURRENT);
                sessionStorage.removeItem(FRIENDS);
                sessionStorage.removeItem(HOME_CURRENT);
                this.$router.push({
                    path: '/'
                });
            },
            changeComponent(index) {
                this.current = index;
            },
            cropImage() {
                this.dialogVisible = true;
            },
            // eslint-disable-next-line no-unused-vars
            changeUpload(file, fileList){
                const isLt1M = file.size / 1024 / 1024 < 1;
                if (!isLt1M) {
                    Message.error('上传文件大小不能超过1MB！');
                    return false
                }
                this.fileInfo = file;

                // 上传成功后将图片地址赋值给裁剪框显示图片
                this.$nextTick(() => {
                    this.option.img = URL.createObjectURL(file.raw);
                    this.avatarVisible = true
                });
            },
            // 点击裁剪，这一步是可以拿到处理后的地址
            finish(type) {
                if (type === 'blob') {
                    this.$refs.cropper.getCropBlob((data) =>{
                        this.user.avatar = URL.createObjectURL(data);
                        // eslint-disable-next-line no-console
                        console.log(data)
                    })
                }else {
                    this.$refs.cropper.getCropData(data =>{
                        this.user.avatar = data;
                        let upload = {};
                        upload['uuid'] = this.user.UUID;
                        upload['avatar'] = data;
                        new Promise((resolve, reject) => {
                            updateAvatar(upload).then((response) => {
                                let result = response.data;
                                if (result.code === 200) {
                                    Notification.success(result.data);
                                } else {
                                    Notification.error(result.data);
                                }
                            }).catch(error => {
                                Notification.error(error);
                                reject(error);
                            })
                        })
                    })
                }
                this.avatarVisible = false;
                this.dialogVisible = false;
            }
        },
        created() {
            this.current = sessionStorage.getItem(HOME_CURRENT);
            if (this.current === null)
                this.current = 0;
        }
    }

</script>

<style scoped>
    * {
        margin: 0 0;
        border: 0;
    }
    .cropper-content .cropper{
            width: auto;
            height: 300px;
    }
    .home {
        height: 100%;
        width: 100%;
        background-color: rgba(44,62,80,0.85);
    }
    .active{
        color: #409EFF;
    }
    .user-home {
        height: 60px;
        width: 200px;
        position: relative;
        top: -53px;
        left: 240px;
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
        width: 120px;
        text-align: left;
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
        margin-left: -60px;
        margin-top: 200px;
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
    #image {
        max-width: 100%;
    }
</style>