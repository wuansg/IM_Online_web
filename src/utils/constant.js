// sessionStorage保存数据所需的KEY
export const HOME_CURRENT = 'home_current';
export const RECENT_CURRENT = 'recent_current';
export const MESSAGES = 'messages';
export const FRIENDS = 'friends';
export const REQUESTS = 'requests';
export const NOTIFICATIONS = 'notifications';
export const ISLOGIN = 'isLogin';
export const USER = 'user';

// 父子组件之间的自定义事件
export const UPDATE_MENU = 'update:menu';
export const UPDATE_COMPONENT = 'update:component';

// store action KEY
export const SAVE_USER = 'SAVE_USER';

// file upload size limit
export const FILE_MAX_SIZE = 10485760
export const PIC_MAX_SIZE = 5242880;

// type 常量
export const IM_USER = 0
export const IM_MESSAGE = 1
export const IM_RELATION = 2
export const IM_REQUEST = 3
export const IM_NOTIFICATION = 4
export const IM_PIC = 5
export const IM_FILE = 6