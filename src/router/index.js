import { createRouter, createWebHistory } from "vue-router";

import "@/firebase";
import "firebase/auth";

import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      authRequired: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
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
