import request from '@/utils/request'

export function login(data) {
    return request({
        url: '/login',
        method: 'post',
        headers: {'Content-type':'application/json'},
        data: data
    })
}

export function logout(data) {
    return request({
        url: 'logout',
        method: 'post',
        data: data
    })
}