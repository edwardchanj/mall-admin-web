import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon'// svg组件
import vSelect from 'vue-select'

Vue.component('v-select', vSelect)
// register globally
Vue.component('svg-icon', SvgIcon)

const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./svg', false, /\.svg$/)
requireAll(req)
