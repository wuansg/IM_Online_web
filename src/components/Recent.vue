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
                    <li v-for="(message,index) in messages" :key="message.userID" @click="changeCurrent(index)"
                        :class="checkIndex(index)?'touch':''">
                        <el-divider/>
                        <img :src="message.avatar" />
                        <h3 class="username">{{ message.username }}</h3>
                        <p class="last-message">{{ (message.messageList !== null && message.messageList.length > 0)
                            ? getPreviewMessage(message):''}}</p>
                        <el-badge :value="message.count === undefined ? 0 : message.count" style="margin-top: 20px"
                                  :hidden="message.count === undefined || message.count <= 0"/>
                    </li>
                </ul>
            </el-scrollbar>
        </div>
        <div class="recent-body" v-if="current !== -1">
            <div class="user-box">
<!--                <div>-->
<!--                    <img :src="recentMessages[current].avatar"/>-->
<!--                </div>-->
                <span>{{ messages[current].username }}</span>
            </div>
            <div class="message-box">
                <el-link @click="getMoreMessages">查看更多消息</el-link>
                <el-scrollbar class="message-scrollbar" ref="message-scrollbar">
                <ul>
                    <li v-for="(record, index) in (messages[current].messageList)" v-bind:key="record.UUID">
                        <p class="message-time" v-if="index === 0 || record.time - messages[current].messageList[index-1].time > 200">{{ formatDate(record.time) }}</p>
                        <div :class="checkType(record)?'from':'to'" v-if="record.type === 0">
                            <i class="el-icon-warning" v-if="record.error" @click="resend(record)"/>
                            <p class="content-text" v-if="!checkType(record)">{{ record.content }}</p>
                            <img :src="checkType(record)?messages[current].avatar:user.avatar"
                                 style="width: 40px; height: 40px;"/>
                            <p  class="content-text" v-if="checkType(record)">{{ record.content }}</p>
                        </div>
                        <div :class="checkType(record)?'from':'to'" v-else-if="record.type === 1">
                            <i class="el-icon-warning" v-if="record.error" @click="resend(record)"/>
                            <img class="content-pic" :src="record.content" v-if="!checkType(record)">
                            <img :src="checkType(record)?messages[current].avatar:user.avatar"
                                 style="width: 40px; height: 40px;"/>
                            <img class="content-pic" :src="record.content" v-if="checkType(record)">
                        </div>
                    </li>
                </ul>
                </el-scrollbar>
            </div>
            <div class="tool-box">
                <el-tooltip class="item" effect="dark" content="发送文件" placement="bottom">
                    <el-upload class="file-upload" multiple action="" :auto-upload="false" :show-file-list="false" :on-change="sendFile"
                        >
                        <el-button class="send-file el-icon-files" />
                    </el-upload>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="发送图片" placement="bottom">
                    <el-upload class="file-upload" action="" :auto-upload="false" :show-file-list="false" :on-change="sendPic"
                        >
                        <el-button class="send-pic el-icon-picture"/>
                    </el-upload>
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
    import {getMessagesInterval, postFile, postPic, updateStatus} from "../api/recent";
    import {Message, Notification} from 'element-ui'
    import {RECENT_CURRENT, MESSAGES, FILE_MAX_SIZE, PIC_MAX_SIZE} from "../utils/constant";
    import {validateFileSize, validatePic, validatePicSize} from "../utils/validate";

    export default {
        name: "Recent.vue",
        data() {
            return {
                messages: this.$parent.messages,
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
                // return record.senderID === this.recentMessages[this.current].userID;
                return record.senderID !== this.user.UUID;
            },
            checkIndex(index) {
                return index === this.current;
            },
            changeCurrent(index) {
                this.current = index;
                if (this.messages[this.current].count > 0) {
                    this.$parent.menus[0].hasNew = false;
                    // this.recentMessages[this.current].count = 0;
                    sessionStorage.setItem(RECENT_CURRENT, index);
                    sessionStorage.setItem(MESSAGES, JSON.stringify(this.recentMessages));
                    let data = {
                        receiverID: this.user.UUID,
                        senderID: this.messages[this.current].userID
                    };
                    updateStatus(data).then(response => {
                        if (response.data.code === 200) {
                            this.messages[this.current].count = 0;
                        }
                    })
                }
            },
            sendFile(file) {
                const result = validateFileSize(file.raw);
                if (!result) {
                    Message.error("文件大小不能超过" + FILE_MAX_SIZE / 1024 / 1024 + "M.");
                    return;
                }
                let data = {
                    senderID: this.user.UUID,
                    receiverID: this.messages[this.current].userID,
                    type: 1,//表示图片
                    status: 0,
                    time: new Date().getTime(),
                    content: {
                        name: file.raw.name,
                        path: ''
                    }
                };
                this.$parent.messages[this.current].messageList.push(data);
                let param = new FormData();
                param.append('file', file.raw);
                postFile(param).then(response => {
                    if (response.data.code === 200) {
                        data.content.path = response.data.data;
                        try {
                            delete data.error;
                            this.$parent.websocketsend(JSON.stringify(data))
                        }catch (e) {
                            Notification.error('消息发送出错：'+e);
                            data['error'] = true;
                        }
                    }
                }).catch(error => {
                    Notification.error('图片上传失败：' + error);
                    data['error'] = true;
                })
            },
            sendPic(file) {
                const result = validatePic(file.raw) & validatePicSize(file.raw);
                if (!result){
                    Message.error("文件格式必须为image/png,image/jpg,image/jpeg, 并且文件大小不能超过"
                    + PIC_MAX_SIZE / 1024 / 1024 + "M.");
                    return
                }
                let data = {
                    senderID: this.user.UUID,
                    receiverID: this.messages[this.current].userID,
                    type: 1,//表示图片
                    status: 0,
                    time: new Date().getTime(),
                    content: ''
                };
                this.$parent.messages[this.current].messageList.push(data);
                let param = new FormData(); //创建FormData对象
                param.append('file', file.raw);// 通过append向form表单中添加数据
                postPic(param).then(response => {
                    // 当文件保存成功后发送一条消息记录
                    if (response.data.code === 200) {
                        try {
                            delete data.error;
                            data.content = response.data.data;
                            this.$parent.websocketsend(JSON.stringify(data))
                        }catch(e){
                            Notification.error('消息发送出错:'+e);
                            data['error'] = true;
                        }
                    }
                }).catch(error => {
                    Notification.error('图片上传失败：' + error);
                    data['error'] = true;
                })
            },
            SendMessage() {
                if (this.text.trim() === ''){
                    Message.info('内容为空');
                    this.text = '';
                    return;
                }
                let data = {
                    senderID: this.user.UUID,
                    receiverID: this.messages[this.current].userID,
                    type: 0, //表示文本
                    status: 0,
                    time: new Date().getTime(),
                    content: this.text.trim()
                };
                this.text = '';
                try {
                    delete data.error;
                    this.$parent.websocketsend(JSON.stringify(data))
                }catch (e) {
                    Notification.error('连接已断开,请重试' + e);
                    data['error'] = true;
                }
                this.messages[this.current].messageList.push(data);
                let message = this.messages[this.current];
                this.messages.splice(this.current, 1);
                this.messages.unshift(message);
                this.current = 0;
                sessionStorage.setItem(MESSAGES, JSON.stringify(this.messages))
            },
            getMoreMessages(){
                Message.error('该功能暂未开放');
            },
            chat() {
                if (this.current !== -1) {
                    this.$refs['message-scrollbar'].wrap.scrollTop = this.$refs['message-scrollbar'].wrap.scrollHeight;
                }
            },
            getPreviewMessage(message) {
                let record = message.messageList[message.messageList.length-1];
                if (record.type === 0) {
                    return record.content;
                }else if (record.type === 1) {
                    return '[图片]';
                }else if (record.type === 2) {
                    return '[文件]';
                }
            },
            resend(message) {
                message['error'] = false;
                delete message.error;
                try {
                    this.$parent.websocketsend(JSON.stringify(message));
                    sessionStorage.setItem(MESSAGES, JSON.stringify(this.messages))
                }catch (e) {
                    message['error'] = true;
                    Notification.error('重新发送消息出错：' + e);
                }
            },
            formatDate(dateString) {
                const date = new Date(dateString);
                return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
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
            this.current = sessionStorage.getItem(RECENT_CURRENT);
            if (this.current === null || this.messages === null || this.messages.length <= 0)
                this.current = -1;
            // eslint-disable-next-line no-console
            // console.log(this.recentMessages.findIndex(element => element.userID == this.$store.getters.userID));
        },
        updated() {
            this.chat();
        },
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
        height: 470px;
        width: 877px;
        border-bottom: 1px solid #2c3e50;
        padding-bottom: 12px;
    }
    .message-scrollbar {
        height: 450px;
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
    .content-text {
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
    .content-pic {
        max-width: 400px;
        max-height: 400px;
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