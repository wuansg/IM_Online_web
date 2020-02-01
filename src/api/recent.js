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