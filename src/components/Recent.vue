<template>
    <el-card class="recent">
        <div class="recent-aside">
            <div class="recent-search">
                <el-input
                        placeholder="搜索聊天内容"
                        prefix-icon="el-icon-search"
                        class="search_input"
                        v-model="keyword"
                        clearable
                />
            </div>
            <el-scrollbar class="recent-scrollbar" v-loading="loading">
                <ul>
                    <li v-for="(record, index) in recentMessages" :key="record.userID" @click="changeCurrent(index)"
                        :class="checkIndex(index)?'touch':''">
                        <el-divider/>
                        <img :src="record.avatar" />
<!--                        <img src="../assets/logo.png">-->
                        <h3 class="username">{{ record.username }}</h3>
                        <p class="last-message">{{ (record.messageList!== null&&record.messageList.length>0)?record.messageList[record.messageList.length-1].content:''}}</p>
                        <el-badge :value="record.count === undefined ? 0:record.count" style="margin-top: 20px"
                            :hidden="record.count === undefined || record.count <= 0">
                        </el-badge>
                    </li>
                </ul>
            </el-scrollbar>
        </div>
        <div class="recent-body" v-if="current !== -1">
            <div class="user-box">
<!--                <div>-->
<!--                    <img :src="recentMessages[current].avatar"/>-->
<!--                </div>-->
                <span>{{ recentMessages[current].username }}</span>
            </div>
            <div class="message-box">
                <el-link @click="getMoreMessages">查看更多消息</el-link>
                <el-scrollbar class="message-scrollbar" ref="message-scrollbar">
                <ul>
                    <li v-for="record in (recentMessages[current].messageList)" v-bind:key="record.UUID">
                        <p class="message-time">{{ record.time }}</p>
                        <div :class="checkType(record)?'from':'to'">
                            <p class="content" v-if="!checkType(record)">{{ record.content }}</p>
                            <img :src="record.avatar" style="width: 40px; height: 40px;"/>
                            <p  class="content" v-if="checkType(record)">{{ record.content }}</p>
                        </div>
                    </li>
                </ul>
                </el-scrollbar>
            </div>
            <div class="tool-box">
                <el-tooltip class="item" effect="dark" content="发送文件" placement="bottom">
                    <el-upload class="file-upload" multiple action="">
                        <el-button class="send-file el-icon-files" @click="SendFiles" type="file"/>
                    </el-upload>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="发送图片" placement="bottom">
                    <el-button class="send-pic el-icon-picture"/>
                </el-tooltip>
                <el-button class="send-message" type="primary" round @click="SendMessage">发送消息</el-button>
            </div>
            <div class="write-message">
                <el-input type="textarea" v-model="text" :rows="4" @keyup.enter.native.exact="SendMessage"/>
            </div>
        </div>
    </el-card>
</template>

<script>
    import { addMessage, getMessagesInterval} from "../api/recent";
    import {Message, Notification} from 'element-ui'
    import {RECENT_CURRENT, RECENTMESSAGES, UPDATE_MENU} from "../utils/constant";

    export default {
        name: "Recent.vue",
        data() {
            return {
                keyword: '',
                loading: false,
                current: -1,
                text: '',
                user: this.$store.getters.user,
                recentMessages: null
            }
        },
        methods: {
            checkType(record) {
                return record.senderID === this.recentMessages[this.current].userID;
            },
            checkIndex(index) {
                return index === this.current;
            },
            changeCurrent(index) {
                this.current = index;
                this.recentMessages[this.current].count = 0;
                sessionStorage.setItem(RECENT_CURRENT, index);
                sessionStorage.setItem(RECENTMESSAGES, JSON.stringify(this.recentMessages));
            },
            SendFiles() {

            },
            SendMessage() {
                if (this.text.trim() === ''){
                    Message.info('内容为空');
                    this.text = '';
                    return;
                }
                let data = {
                    senderID: this.user.UUID,
                    receiverID: this.recentMessages[this.current].userID,
                    type: 1,
                    status: 0,
                    time: new Date(),
                    content: this.text.trim(),
                    loading: true
                };
                this.text = '';
                new Promise((resolve, reject) => {
                    addMessage(data).then(response => {
                        this.recentMessages[this.current].messageList.push(response.data.data);
                        sessionStorage.setItem(RECENTMESSAGES, JSON.stringify(this.recentMessages));
                        resolve();
                    }).catch(error => {
                        Notification.error('网络异常');
                        reject(error);
                    })
                });
                if (this.current !== 0) {
                    let recentMessage = this.recentMessages[this.current];
                    this.recentMessages.splice(this.current, 1);
                    this.recentMessages.unshift(recentMessage);
                    this.current = 0;
                }
            },
            getRecentList() {
                if (this.recentMessages === null) {
                    this.recentMessages = JSON.parse(sessionStorage.getItem(RECENTMESSAGES));
                    if (this.recentMessages === null) {
                        new Promise((resolve, reject) => {
                            let user = this.$store.getters.user;
                            getMessagesInterval(user.UUID).then(response => {
                                this.recentMessages = response.data.data;
                                this.recentMessages.forEach(o => {
                                    o.count = o.messageList.length;
                                });
                                if (this.recentMessages.length > 0)
                                    this.$emit(UPDATE_MENU);
                                // eslint-disable-next-line no-console
                                // console.log(response.data.data);
                                sessionStorage.setItem(RECENTMESSAGES, JSON.stringify(response.data.data));
                                resolve();
                            }).catch(error => {
                                reject(error);
                            })
                        });
                    }
                }
            },
            getMoreMessages(){
            },
            chat() {
                this.$refs['message-scrollbar'].wrap.scrollTop = this.$refs['message-scrollbar'].wrap.scrollHeight;
            }
        },
        watch: {
            keyword: function (newValue) {
                this.loading=true;
                new Promise((resolve, reject) => {
                    getMessagesInterval(newValue).then(response => {
                        response;
                        resolve()
                    }).catch(error => {
                        reject(error)
                    })
                });
                this.loading = false;
            }
        },
        created() {
            this.getRecentList();
            this.current = sessionStorage.getItem(RECENT_CURRENT);
            if (this.current === null || this.recentMessages.length <= 0)
                this.current = -1;
            // eslint-disable-next-line no-console
            // console.log(this.recentMessages.findIndex(element => element.userID == this.$store.getters.userID));
        },
        updated() {
            this.chat();
        },
        mounted() {
            setInterval(() => {
                new Promise((resolve, reject) => {
                    getMessagesInterval(this.$store.getters.user.UUID).then(response => {
                        let data = response.data;
                        let recentMessages = this.recentMessages;
                        if (data.code === 200 && data.data.length > 0) {
                            let unreads = data.data;
                            unreads.forEach(unread => {
                                let index = recentMessages.findIndex(element => element.userID === unread.userID);
                                if (index > 0) {
                                    let recentMessage = recentMessages[index];
                                    recentMessage.count = recentMessage.messageList.length;
                                    unread.messageList.forEach(o => {
                                        recentMessage.messageList.push(o)
                                    });
                                    recentMessages.splice(index, 1);
                                    recentMessages.unshift(recentMessage);
                                }else if (index === 0) {
                                    let recentMessage = recentMessages[index];
                                    recentMessage.count = recentMessage.messageList.length;
                                    unread.messageList.forEach(o => {
                                        recentMessage.messageList.push(o)
                                    })
                                }else {
                                    unread.count = unread.messageList.length;
                                    recentMessages.unshift(unread)
                                }
                            });
                            if (unreads.length > 0)
                                this.$emit(UPDATE_MENU);
                            sessionStorage.setItem(RECENTMESSAGES, JSON.stringify(recentMessages));
                        }
                        resolve()
                    }).catch(error => {
                        reject(error);
                    })
                })
            }, 1500);
        }
    }

</script>

<style scoped>
    * {
        margin: 0;
        padding: 0;
        border: 0;
    }
    .recenttr-enter-active, .recenttr-leave-active {
        transition: all 1s;
    }
    .recenttr-enter, .recenttr-leave-to {
        opacity: 0;
        transform: translateY(720px);
    }
    .recent {
        height: 720px;
        width: 1200px;
        background-color: #FFFFFF;
        border-radius: 12px;
    }
    /deep/ .el-card__body {
        padding: 0;
    }
    .recent-aside {
        width: 320px;
        height: 720px;
        text-align: left;
        border-right: 3px solid #2c3e50;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
    }
    .recent-search {
        padding: 10px 6px;
    }
    .recent-scrollbar {
        height: 660px;
        display: flex;
    }
    /deep/ .el-scrollbar__wrap {
        width: 110%;
        overflow-x: hidden;
    }
    .recent-aside ul {
        padding: 0;
        overflow: auto;
        list-style: none;
    }
    .recent-aside li {
        height: 64px;
        padding: 0 4px;
    }
    .touch {
        background-color: aliceblue;
    }
    .recent-aside li:hover{
        background-color: aliceblue;
    }
    .recent-aside img {
        float: left;
        height: 64px;
        width: 64px;
    }
    .recent-aside p,h3 {
        padding: 0 10px;
        float: left;
        height: 32px;
        display: inline;
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .recent-aside p {
    }
    .recent-body {
        position: relative;
        width: 877px;
        height: 640px;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        top: -720px;
        left: 323px;
    }
    .user-box {
        border-bottom: 1px solid #2c3e50;
    }
    .user-box img {
        width: 64px;
        height: 64px;
    }
    .user-box span {
        font-weight: bold;
        font-size: x-large;
    }
    .message-box {
        height: 480px;
        width: 877px;
        border-bottom: 1px solid #2c3e50;
        padding-bottom: 4px;
    }
    .message-scrollbar {
        height: 460px;
        width: 877px;
        display: flex;
    }
    .message-box li {
        list-style: none;
        padding: 0 12px;
        text-align: left;
    }
    .message-time {
        display: block;
        text-align: center;
        color: cornflowerblue;
    }
    .from {
        width: 100%;
        /*display: inline;*/
        /*color: crimson;*/
        text-align: left;
    }
    .to {
        width: 100%;
        /*display: inline-block;*/
        /*color: aqua;*/
        /*float: right;*/
        text-align: right;
    }
    .content {
        max-width: 400px;
        white-space: normal;
        word-break: break-all;
        word-wrap: break-word;
        margin: 0 4px;
        padding: 0 5px;
        font-size: large;
        text-align: left;
        /*background-color: rgba(176,241,238,0.6);*/
        display: inline-block;
        border: 1px solid #FFFFFF;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
    }
    .tool-box {
        height: 36px;
        padding: 2px 5px 4px;
        text-align: left;
        border-bottom: 1px solid #2c3e50;
    }
    .file-upload {
        float: left;
    }
    .tool-box button {
        padding: 12px 20px;
    }
    /deep/ .el-button+.el-button {
        margin-left: 2px;
    }
    .send-message {
        float: right;
    }
    .write-message {
        width: 100%;
        height: 172px;
        text-align: left;
    }
    /deep/ .el-textarea__inner {
        border: 0;
        font-size: x-large;
    }
    img {
        border-radius: 32px;
    }
    /deep/ .el-loading-spinner .circular {
        width: 24px;
        height: 24px;
    }
    /deep/ .el-loading-mask {
        position: absolute;
        top: 24px;
    }
    .loading {
        display: inline-block;
        width: 30px;
        height: 37px;
    }
</style>