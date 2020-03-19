import Vue from 'vue'
import {
  Aside, Avatar,
  Badge,
  Button,
  Card, Container, DatePicker, Dialog, Divider, Footer,
  Form,
  FormItem, Header,
  Input,
  Link, Loading, Main,
  Menu,
  MenuItem, Pagination, Popover, Radio,
  RadioGroup,
  Scrollbar,
  Tooltip,
  Upload
} from 'element-ui'
import App from './App.vue'
import VueCropper from 'vue-cropper'

import router from "./router/router";
import store from "./store/store";

Vue.use(Card);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Button);
Vue.use(Input);
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(Scrollbar);
Vue.use(Tooltip);
Vue.use(Upload);
Vue.use(Link);
Vue.use(RadioGroup);
Vue.use(Radio);
Vue.use(DatePicker);
Vue.use(Divider);
Vue.use(Dialog);
Vue.use(Pagination);
Vue.use(Badge);
Vue.use(Loading);
Vue.use(VueCropper);
Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Footer);
Vue.use(Avatar);
Vue.use(Popover);

Vue.config.productionTip = false;

// 全局导航钩子
router.beforeEach((to, from, next) => {
  // 判断路由是否需要权限
  if (to.meta.requireAuth) {
    let status = store.getters.isLogin;
    if (status) {
      next();
    }
    else {
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 将跳转的路由path作为参数，登录成功后跳转到该路由
      })
    }
  }
  else {
    next();
  }
});

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
