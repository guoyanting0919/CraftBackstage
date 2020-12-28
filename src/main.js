import Vue from "vue";
import layer from "vue-layer";

/* css reset */
import "normalize.css/normalize.css";

/* elementUI */
import ElementUI from "element-ui";
import locale from "element-ui/lib/locale/lang/zh-TW";

/* VCharts */
import VCharts from "v-charts";

/* 基本style */
import "element-ui/lib/theme-chalk/index.css";

/* custom style */
import "@/assets/custom-theme/custom2.scss";

/* sweet alert */
import VueSweetalert2 from "vue-sweetalert2";

import VueContextMenu from "vue-contextmenu";

/* Vue2Editor */
import Vue2Editor from "vue2-editor";

/* s */
import "@/styles/index.scss";

import App from "./App";
import router from "./router";
import store from "./store";
import api from "./api/ytApis";

/* icon */
import "@/icons";

/* permission control */
import "@/permission";

/* iconfont */
import "@/assets/iconfont/iconfont.css";
import "@/assets/iconfont/iconfont.js";

/* all.scss(建議放套件Css下層) */
import "../src/assets/all.scss";

Vue.use(ElementUI, { locale });
Vue.use(VueSweetalert2);
Vue.use(VueContextMenu);
Vue.use(Vue2Editor);
Vue.use(VCharts);

const alertT = Vue.prototype.$swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showCloseButton: true,
  timer: 3000,
  timerProgressBar: true,
  onOpen: (toast) => {
    toast.addEventListener("mouseenter", Vue.prototype.$swal.stopTimer);
    toast.addEventListener("mouseleave", Vue.prototype.$swal.resumeTimer);
  },
});

const alertM = Vue.prototype.$swal.mixin({
  toast: false,
  position: "center",
  showConfirmButton: true,
  showCloseButton: false,
  timer: 3000,
  timerProgressBar: true,
  onOpen: (toast) => {
    toast.addEventListener("mouseenter", Vue.prototype.$swal.stopTimer);
    toast.addEventListener("mouseleave", Vue.prototype.$swal.resumeTimer);
  },
});

let globalConsole = function(data) {
  if (process.env.NODE_ENV === "development") console.log(data);
};

Vue.config.productionTip = false;
Vue.prototype.$api = api;
Vue.prototype.$cl = globalConsole;
Vue.prototype.$alertT = alertT;
Vue.prototype.$alertM = alertM;
Vue.prototype.$layer = layer(Vue, {
  msgtime: 3,
});
new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
});
