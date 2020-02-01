<template>
    <el-card class="notification">
        <ul>
            <li v-for="o in notification" :key="o.uuid">
                <p>{{o.message}}</p>
            </li>
        </ul>
    </el-card>
</template>

<script>
    export default {
        name: "Notification",
        data() {
            return {
                notification: []
            }
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
</style>