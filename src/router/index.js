import Vue from "vue";
import Router from "vue-router";
Vue.use(Router);

import hello from '../views/hello';


const router = new Router({
  routes: [{ path: "/", component: hello }]
});

export default router;
