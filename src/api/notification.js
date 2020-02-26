import request from '@/utils/request'

export function getNotifications(data) {
    return request({
        url: '/notification/' + data,
        method: 'get',
    })
}