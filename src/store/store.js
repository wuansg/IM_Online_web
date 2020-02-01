import Vue from 'vue'
import Vuex from 'vuex'
import { login } from "../api/login";
import { setCookies } from "../utils/auth";

Vue.use(Vuex);

const getters = {
    isLogin: state => state.isLogin,
    user: state => state.user,
    userID: state => state.userID
};

const store = new Vuex.Store({
    state: {
        isLogin: true,//sessionStorage.getItem("isLogin") !== null,
        user: JSON.parse(sessionStorage.getItem("user")),
        userID: ""
    },
    mutations: {
        changeStatus() {
            this.state.isLogin = sessionStorage.getItem("isLogin") !== null;
        },
        setUser(state, { user }) {
            this.state.user = user;
        },
        setUserID(state, { userID }) {
            state.userID = userID
        }
    },
    actions: {
        LOGIN: ({ commit }, { data }) => {
            // Cookie.set("login", isLogin);
            // commit('changeStatus');
            // eslint-disable-next-line no-console
            console.log(data);
            new Promise((resolve) => {
                login(data).then(response => {
                    const user = response.data;
                    commit('setUser', user);
                    const cookie = response.cookie;
                    setCookies(cookie);
                    resolve()
                })
            })
        },
        SAVE_USER: ({ commit }, { user }) => {
            commit('changeStatus');
            commit('setUser', { user });
        },
        CHANGE_USERID: ({ commit }, { userID }) => {
            commit('setUserID', { userID });
        }
    },
    getters
});

export default store;