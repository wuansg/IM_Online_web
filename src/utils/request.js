import axios from 'axios'
import store from "../store/store";

const BASE_URL = process.env.NODE_ENV === 'development'
    ? "http://localhost:8080/api" : "/api";
// const BASE_URL = "/api";
export const WSURI = process.env.NODE_ENV === 'development'
    ? 'ws:localhost:8080/ws/' : "ws:"+ window.location.host + "/ws/";

// 创建axios实例
const service = axios.create({
    baseURL: BASE_URL, //api的base_url
    timeout: 15000,
    withCredentials: true,
});

// request拦截器
service.interceptors.request.use(config=> {
    if (store.getters.cookie) {
        // config.headers['Cookie'] = getCookie();
    }
    return config
}, error => {
    // eslint-disable-next-line no-console
    console.log(error);
    return Promise.reject(error)
});

// response拦截器


export default service