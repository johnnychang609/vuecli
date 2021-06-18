import Vue from 'vue'
import App from './App.vue'
import {ClientTable} from 'vue-tables-2';
import Antd from "ant-design-vue/es";
import "ant-design-vue/dist/antd.css";
import axios from 'axios'
import VueAxios from 'vue-axios'
import BootstrapVue  from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(Antd);
Vue.use(BootstrapVue)
Vue.use(ClientTable, {}, false, 'bootstrap4', 'default');
Vue.use(VueAxios, axios)

Vue.config.productionTip = false



new Vue({
  render: h => h(App),
}).$mount('#app')
