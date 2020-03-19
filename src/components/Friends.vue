<template>
    <div>
        <el-card class="friends">
        <div class="friends-aside">
            <div class="friends-search">
                <el-input
                    placeholder="搜索好友"
                    prefix-icon="el-icon-search"
                    class="search_input"
                    v-model="keyword"
                    clearable
                    />
                <el-button class="search-button" icon="el-icon-plus" plain @click="adds"
                    style="background-color: #f1f3f4"/>
            </div>
            <el-scrollbar class="friends-scrollbar" v-loading="loading">
                <div v-for="(friend, index) in friends" :key="friend.uuid" @click="current = index"
                        :class="[checkIndex(index)?'touch':'', 'friends-item']">
                    <el-avatar :size="42" :src="friend.avatar"/>
                    <div>
                        <span class="username">{{ friend.username }}</span>
                    </div>
                </div>
            </el-scrollbar>
        </div>
        <div class="friends-body" v-if="current !== -1">
            <div style="margin: 0 200px; border-bottom: 1px solid lightgray;">
                <el-avatar :size="128" :src="friends[current].avatar" style="margin-top: 20px;"/>
                <h1 style="padding: 10px">{{ friends[current].username }}</h1>
                <p>{{ friends[current].signature }}</p>
            </div>
            <div class="friends-other">
                <span>邮箱</span> <p> {{ friends[current].email }}</p> <br/>
                <span>性别</span> <i class="el-icon-female" v-if="friends[current].sex === 0"/><i class="el-icon-male" v-else/><br/>
                <span>生日</span>
                <p v-if="friends[current].birthday"> {{ friends[current].birthday }}</p>
                <p v-else>----:--:--</p>
            </div>
            <div class="friends-bt">
                <el-button type="primary" icon="el-icon-message-solid" @click.native="redirectToMessage"><span> 发信息</span></el-button>
            </div>
        </div>

    </el-card>
        <el-dialog title="添加好友" :visible.sync="dialogVisible" class="friends-add" style="text-align: left">
            <el-input clearable prefix-icon="el-icon-search" placeholder="输入用户名进行检索" v-model="searchKeyword"
                      @keypress.enter.native="adds"/>
            <div v-loading="searchLoading">
                <el-card v-for="user in userBySearch.content" :key="user.uuid" style="width: 200px; display:inline-block; margin: 10px 8px">
                    <img :src="user.avatar" style="width: 200px; height: 200px"/>
                    <div style="padding: 14px">
                        <span>{{user.username}}</span>
                        <div class="bottom clearfix">
                            <p>{{user.signature}}</p>
                            <el-button :id="user.uuid"
                                       style="width: 20px;height: 20px" type="primary" icon="el-icon-plus" plain @click="addUser(user)"/>
                        </div>
                    </div>
                </el-card>
                <el-pagination style="text-align: center" :page-size="8"
                               background
                               layout="total, prev, pager, next"
                               :total="userBySearch.totalElements" @current-change="currentChange">
                </el-pagination>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {addFriend, getRequests} from "../api/friends";
    import {searchUser} from "../api/user";
    import {Notification} from 'element-ui'
    import {RECENT_CURRENT, MESSAGES, UPDATE_COMPONENT,} from "../utils/constant";

    export default {
        name: "Friends",
        props: {
            'friends': Array,
            'messages': Array,
        },
        data() {
            return {
                pageNum: 0,
                loading: false,
                keyword: '',
                dialogVisible: false,
                moreVisible: false,
                user: this.$store.getters.user,
                searchKeyword: '',
                searchLoading: false,
                requests: this.$parent.requests,
                current: -1,
                userBySearch: []
            }
        },
        methods: {
            redirectToMessage() {
                let recentMessages = this.messages;
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
                sessionStorage.setItem(MESSAGES, JSON.stringify(recentMessages));
                sessionStorage.setItem(RECENT_CURRENT, 0);
                this.$emit(UPDATE_COMPONENT, 0);
            },
            openRequest() {
                this.moreVisible = true;
            },
            checkIndex(index) {
                return index === this.current;
            },
            adds() {
                this.dialogVisible = true;
                let data = {};
                data['pageNum'] = 0;
                data['pageSize'] = 8;
                data['keyword'] = this.searchKeyword;
                new Promise((resolve, reject) => {
                    searchUser(data).then((response) => {
                        let data = response.data;
                        if (data.code === 200) {
                            this.userBySearch = data.data;
                        }
                        else {
                            Notification.error(data.data);
                        }
                        resolve()
                    }).catch(error => {
                        Notification.error({
                            title: '获取用户列表出错',
                            message: '网络异常: '+error
                        });
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
                    return;
                }
                let data = {};
                data['requestID'] = this.user.UUID;
                data['acceptID'] = user.uuid;
                data['createTime'] = new Date().getUTCMilliseconds();
                data['modifyTime'] = data['createTime'];
                data['status'] = 0;
                new Promise((resolve, reject) => {
                    addFriend(data).then((response) => {
                        let result = response.data;
                        if (result.code === 200) {
                            Notification.success({
                                title: '通知',
                                message: '添加好友请求已发送'
                            });
                        }else {
                            Notification.error({
                                title: '通知',
                                message: data.data
                            })
                        }
                        resolve()
                    }).catch(error => {
                        Notification.error({
                            title: '添加好友请求发送出错',
                            message: '网络异常: '+error
                        });
                        reject(error);
                    })
                })
            },
            currentChange(currentPage) {
                let data = {};
                data['pageSize'] = 8;
                data['pageNum'] = currentPage;
                data['keyword'] = this.searchKeyword;
                new Promise((resolve, reject) => {
                    searchUser(data).then(response =>{
                        let result = response.data;
                        if (result.code === 200) {
                            this.userBySearch = result.data;
                        }else {
                            Notification.error(result.data);
                        }
                        resolve()
                    }).catch(error =>{
                        Notification.error(error);
                        reject(error);
                    })
                })
            },
            currentChangeOfRequest(currentPage) {
                let data = {};
                data['uuid'] = this.user.UUID;
                data['pageSize'] = 8;
                data['pageNum'] = currentPage;
                new Promise((resolve, reject) => {
                    getRequests(data).then(response =>{
                        let result = response.data;
                        if (result.code === 200) {
                            this.requests = result.data;
                        }else {
                            Notification.error(result.data);
                        }
                        resolve()
                    }).catch(error =>{
                        Notification.error(error);
                        reject(error);
                    })
                })
            }
        },
        created() {
            // eslint-disable-next-line no-console
            this.default_active = "1";
        },
        watch: {
            keyword: function (newValue) {
                this.loading = true;
                let data = {};
                data['keyword'] = newValue;
                data['pageNum'] = 0;
                data['pageSize'] = 20;
                new Promise((resolve, reject) => {
                    searchUser(data).then((response) => {
                        let result = response.data;
                        if (result.code === 200) {
                            this.userBySearch = result.data === null ? [] : result.data;
                        }
                        else {
                            Notification.error(result.data);
                        }
                        this.loading = false;
                        resolve()
                    }).catch(error => {
                        Notification.error({
                            title: '获取用户列表出错',
                            message: '网络异常: '+error
                        });
                        this.loading = false;
                        reject(error);
                    })
                });
                this.loading = false;
            },
            searchKeyword: function (newValue) {
                this.searchLoading = true;
                let data = {};
                data['keyword'] = newValue;
                data['pageNum'] = 0;
                data['pageSize'] = 8;
                new Promise((resolve, reject) => {
                    searchUser(data).then((response) => {
                        let data = response.data;
                        if (data.code === 200) {
                            this.userBySearch = data.data;
                        }
                        else {
                            Notification.error(data.data);
                        }
                        this.searchLoading = false;
                        resolve()
                    }).catch(error => {
                        Notification.error({
                            title: '获取用户列表出错',
                            message: '网络异常: '+error
                        });
                        this.searchLoading = false;
                        reject(error);
                    })
                });
                this.searchLoading = false;
            }
        }
    }
</script>

<style scoped>
    * {
        font-family: "微软雅黑","Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
        margin: 0;
        padding: 0;
        border: 0;
        color: #515a6e;
    }
    .friends {
        height: 720px;
        width: 1200px;
        background-color: #FFFFFF;
        border-radius: 12px;
    }
    /deep/ .el-card__body {
        display: flex;
        padding: 0;
    }
    .friends-aside {
        width: 320px;
        height: 100%;
        text-align: left;
        background-color: #e9ebec;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
    }
    .friends-search {
        padding: 10px 6px;
    }
    /deep/ .el-input__inner {
        background-color: #f1f3f4;
    }
    .friends-item {
        display: flex;
        padding: 10px 20px;
    }
    .username {
        position: relative; top: 20%; transform: translate(0, -50%);
        font-size: large;
        font-weight: 500;
        color: #515a6e;
        padding: 2px 16px;
        font-family: "微软雅黑","Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
    }
    .search_input {
        width: 220px;
        margin: 5px 20px;
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
        width: 110%;
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
        background-color: #dededf;
    }
    .friends-item:hover {
        background-color: #dededf;
    }
    .friends-aside img {
        float: left;
        height: 64px;
        width: 64px;
        border-radius: 32px;
    }
    .friends-aside p,h3 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .friends-body {
        flex:1;
        padding: 80px 0;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        /*background-color: #2c3e50;*/
    }
    .friends-body p {
        font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
        font-size: large;
    }
    .friends-other {
        margin: 40px 200px;
        padding: 0 60px;
        text-align: left;
        font-size: 20px;
    }
    .friends-other span {
        color: darkgrey;
        line-height: 40px;
        margin: 0 20px;
    }
    .friends-other p {
        display: inline-block;
    }
    .friends-bt {
        margin: 40px 200px;
        padding: 40px 0;
        border-top: 1px solid lightgray;
    }
    .friends-bt button {
        padding: 10px 20px;
        background-color: #dededf;
    }
    .friends-bt button:hover {
        background-color: #d4d4d4;
    }
    .open-message {
        height: 64px;
        width: 64px;
        position: relative;
        bottom: -320px;
        right: -320px;
    }
</style>