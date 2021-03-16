import { createRouter, createWebHistory } from "vue-router";

import "@/firebase";
import "firebase/auth";

import { nextTick } from "vue";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Admin from "@/views/Admin.vue";
import Batch from "@/views/Batch.vue";
import BatchHistory from "@/views/BatchHistory.vue";
import Products from "@/views/Products.vue";

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
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
    meta: {
      title: "Admin",
    },
  },
  {
    path: "/products/",
    name: "Products",
    component: Products,
    meta: {
      title: "Manage Menu",
    },
  },
  {
    path: "/batch/:id",
    name: "Batch",
    props: true,
    component: Batch,
    meta: {
      title: "Batch",
    },
  },
  {
    path: "/batch-history",
    name: "BatchHistory",
    component: BatchHistory,
    meta: {
      title: "Batch History",
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
      ? `${to.meta.title} - ${process.env.VUE_APP_TITLE}`
      : process.env.VUE_APP_TITLE;
  });
});

export default router;
