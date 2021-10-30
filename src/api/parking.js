import request from '@/utils/request'

export function listAllCate() {
  return request({
    url: '/resourceCategory/listAll',
    method: 'get'
  })
}

export function fetchList(params) {
  return request({
    url:'/product/list',
    method:'get',
    params:params
  })
}

export function fetchSimpleList(params) {
  return request({
    url:'/product/simpleList',
    method:'get',
    params:params
  })
}

export function listSite(params) {
  return request({
    url: '/pkSite/list',
    method: 'get',
    params:params
  })
}



export function saveSeason(data) {
  return request({
    url:'/pkSeason/save',
    method:'post',
    data:data
  })
}



export function getSeasonBySiteUser(params) {
  return request({
    url: '/pkSeason/seasonPass',
    method: 'get',
    params:params
  })
}

