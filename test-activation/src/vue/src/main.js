import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import StagecastComponents from '@stagecast/activation-components'
import '@stagecast/activation-components/lib/activation-components.css'

Vue.config.productionTip = false

Vue.use(StagecastComponents, {
  i18n: (key, value = {}) => i18n.t(key, value)
})

if (window.Stagecast) {
  Vue.prototype.$SDK = new window.Stagecast()

  window.vm = new Vue({
    i18n,
    render: h => h(App)
  }).$mount('#app')
}