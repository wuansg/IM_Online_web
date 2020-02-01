import request from '@/utils/request'

export function searchUser(data) {
    return request({
        url: '/user/search',
        method: 'post',
        data: data,
        headers: {'Content-type':'application/json'}
    })
}