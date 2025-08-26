import Vue from 'vue'
import Preview from './Preview.vue'
import i18n from './i18n'

Vue.config.productionTip = false

window.vm = new Vue({
  i18n,
  render: h => h(Preview)
}).$mount('#app')
