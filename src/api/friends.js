import request from '@/utils/request'

export function getFriends(data) {
    return request({
        url: '/friends/' + data,
        method: 'get'
    })
}

export function addFriend(data) {
    return request({
        url: '/request/add',
        method: 'post',
        data: data,
        headers: {'Content-type':'application/json'}
    })
}

export function getRequests(data) {
    return request({
        url: '/request/'+data,
        method: 'get'
    })
}

export function accept(data) {
    return request({
        url: '/request/accept/'+data,
        method: 'get'
    })
}

export function reject(data) {
    return request({
        url: '/request/reject/'+data,
        method: 'get'
    })
}