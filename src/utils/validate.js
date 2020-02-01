
export function validateUsername(rule, value, callback) {
    if (value === '') {
        return callback(new Error('用户名不能为空，'))
    }else {
        const regex = new RegExp("[a-zA-Z0-9]{5,20}");
        if (!regex.test(value)) {
            return callback(new Error('用户名只能使用a-zA-Z0-9, 且长度为6-20'))
        }
    }
    callback()
}

// export function validateCheckPass(rule, value, callback) {
//     if (value === '') {
//         callback(new Error('请再输入密码!'));
//     } else if (value !== this.user.password) {
//         callback(new Error('两次输入的密码不一致'));
//     } else {
//         callback();
//     }
// }

export function validateSex(rule, value, callback) {
    if (value === '') {
        callback(new Error('请输入性别'));
    }
    callback()
}

export function validateEmail(rule, value, callback) {
    if (value === '') {
        callback(new Error('请输入邮箱'));
    }else {
        const regex = new RegExp('[a-zA-Z0-9]+@[a-zA-Z0-9]+.[a-zA-Z0-9]+')
        if (!regex.test(value)) {
            return callback(new Error('邮箱格式为XXX@XXX.XXX'));
        }
    }
    callback()
}