<template>
    <div>
        <el-card class="login-card">
            <div slot="header" class="clearfix">
                <span>IM Online</span>
            </div>
            <el-form ref="form" status-icon :rules="rules" :model="form" label-width="80px" @submit.native.prevent>
                <el-link :underline="false" type="danger">{{ error }}</el-link>
                <el-form-item label="用户名" prop="username">
                    <el-input
                            placeholder="请输入用户名"
                            clearable
                            v-model="form.username"/>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input
                            placeholder="请输入密码"
                            show-password
                            v-model="form.password"
                    @keyup.enter.native="SignIn('form')"/>
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary" @click="SignIn('form')">登录</el-button>
                </el-form-item>
                <el-link @click="Register">还没有账户？赶紧注册一个</el-link>
            </el-form>
        </el-card>
    </div>
</template>

<script>
    import {login} from "../api/login";
    import {setCookies} from "../utils/auth";
    import {validateUsername} from "../utils/validate";

    export default {
        name: "Login",
        data() {
            const validatePassword = (rule, value, callback) => {
                if (value === '') {
                    return callback(new Error('请输入密码'));
                }
                callback()
            };
            return {
                error: '',
                form: {
                    username:'',
                    password:'',
                },
                rules: {
                    username: [
                        { required: true, validator: validateUsername, trigger: 'blur'}
                    ],
                    password: [
                        { required: true, validator: validatePassword, trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            // eslint-disable-next-line no-unused-vars
            SignIn(form) {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        return new Promise((resolve, reject) => {
                            login(this.form).then(response => {
                                let data = response.data;
                                if (data.code === 200) {
                                    data.data['UUID'] = data.data['uuid'];
                                    delete data.data.uuid;
                                    setCookies(response.cookie);
                                    sessionStorage.setItem("user", JSON.stringify(data.data));
                                    sessionStorage.setItem("isLogin", true);
                                    this.$store.dispatch("SAVE_USER", {user: data.data});
                                    const redirect = decodeURIComponent(this.$route.query.redirect || '/home');
                                    this.$router.push({
                                        path: redirect
                                    });
                                    resolve()
                                }else {
                                    this.error = response.data.data;
                                }
                            }).catch(error => {
                                reject(error)
                            })
                        });
                    }else {
                        return false;
                    }
                });
                // // eslint-disable-next-line no-console
                // console.log("登录成功.");
                // let redirect = decodeURIComponent(this.$route.query.redirect || '/home');
                // this.$store.dispatch("LOGIN", true);
                // this.$router.push({
                //     // eslint-disable-next-line no-undef
                //     path: redirect
                // })
            },
            Register() {
                this.$router.push({
                    path: '/register'
                })
            }
        }
    }
</script>

<style scoped>
    .login-card {
        width: 480px;
        margin: 0 auto;
        margin-top: 60px;
    }
    /deep/ .el-form-item__content {
        margin-right: 40px;
    }
</style>