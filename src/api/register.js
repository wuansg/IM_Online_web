import request from '@/utils/request'

export function register(data) {
    return request({
        url: '/register',
        method: 'post',
        headers: {'Content-type':'application/json'},
        data: data
    })
}