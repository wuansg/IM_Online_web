<template>
    <el-card class="register">
        <div slot="header">
            <h2>IM Online</h2>
        </div>
        <el-form ref="user" :model="user" :rules="rules" label-width="100px" @submit.native.prevent status-icon>
            <el-form-item label="用户名" prop="username">
                <el-input placeholder="请输入用户名" clearable v-model="user.username"/>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input placeholder="请输入密码" show-password v-model="user.password"/>
            </el-form-item>
            <el-form-item label="再次输入密码" prop="checkPass">
                <el-input placeholder="请再次输入密码" show-password v-model="user.checkPass" autocomplete="off"/>
            </el-form-item>
            <el-form-item label="性别" prop="sex">
                <el-radio-group v-model="user.sex">
                    <el-radio label="男"/>
                    <el-radio label="女"/>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="生日日期">
                <el-date-picker type="date" placeholder="请选择日期" v-model="user.birthday"/>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="user.email" placeholder="请输入邮箱" clearable/>
            </el-form-item>
            <el-button type="primary" style="margin-left: 155px;" @click="submit('user')">注册</el-button>
            <el-button @click="reset()">重置</el-button>
            <div style="text-align: center" >
                <el-link @click="$router.push({path:'/'})">已有账号?</el-link>
            </div>
        </el-form>
    </el-card>
</template>

<script>
    import {validateEmail, validateSex, validateUsername} from "../utils/validate";
    import {register} from "../api/register";
    import {Notification} from 'element-ui';

    export default {
        name: "Register",
        data() {
            const validatePassword = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入密码！'))
                } else {
                    if (this.user.checkPass !== '') {
                        this.$refs.user.validateField('checkPass');
                    }
                    callback()
                }
            };
            const validateCheckPass = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请再输入密码!'));
                } else if (value !== this.user.password) {
                    callback(new Error('两次输入的密码不一致'));
                } else {
                    callback();
                }
            };
            return {
                user: {
                    username: "",
                    password: "",
                    sex: "",
                    email: "",
                    birthday: "",
                    checkPass: ""
                },
                rules: {
                    username:[
                        { validator: validateUsername, trigger: 'blur'}
                    ],
                    password: [
                        { validator: validatePassword, trigger: 'blur'}
                    ],
                    checkPass: [
                        { validator: validateCheckPass, trigger: 'blur'}
                    ],
                    sex: [
                        { validator: validateSex, trigger: 'blur' }
                    ],
                    email: [
                        { validator: validateEmail, trigger: 'blur' }
                    ]
                }
            };
        },
        methods: {
            submit(form) {
                this.$refs[form].validate((valid) => {
                    if (valid) {
                        this.user.sex = this.user.sex === '男' ? 0 : 1;
                        new Promise((resolve, reject) => {
                            register(this.user).then((response) => {
                                let data = response.data;
                                if (data.code === 200) {
                                    Notification.success({
                                        message: '注册成功',
                                        type: 'success'
                                    });
                                    this.$confirm('是否要返回登录','提示',{
                                        confirmButtonText:'确定',
                                        cancelButtonText: '取消'
                                    }).then(()=>{
                                        this.$router.push({path:'/'})
                                    });
                                }else {
                                    Notification.error({
                                        message: data.data,
                                        type: 'error'
                                    })
                                }
                                resolve()
                            }).catch(error => {
                                reject(error);
                            })
                        })
                    }else {
                        return false;
                    }
                });
            },
            reset() {
                this.$refs.user.resetFields();
            }
        }
    }
</script>

<style scoped>
    .register {
        width: 480px;
        text-align: left;
        margin: 0 auto;
    }
    h2 {
        text-align: center;
    }
</style>