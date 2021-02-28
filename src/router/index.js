import { createRouter, createWebHistory } from "vue-router";

import "@/firebase";
import "firebase/auth";

import { nextTick } from "vue";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";

const SITE_TITLE = "Gringo's";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "Home",
      authRequired: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      title: "Login",
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.afterEach((to, from) => {
  nextTick(() => {
    document.title = to.meta.title
      ? `${to.meta.title} - ${SITE_TITLE}`
      : SITE_TITLE;
  });
});

// router.beforeEach((to, from, next) => {
//   console.log("BeforeEach");
//   if (to.matched.some((record) => record.meta.authRequired)) {
//     console.log("Route AuthRequired");
//     if (!store.state.user) {
//       next({ name: "Login" });
//     } else {
//       next();
//     }
//   } else {
//     next();
//   }
// });

export default router;
