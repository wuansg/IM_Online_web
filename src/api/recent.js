import request from '@/utils/request'

export function getRecentMessage(data) {
    return request({
        url: '/recent/'+ data,
        method: 'get',
    })
}

export function getMessageOfUser(data) {
    return request({
        url: '/message/'+data.uuid,
        method: 'get',
    })
}

export function addMessage(data) {
    return request({
        url: '/message',
        method: 'post',
        headers: {'Content-type': 'application/json'},
        data: data
    })
}

export function getMessagesInterval(data) {
    return request({
        url: '/message/unread/' + data,
        method: 'get'
    })
}

export function postPic(data) {
    return request({
        url: '/message/pic',
        method: 'post',
        headers: {'Content-type': 'multipart/form-data'},
        data: data
    })
}

export function postFile(data) {
    return request({
        url: '/message/file',
        method: 'post',
        headers: {'Content-type': 'multipart/form-data'},
        data: data
    })
}

export function updateStatus(data) {
    return request({
        url: '/message/mark',
        method: 'post',
        headers: {'Content-type': 'application/json'},
        data: data
    })
}