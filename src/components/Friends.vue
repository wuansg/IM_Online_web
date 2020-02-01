<template>
    <el-card class="friends">
        <div class="friends-aside">
            <div class="friends-search">
                <el-input
                    placeholder="搜索好友"
                    prefix-icon="el-icon-search"
                    class="search_input"
                    clearable
                    />
                <el-button class="search-button" type="primary" icon="el-icon-plus" plain @click="adds"/>
                <el-badge :value="requests.length" :hidden="requests.length === 0">
                <el-button class="requests" type="primary" icon="el-icon-more" plain @click="openRequest"/>
                </el-badge>
            </div>
            <el-scrollbar class="friends-scrollbar">
                <ul>
                    <li v-for="(friend, index) in friends" :key="friend.id" @click="current = index"
                            :class="checkIndex(index)?'touch':''">
                        <img :src="friend.avator">
                        <h3 class="username">{{ friend.username }} </h3>
                        <p class="signature">{{ friend.signature }}</p>
                        <el-divider/>
                    </li>
                </ul>
            </el-scrollbar>
        </div>
        <div class="friends-body" v-if="current !== -1">
            <img :src="friends[current].avator"/>
            <h1>{{ friends[current].username }}</h1>
            <p>{{ friends[current].signature }}</p>

            <el-button type="primary" class="open-message" icon="el-icon-chat-dot-round" @click="redirectToMessage" circle/>
        </div>

        <el-dialog title="添加好友" :visible.sync="dialogVisible" class="friends-add" style="text-align: left">
            <el-input clearable prefix-icon="el-icon-search" placeholder="输入用户名进行检索" v-model="searchKeyword"
                @keypress.enter.native="adds"/>
            <el-card v-for="user in userBySearch" :key="user.uuid" style="width: 200px; display:inline-block; margin: 10px 8px" >
                <img :src="user.avatar"/>
                <div style="padding: 14px">
                    <span>{{user.username}}</span>
                    <div class="bottom clearfix">
                        <p>{{user.signature}}</p>
                        <el-button :id="user.uuid"
                                style="width: 20px;height: 20px" type="primary" icon="el-icon-plus" plain @click="addUser(user)"/>
                    </div>
                </div>
            </el-card>
            <el-pagination style="text-align: center"
                    background
                    layout="prev, pager, next"
                    :total="userBySearch.length">
            </el-pagination>
        </el-dialog>
        <el-dialog title="好友请求" :visible.sync="moreVisible" >
            <el-card v-for="o in requests" :key="o.uuid" style="width: 200px; display:inline-block; margin: 10px 10px">
                <img :src="o.requestUser.avatar"/>
                <div>
                    <span>{{o.requestUser.username}}</span>
                    <el-button class="o.uuid" type="primary" plain @click="acceptRequest(o)">同意</el-button>
                    <el-button class="o.uuid" type="danger" plain @click="rejectRequest(o)">拒绝</el-button>
                </div>
            </el-card>
            <el-pagination style="text-align: center"
                           background
                           layout="prev, pager, next"
                           :total="requests.length"/>
        </el-dialog>
    </el-card>
</template>

<script>
    import {getFriends, addFriend, getRequests, accept, reject} from "../api/friends";
    import {searchUser} from "../api/user";
    import {Notification} from 'element-ui'

    export default {
        name: "Friends",
        data() {
            return {
                dialogVisible: false,
                moreVisible: false,
                friendsKey: 'friends',
                user: this.$store.getters.user,
                friends: null,
                searchKeyword: '',
                requests: [],
                // friends: [
                //     {
                //         uuid: '',
                //         avatar: '',
                //         username: '',
                //         signature: ''
                //     }
                // ],
                current: -1,
                userBySearch: [{
                    uuid:"1",
                    username: "text",
                    avatar: "favicon.ico",
                    signature: "i want a good job."
                }]
            }
        },
        methods: {
            getFriendList() {
                if (this.friends === null) {
                    this.friends = JSON.parse(sessionStorage.getItem(this.friendsKey));
                    if (this.friends === null) {
                        let uuid = this.user.UUID;
                        new Promise((resolve, reject) => {
                            getFriends(uuid).then(response => {
                                if (response.data.code === 200) {
                                    this.friends = response.data.data;
                                } else {
                                    alert(response.data.data);
                                }
                                sessionStorage.setItem(this.friendsKey, JSON.stringify(response.data.data));
                                resolve()
                            }).catch(error => {
                                reject(error);
                            })
                        })
                    }
                }
            },
            getFriendRequests() {
                new Promise((resolve,reject) => {
                    getRequests(this.user.UUID).then(response=> {
                        let data = response.data;
                        if (data.code === 200) {
                            this.requests = data.data;
                        }
                        resolve();
                    }).catch(error => {
                        reject(error);
                    })
                });
                if (this.requests === null) {
                    this.requests = []
                }
            },
            redirectToMessage() {
                let recentMessages = JSON.parse(sessionStorage.getItem("recentMessages"));
                if (recentMessages !== null) {
                    let index = recentMessages.findIndex(element => element.userID === this.friends[this.current].uuid);
                    if (index === -1) {
                        recentMessages.unshift({
                            userID: this.friends[this.current].uuid,
                            avatar: this.friends[this.current].avatar,
                            username: this.friends[this.current].username,
                            messageList: []
                        })
                    } else {
                        let recentMessage = recentMessages[index];
                        recentMessages.splice(index, 1);
                        recentMessages.unshift(recentMessage);
                    }
                }else {
                    recentMessages = [
                        {
                            userID: this.friends[this.current].uuid,
                            avatar: this.friends[this.current].avatar,
                            username: this.friends[this.current].username,
                            messageList: []
                        }
                    ]
                }
                sessionStorage.setItem("recentMessages", JSON.stringify(recentMessages));
                sessionStorage.setItem("recent_current", 0);
                // this.$store.dispatch('CHANGE_USERID', { userID: this.friends[this.current].uuid });
                this.$router.push({
                    path: '/home/recent'
                    // query: { userID: this.friends[this.current].uuid }
                })
            },
            openRequest() {
                 this.moreVisible = true;
            },
            checkIndex(index) {
                return index === this.current;
            },
            adds() {
                this.dialogVisible = true;
                new Promise((resolve, reject) => {
                    searchUser(this.searchKeyword).then((response) => {
                        let data = response.data;
                        if (data.code === 200) {
                            this.userBySearch = data.data;
                        }
                        resolve()
                    }).catch(error => {
                        reject(error);
                    })
                })
            },
            addUser(user) {
                if (user.uuid === this.user.UUID) {
                    Notification.error({
                        title: 'Notification',
                        message: '无法添加自己'
                    });
                    // this.$notify({
                    //     title: 'Notification',
                    //     message: '無法添加自己'
                    // });
                    return;
                }
                let data = {};
                data['requestID'] = this.user.UUID;
                data['acceptID'] = user.uuid;
                new Promise((resolve, reject) => {
                    addFriend(data).then((response) => {
                        let result = response.data;
                        if (result.code === 200) {
                            Notification.success({
                                title: '通知',
                                message: '添加好友请求已发送'
                            });
                            this.$el.querySelector('#'+data.uuid).disabled=true
                        }else {
                            Notification.error({
                                title: '通知',
                                message: data.data
                            })
                        }
                        resolve()
                    }).catch(error => {
                        reject(error);
                    })
                })
            },
            acceptRequest(data) {
                new Promise((resolve, reject)=>{
                    accept(data.uuid).then(response => {
                        let result = response.data;
                        if (result.code === 200) {
                            Notification.success({
                                title:'通知',
                                message: '成功'
                            });
                            //this.$el.querySelector('.'+data.uuid).disabled=true;
                            this.requests.splice(this.requests.findIndex(o => o.uuid === data.uuid), 1);
                            this.friends.push(data.requestUser);
                            sessionStorage.setItem(this.friendsKey, this.friends);
                        }else {
                            Notification.error({
                                title:'通知',
                                message:'失败'
                            })
                        }
                        resolve()
                    }).catch(error=>{
                        reject(error);
                    })
                })
            },
            rejectRequest(data) {
                new Promise((resolve)=>{
                    reject(data.uuid).then(response=>{
                        let data = response.data;
                        if(data.code === 200) {
                            Notification.success({
                                title:'通知',
                                message:'成功'
                            });
                            this.$el.querySelector('.'+data.uuid).disabled=true;
                        }else {
                            Notification.error({
                                title:'通知',
                                message:'失败'
                            })
                        }
                        resolve();
                    })
                })
            }
        },
        created() {
            this.getFriendList();
            this.getFriendRequests();
            this.default_active = "1";
        },
        mounted() {
            let time = 3000;
            setInterval(() => {
                new Promise((resolve,reject) => {
                    getRequests(this.user.UUID).then(response=> {
                        let data = response.data;
                        if (data.code === 200) {
                            this.requests = data.data;
                        }
                        resolve();
                    }).catch(error => {
                        reject(error);
                    })
                });
                if (this.requests === null || this.requests.length <= 0) {
                    this.requests = []
                }
            }, time)
        }
    }
</script>

<style scoped>
    * {
        font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
        margin: 0;
        padding: 0;
        border: 0;
    }
    .friendstr-enter-active, .friendstr-leave-active {
        transition: all 1s;
    }
    .friendstr-leave-to {
        opacity: 0;
        transform: translateY(720px);
    }
    .friendstr-enter {
        opacity: 0;
        transform: translateY(0);
    }
    .friendstr-enter-to {
        opacity: 1;
        transform: translateY(720px);
    }
    .friends {
        height: 720px;
        width: 1200px;
        background-color: #FFFFFF;
        border-radius: 12px;
    }
    /deep/ .el-card__body {
        padding: 0;
    }
    .friends-aside {
        width: 320px;
        height: 720px;
        text-align: left;
        border-right: 3px solid #2c3e50;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
    }
    .friends-search {
        padding: 10px 6px;
    }
    .search_input {
        width: 210px;
        padding-right: 4px;
    }
    .search-button {
        width: 40px;
        height: 40px;
    }
    .requests {
        width: 40px;
        height: 40px;
        margin-left: 4px;
    }
    .friends-scrollbar {
        height: 659px;
        display: flex;
    }
    /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
    }
    .friends-aside ul {
        padding: 0;
        overflow: auto;
        list-style: none;
    }
    .friends-aside li {
        height: 64px;
        padding: 0 4px;
    }
    .touch {
        background-color: aliceblue;
    }
    .friends-aside li:hover {
        background-color: aliceblue;
    }
    .friends-aside img {
        float: left;
        height: 64px;
        width: 64px;
        border-radius: 32px;
    }
    .friends-aside p,h3 {
        padding: 0 10px;
        float: left;
        height: 32px;
        display: inline;
        width: 228px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .friends-body {
        position: relative;
        width: 877px;
        height: 720px;
        top: -720px;
        left: 323px;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        /*background-color: #2c3e50;*/
    }
    .friends-body img {
        height: 128px;
        width: 128px;
        border-radius: 64px;
        margin-top: 90px;
    }
    .friends-body h2 {
        font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    }
    .friends-body p {
        font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
        font-size: x-large;
    }
    .open-message {
        height: 64px;
        width: 64px;
        position: relative;
        bottom: -320px;
        right: -320px;
    }
</style>