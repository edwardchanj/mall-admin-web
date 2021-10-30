import { getSeasonBySiteUser, listSite } from '@/api/parking'

const parking = {
  state: {
    pkSite: null,
    pkSiteSelected: false
  },

  mutations: {
    SET_PKSITE: (state, pkSite) => {
      state.pkSite = pkSite
    },
    SELECTED_PKSITE: (state, pkSite) => {
      state.pkSiteSelected = pkSite
    }
  },

  actions: {
    // 获取用户信息
    GetSite({ commit, state }) {
      return new Promise((resolve, reject) => {
        listSite().then(response => {
          const data = response.data
          if (data ) { // 验证返回的roles是否是一个非空数组
          console.log(data)
          commit('SET_PKSITE', data)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }

          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
  }
}

export default parking
