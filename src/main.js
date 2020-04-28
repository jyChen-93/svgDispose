import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import 'babel-polyfill'

Vue.config.productionTip = false
//引入公共css
import './assets/styles/reset.css';

new Vue({
    render: h => h(App),
    router
}).$mount('#app')