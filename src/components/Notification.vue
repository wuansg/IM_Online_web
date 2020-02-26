<template>
    <el-card class="notification">
        <ul>
            <li v-for="o in notifications" :key="o.uuid">
                <div v-if="o.type === 0">

                </div>
                <div v-else-if="o.type === 1">
                    <p>好友请求</p>
                    <img :src="o.content.requestUser.avatar" class="notification_img"/>
                    <p class="notification_username">{{ o.content.requestUser.username}}</p>
                    <div v-if="o.content.status === 0">
                    <el-button class="notification_button" type="danger" @click="rejectRequest(o)">拒绝</el-button>
                    <el-button class="notification_button" type="primary" @click="acceptRequest(o)">同意</el-button>
                    </div>
                    <div v-else-if="o.content.status === 1">
                        <p style="text-align: right; color: #409EFF; margin-right: 360px; font-size: x-large">已同意</p>
                    </div>
                    <div v-else-if="o.content.status === 2">
                        <p style="text-align: right; color: red; margin-right: 360px; font-size: x-large">已拒绝</p>
                    </div>
                </div>
            </li>
        </ul>
    </el-card>
</template>

<script>
    import {accept, reject} from "../api/friends";
    import {FRIENDS} from "../utils/constant";
    import {Notification} from 'element-ui'

    export default {
        name: "Notify",
        data() {
            return {
                notifications: this.$parent.notifications,
            }
        },
        methods: {
            acceptRequest(data) {
                new Promise((resolve, reject)=>{
                    accept(data.content.uuid).then(response => {
                        let result = response.data;
                        if (result.code === 200) {
                            Notification.success({
                                title:'通知',
                                message: '成功'
                            });
                            this.$parent.friends.content.push(data.requestUser);
                            data.content.status = 1;
                            sessionStorage.setItem(FRIENDS, JSON.stringify(this.friends));
                        }else {
                            Notification.error({
                                title:'通知',
                                message:'失败'
                            })
                        }
                        resolve()
                    }).catch(error=>{
                        Notification.error({
                            title: '好友请求同意发送失败',
                            message:"网络异常: "+error
                        });
                        reject(error);
                    })
                })
            },
            rejectRequest(data) {
                new Promise((resolve)=>{
                    reject(data.content.uuid).then(response=>{
                        let data = response.data;
                        if(data.code === 200) {
                            Notification.success({
                                title:'通知',
                                message:'成功'
                            });
                            data.content.status = 2;
                        }else {
                            Notification.error({
                                title:'通知',
                                message:'失败'
                            })
                        }
                        resolve();
                    }).catch(error => {
                        Notification.error({
                            title: '好友请求拒绝发送失败',
                            message: '网络异常'+error
                        });
                    })
                })
            },
        }
    }
</script>

<style scoped>
    .notification {
        height: 720px;
        width: 1200px;
        background-color: #FFFFFF;
        border-radius: 12px;
    }
    .notification li {
        list-style: none;
    }
    .notification_img {
        max-height: 64px;
        max-width: 64px;
        float: left;
    }
    .notification_username {
        float: left;
        margin-left: 20px;
    }
    .notification_button {
        float: right;
        margin-right: 32px;
    }
</style>