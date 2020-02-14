import request from '@/utils/request'

export function searchUser(data) {
    return request({
        url: '/user/search?username='+data.keyword + '&pageNum='+data.pageNum + '&pageSize='+data.pageSize,
        method: 'get'
    })
}

export function updateAvatar(data) {
    return request({
        url: '/user/update/avatar/'+data.uuid,
        method: 'post',
        data: data.avatar,
        headers: {'Content-type':'application/json'}
    })
}