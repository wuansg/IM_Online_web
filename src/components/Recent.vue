<template>
    <el-card class="recent">
        <div class="recent-aside">
            <el-scrollbar class="recent-scrollbar">
                <ul>
                    <li v-for="(record, index) in recentMessages" :key="record.userID" @click="changeCurrent(index)"
                        :class="checkIndex(index)?'touch':''">
                        <img :src="record.avatar"/>
<!--                        <img src="../assets/logo.png">-->
                        <h3 class="username">{{ record.username }}</h3>
                        <p class="last-message">{{ (record.messageList!== null&&record.messageList.length>0)?record.messageList[record.messageList.length-1].content:''}}</p>
                        <el-divider/>
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
                <el-scrollbar class="message-scrollbar" ref="message-scrollbar">
                <ul>
<!--                    <li v-for="record in (recentMessages[current].messageList)" v-bind:key="record.UUID" >-->
<!--                        <p :class="[checkType(record)?'from':'to']">{{ checkType(record)? recentMessages[current].username:user.username }}, {{ record.time }}</p>-->
<!--                        <p class="content">{{ record.content }}</p>-->
<!--                    </li>-->
                    <li v-for="record in (recentMessages[current].messageList)" v-bind:key="record.UUID">
                        <p class="message-time">{{ record.time }}</p>
                        <div :class="checkType(record)?'from':'to'">
                            <p class="content" v-if="!checkType(record)">{{ record.content }}</p>
                            <img :src="record.avatar" style="width: 28px; height: 28px;"/>
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

    export default {
        name: "Recent.vue",
        data() {
            return {
                currentKey: "recent_current",
                recentKey: "recentMessages",
                current: -1,
                text: '',
                user: this.$store.getters.user,
                recentMessages: null
                // recentMessages: [{
                //     userID: '',
                //     avatar: '',
                //     username: '',
                //     messageList: [{
                //         UUID: '',
                //         SenderID: '',
                //         ReceiverID: '',
                //         type: 1,
                //         status: 0,
                //         content: '',
                //         time: ''
                //     }]
                // }]
            }
        },
        methods: {
            checkType(record) {
                // eslint-disable-next-line no-console
                return record.senderID === this.recentMessages[this.current].userID;

            },
            checkIndex(index) {
                return index === this.current;

            },
            changeCurrent(index) {
                this.current = index;
                sessionStorage.setItem(this.currentKey, index);
            },
            SendFiles() {

            },
            SendMessage() {
                let data = {
                    senderID: this.user.UUID,
                    receiverID: this.recentMessages[this.current].userID,
                    type: 1,
                    status: 0,
                    content: this.text.trim()
                };
                // eslint-disable-next-line no-console
                console.log(this.recentMessages);
                new Promise((resolver, reject) => {
                    addMessage(data).then(response => {
                        this.recentMessages[this.current].messageList.push(response.data.data);
                        // sessionStorage.setItem(this.recentKey, JSON.stringify(this.recentMessages));
                        resolver();
                    }).catch(error => {
                        reject(error);
                    })
                });
                if (this.current !== 0) {
                    let recentMessage = this.recentMessages[this.current];
                    this.recentMessages.splice(this.current, 1);
                    this.recentMessages.unshift(recentMessage);
                    this.current = 0;
                }
                // eslint-disable-next-line no-console
                console.log(this.recentMessages);
                sessionStorage.setItem(this.recentKey, this.recentMessages);
                // this.recentMessages[this.current].messageList.push(data);
                // sessionStorage.setItem(this.recentKey, JSON.stringify(this.recentMessages));
                this.text = '';
            },
            getRecentList() {
                if (this.recentMessages === null) {
                    this.recentMessages = JSON.parse(sessionStorage.getItem(this.recentKey));
                    if (this.recentMessages === null) {
                        new Promise((resolve, reject) => {
                            let user = this.$store.getters.user;
                            getMessagesInterval(user.UUID).then(response => {
                                this.recentMessages = response.data.data;
                                // eslint-disable-next-line no-console
                                // console.log(response.data.data);
                                sessionStorage.setItem("recentMessages", JSON.stringify(response.data.data));
                                resolve();
                            }).catch(error => {
                                reject(error);
                            })
                        });
                    }
                }
            },
            chat() {
                this.$refs['message-scrollbar'].wrap.scrollTop = this.$refs['message-scrollbar'].wrap.scrollHeight;
            }
        },
        created() {
            this.getRecentList();
            this.current = sessionStorage.getItem(this.currentKey);
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
                let recentMessages = this.recentMessages;
                // recentMessages = JSON.parse(recentMessages);
                // eslint-disable-next-line no-console
                // console.log(this.user.UUID);
                new Promise((resolve, reject) => {
                    getMessagesInterval(this.$store.getters.user.UUID).then(response => {
                        let data = response.data;
                        // eslint-disable-next-line no-console
                        // console.log(data);
                        if (data.code === 200) {
                            let unreads = data.data;
                            // eslint-disable-next-line no-console
                            // console.log(unreads);
                            unreads.forEach(unread => {
                                let index = recentMessages.findIndex(element => element.userID == unread.userID);
                                if (index > 0) {
                                    let recentMessage = recentMessages[index];
                                    unread.messageList.forEach(o => {
                                        recentMessage.messageList.push(o)
                                    });
                                    recentMessages.splice(index, 1);
                                    recentMessages.unshift(recentMessage);
                                }else if (index === 0) {
                                    let recentMessage = recentMessages[index];
                                    unread.messageList.forEach(o => {
                                        recentMessage.messageList.push(o)
                                    })
                                }else {
                                    recentMessages.unshift(unread)
                                }
                            });
                            sessionStorage.setItem("recentMessages", JSON.stringify(recentMessages));
                        }
                        resolve()
                    }).catch(error => {
                        reject(error);
                    })
                })
            }, 10000);
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
    .recent-scrollbar {
        height: 100%;
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
        width: 220px;
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
        height: 100%;
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
        margin: 0 4px;
        padding: 0 5px;
        font-size: x-large;
        text-align: right;
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
</style>