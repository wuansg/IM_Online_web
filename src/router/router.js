import Vue from 'vue'
import Router from 'vue-router'
import Login from "../components/Login";

Vue.use(Router);

export const routerMap = [
    {
        path: "/",
        component: Login
    },
    {
        path: "/login",
        component: Login
    },
    {
        path: "/register",
        component: () => import('@/components/Register.vue')
    },
    {
        path: "/home",
        meta: {
            requireAuth: true
        },
        //redirect: '/home/recent',
        component: ()=> import('@/components/Home.vue'),
        children: [{
            path: '/home/recent',
            meta: {
                requireAuth: true,
                parentPath: "0"
            },
            component: ()=> import('@/components/Recent.vue')
        },
            {
                path: '/home/friends',
                meta: {
                    requireAuth: true,
                    parentPath: "1"
                },
                component: ()=> import('@/components/Friends.vue')
            },
            {
                path: '/home/notification',
                meta: {
                    requireAuth: true,
                    parentPath: "2",
                },
                component: ()=> import('@/components/Notification.vue')
            },
            {
                path: '/home/settings',
                meta: {
                    requireAuth: true,
                    parentPath: "3"
                },
                component: ()=> import('@/components/Settings.vue')
            }]
    }
];

export default new Router({
    routes: routerMap
})