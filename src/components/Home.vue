<template>
    <el-container class="home">
        <el-header class="header">
            <el-popover
                    style="text-align: center"
                    placement="bottom"
                    trigger="hover">
                <div style="text-align: center">
                    <h2>{{ user.username }}</h2>
                    <el-button style="color: red; font-size: 14px" type="text" @click.native="logout">注销</el-button>
                </div>
                <el-avatar slot="reference" class="header-avatar" :size="60" :src="user.avatar" @click.native="cropImage"/>
            </el-popover>
            <div style="flex: 1; text-align: center">
                <h1 style="color: aliceblue; font-size: 45px">IM Online</h1>
            </div>
        </el-header>
        <el-main>
            <div style="display: flex">
                <div style="width: 300px">
                    <el-card class="sidebar" :class="{ open: !isCollapse }">
                        <div :class="['sidebar-item', {active:current === menu.index}]" v-for="menu in menus" :key="menu.index" @click="changeIndex(menu.index)">
                            <el-badge :is-dot="menu.hasNew" >
                                <i :class="menu.icon" style="color: #d4d4d4; margin: 0 6px"></i>
                                <span style="color: #d4d4d4">{{ menu.title }}</span>
                            </el-badge>
                        </div>
                    </el-card>
                </div>
                <div>
                    <component class="body"
                               :friends="friends"
                               :messages="messages"
                               :notifications="notifications"
                            @update:component="changeComponent($event)"
                               :menus="menus" :is="currentComponent"/>
                </div>
            </div>
        </el-main>
        <el-footer class="footer">
            <h1 style="color: black">2020 &copy; IM-Online silverspoon</h1>
        </el-footer>
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
    </el-container>
</template>

<script>
    import Friends from "./Friends";
    import Recent from "./Recent";
    import Settings from "./Settings";
    import Notify from "./Notification";
    import {
        FRIENDS,
        HOME_CURRENT,
        ISLOGIN,
        RECENT_CURRENT,
        MESSAGES,
        USER,
        REQUESTS, IM_MESSAGE, IM_NOTIFICATION, NOTIFICATIONS
    } from "../utils/constant";
    import {Message, Notification} from 'element-ui'
    import {updateAvatar} from "../api/user";
    import {getMessagesInterval} from "../api/recent";
    import {getFriends, getRequests} from "../api/friends";
    import {getNotifications} from "../api/notification";
    import {WSURI} from "../utils/request";

    export default {
        name: "Home.vue",
        data() {
            return {
                avatarVisible: false,
                dialogVisible: false,
                current: 1,
                user: this.$store.getters.user,
                isCollapse: false,
                menus: [
                    {
                        index: 0,
                        tab: Recent,
                        icon: "el-icon-time",
                        title: "最近聊天记录",
                        hasNew: false,
                    },
                    {
                        index: 1,
                        tab: Friends,
                        icon: "el-icon-user",
                        title: "好友列表",
                        hasNew: false,
                    },
                    {
                        index: 2,
                        tab: Notify,
                        icon: "el-icon-bell",
                        title: "通知",
                        hasNew: false,
                    },
                    {
                        index: 3,
                        tab: Settings,
                        icon: "el-icon-info",
                        title: "关于",
                        hasNew: false,
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
                loading: false,
                messages: null,
                friends: null,
                requests: null,
                websocket: null,
                notifications: null,
            };
        },
        computed: {
            currentComponent: function () {
                return this.menus[this.current].tab;
            }
        },
        methods: {
            initwebsocket() {
                // const wsuri = +this.user.UUID;
                const wsuri = WSURI + this.user.UUID;
                this.websocket = new WebSocket(wsuri);
                this.websocket.onmessage = this.websocketonmessage;
                this.websocket.onclose = this.websocketonclose;
                this.websocket.onerror = this.websocketonerror;
                this.websocket.onopen = this.websocketonopen;
            },
            websocketonmessage(e) {
                if (this.websocket.isCloned) {
                    this.initwebsocket();
                }
                let result = JSON.parse(e.data);
                let data = result.data;
                if (data.type === 2) {
                    data.content = JSON.parse(data.content);
                }
                if (result.type === IM_MESSAGE) {
                    let message = {
                        userID: data.senderID,
                        avatar: this.friends.content.find(o => o.uuid === data.senderID).avatar,
                        username: this.friends.content.find(o => o.uuid === data.senderID).username,
                        count: 1,
                        messageList: [
                            data
                        ]
                    };
                    if (this.messages === null) {
                        this.messages = message;
                    } else {
                        let index = this.messages.findIndex(o => o.userID === data.senderID);
                        if (index >= 0) {
                            message = this.messages[index];
                            message.count++;
                            message.messageList.push(data);
                            this.messages.splice(index, 1);
                            this.messages.unshift(message);
                        } else {
                            this.messages.unshift(message);
                        }
                        if (this.$children[0].current === index)
                            this.$children[0].current = 0;
                        else if (index === -1 || this.$children[0].current > index)
                            this.$children[0].current++;
                    }
                    this.menus[0].hasNew = true;
                    sessionStorage.setItem(MESSAGES, JSON.stringify(this.messages));
                }else if (result.type === IM_NOTIFICATION) {
                    data.content = JSON.parse(data.content);
                    if (this.notifications === null) {
                        this.notifications = [data];
                    }else {
                        this.notifications.push(data);
                    }
                    this.menus[2].hasNew = true;
                    sessionStorage.setItem(NOTIFICATIONS, JSON.stringify(this.notifications))
                }
            },
            websocketonopen() {
                // eslint-disable-next-line no-console
                console.log("websocket连接建立成功.")
            },
            websocketonerror(e) {
                // eslint-disable-next-line no-console
                console.log("websocket连接建立失败.");
                // this.initwebsocket();
                Notification.error('连接出错：'+e)
            },
            websocketsend(data){
                if (this.websocket.readyState !== 1) {
                    throw new Error('连接出错');
                }
                try {
                    this.websocket.send(data);
                }catch (e) {
                    Notification.error(e);
                }
            },
            websocketonclose() {
                // eslint-disable-next-line no-console
                console.log("websocket连接已断开.")
            },
            changeIndex(index) {
                this.current = index;
                sessionStorage.setItem(HOME_CURRENT, this.current);
                this.menus[index].hasNew = false;
            },
            logout() {
                this.websocket.close();
                // alert("logout");
                sessionStorage.removeItem(USER);
                sessionStorage.removeItem(ISLOGIN);
                sessionStorage.removeItem(MESSAGES);
                sessionStorage.removeItem(RECENT_CURRENT);
                sessionStorage.removeItem(FRIENDS);
                sessionStorage.removeItem(HOME_CURRENT);
                sessionStorage.removeItem(NOTIFICATIONS);
                this.$router.push({
                    path: '/'
                });
                console.log(1)
            },
            changeComponent(index) {
                this.current = index;
            },
            cropImage() {
                this.dialogVisible = true;
            },
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
            },
            //获取未读记录
            getMessages() {
                if (this.messages === null){
                    this.messages = JSON.parse(sessionStorage.getItem(MESSAGES));
                    if (this.messages === null) {
                        new Promise((resolve, reject) => {
                            let user = this.$store.getters.user;
                            this.messages = [];
                            getMessagesInterval(user.UUID).then(response => {
                                response.data.data.forEach(o => {
                                    this.messages.push(o);
                                });
                                this.messages.forEach(o => {
                                    o.count = o.messageList.length;
                                    o.messageList.forEach(o2 => {
                                        if (o2.type === 2) {
                                            o2.content = JSON.parse(o2.content);
                                        }
                                    })
                                });
                                if (this.messages.length > 0) {
                                    this.menus[0].hasNew = true;
                                }
                                sessionStorage.setItem(MESSAGES, JSON.stringify(this.messages));
                                resolve();
                            }).catch(error => {
                                Notification.error('获取未读消息出错！' + error);
                                reject(error);
                            })
                        });
                    }
                }
            },
            //获取好友列表
            getFriends() {
                if (this.friends === null) {
                    this.friends = JSON.parse(sessionStorage.getItem(FRIENDS));
                    if (this.friends === null) {
                        let data = {};
                        data['uuid'] = this.user.UUID;
                        data['pageNum'] = 0;
                        data['pageSize'] = 20;
                        new Promise((resolve, reject) => {
                            getFriends(data).then(response => {
                                if (response.data.code === 200) {
                                    // eslint-disable-next-line no-console
                                    this.friends = response.data.data;
                                } else {
                                    alert(response.data.data);
                                }
                                sessionStorage.setItem(FRIENDS, JSON.stringify(this.friends));
                                resolve()
                            }).catch(error => {
                                reject(error);
                            })
                        })
                    }
                }
            },
            //获取好友请求列表
            getRequests() {
                if (this.requests === null) {
                    this.requests = JSON.parse(sessionStorage.getItem(REQUESTS));
                    if (this.requests === null) {
                        new Promise((resolve, reject) => {
                            let data = {};
                            data['uuid'] = this.user.UUID;
                            data['pageNum'] = 0;
                            data['pageSize'] = 8;
                            getRequests(data).then(response => {
                                let data = response.data;
                                if (data.code === 200) {
                                    this.requests = data.data;
                                    if (this.requests !== null && this.requests.length > 0)
                                        this.menus[1].hasNew = true;
                                }
                                sessionStorage.setItem(REQUESTS, JSON.stringify(this.requests));
                                resolve();
                            }).catch(error => {
                                Notification.error({
                                    title: '获取好友请求出错',
                                    message: '网络异常: ' + error
                                });
                                reject(error);
                            })
                        });
                    }
                }
            },
            //获取未读通知列表
            getNotifications() {
                if (this.requests === null) {
                    this.requests = JSON.parse(sessionStorage.getItem(NOTIFICATIONS));
                    if (this.requests === null) {
                        new Promise((resolve, reject) => {
                            getNotifications(this.user.UUID).then(response => {
                                let data = response.data;
                                if (data.code === 200) {
                                    this.notifications = [];
                                    data.data.forEach(o => {
                                        o.content = JSON.parse(o.content);
                                        this.notifications.push(o);
                                    });
                                    if (this.notifications !== null && this.notifications.length > 0)
                                        this.menus[2].hasNew = true;
                                }
                                sessionStorage.setItem(NOTIFICATIONS, JSON.stringify(this.notifications));
                                resolve();
                            }).catch(error => {
                                Notification.error({
                                    title: '获取通知列表出错',
                                    message: '网络异常: ' + error
                                });
                                reject(error);
                            })
                        });
                    }
                }
            }
        },
        created() {
            this.initwebsocket();
            this.getMessages();
            this.getFriends();
            this.getRequests();
            this.getNotifications();
        },
        destroyed() {
            this.websocket.close();
        },
        beforeCreate() {
        },
    }

</script>

<style scoped>
    * {
        font-family: "微软雅黑","Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
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
        background-color: #dededf;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
    }
    .active{
        background-color: darkgray;
    }
    .header {
        display: flex;
        width: 100%;
        padding: 0 300px 0 240px;
        background-color: #2c3e50;
        box-shadow: 0 2px 30px 0 rgba(0, 0, 0, 0.1)
    }
    .header>h1 {
        display: inline-block;
        text-align: center;
        height: 100%;
        color: aliceblue;
        font-size: xx-large;
    }
    .header-avatar {
        float: left;
    }
    .sidebar {
        background-color: dimgray;
        width: 200px;
        text-align: left;
        margin-top: 200px;
    }
    .sidebar-item {
        padding: 12px 30px;
    }
    .sidebar-item:hover {
        background-color: darkgray;
    }
    /deep/ .el-card__body {
        padding: 0;
    }
    .body {
        text-align: center;
        margin-left: 100px;
    }
    .footer {
        margin-top: 20px;
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