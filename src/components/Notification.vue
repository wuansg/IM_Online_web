<template>
    <el-card class="notification">
        <h1 style="color: #515a6e;">通知列表</h1>
        <div v-for="o in notifications" :key="o.uuid">
            <div v-if="o.type === 0">

            </div>
            <div v-else-if="o.type === 1" style="display: flex">
                <div class="notification_header">
                    <el-avatar :size="64" :src="o.content.requestUser.avatar" class="notification_img"/>
                    <div >
                        <span class="notification_text" >{{ o.content.requestUser.username}}</span>
                    </div>
                </div>
                <div class="notification_footer" v-if="o.content.status === 0">
                    <el-button class="notification_button" type="danger" @click="rejectRequest(o)">拒绝</el-button>
                    <el-button class="notification_button" type="primary" @click="acceptRequest(o)">同意</el-button>
                </div>
                <div class="notification_footer" v-else-if="o.content.status === 1">
                    <p style="text-align: right; color: #409EFF; font-size: x-large">已同意</p>
                </div>
                <div class="notification_footer" v-else-if="o.content.status === 2">
                    <p style="text-align: right; color: red; font-size: x-large">已拒绝</p>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script>
    import {accept, reject} from "../api/friends";
    import {FRIENDS} from "../utils/constant";
    import {Notification} from 'element-ui'

    export default {
        name: "Notify",
        props: {
            'notifications': Array
        },
        data() {
            return {
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
                            this.friends.push(data.requestUser);
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
    .notification_header {
        display: flex;
        height: 64px;
        margin: 10px 20px;
        width: 800px;
        text-align: left;
        padding: 0 10px;
    }
    .notification_text {
        position: relative; top: 30%; transform: translate(0, -50%);
        font-size: x-large;
        font-weight: 500;
        color: #515a6e;
        padding: 2px 24px;
        font-family: "微软雅黑","Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
    }
    .notification_footer {
        margin: auto;
        text-align: center;
    }
    .notification_footer>button {
        margin: 0 20px;
    }
    .notification_img {
        max-height: 64px;
        max-width: 64px;
    }

</style>