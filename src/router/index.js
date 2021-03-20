import store, { getCurrentUser } from "@/store";

import { createRouter, createWebHistory } from "vue-router";

import { nextTick } from "vue";
import { ALERT_TYPE } from "@/models/Alert";

import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Admin from "@/views/Admin.vue";
import Batch from "@/views/Batch.vue";
import BatchHistory from "@/views/BatchHistory.vue";
import Products from "@/views/Products.vue";
import AdminSettings from "@/views/AdminSettings.vue";
// Default Views
import PageNotFound from "@/views/default/PageNotFound.vue";

const REDIRECT_REASON = Object.freeze({
  authRequired: "authRequired",
  adminRequired: "adminRequired",
  loggedInAlready: "loggedInAlready",
});

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      title: "Login",
    },
    beforeEnter: (to, from) => {
      if (!!store.state.user)
        router.replace({
          name: store.state.isAdmin ? "Admin" : "Home",
          query: { redirectReason: REDIRECT_REASON.loggedInAlready },
        });
    },
  },
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "Home",
      authRequired: true,
    },
    beforeEnter: (to, from) => {
      if (store.state.isAdmin) router.replace({ name: "Admin" });
    },
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
    meta: {
      title: "Admin",
      adminRequired: true,
    },
  },
  {
    path: "/admin/options",
    name: "AdminSettings",
    component: AdminSettings,
    meta: {
      title: "Admin Options",
      adminRequired: true,
    },
  },
  {
    path: "/products/",
    name: "Products",
    component: Products,
    meta: {
      title: "Manage Menu",
      adminRequired: true,
    },
  },
  {
    path: "/batch/:id",
    name: "Batch",
    props: true,
    component: Batch,
    meta: {
      title: "Batch",
      adminRequired: true,
    },
  },
  {
    path: "/batch-history",
    name: "BatchHistory",
    component: BatchHistory,
    meta: {
      title: "Batch History",
      adminRequired: true,
    },
  },

  // Default Views
  {
    path: "/:pathMatch(.*)*",
    name: "PageNotFound",
    component: PageNotFound,
    meta: {
      title: "Page Not Found",
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { left: 0, top: 0, behavior: "smooth" };
  },
});

router.afterEach((to, from) => {
  nextTick(() => {
    // HTML Title Tag
    document.title = to.meta.title
      ? `${to.meta.title} - ${process.env.VUE_APP_TITLE}`
      : process.env.VUE_APP_TITLE;
  });
});

// PERMISSIONS
router.beforeEach(async (to, from, next) => {
  const { user, isAdmin } = await getCurrentUser();

  // Auth Required
  if (to.matched.some((route) => route.meta.authRequired)) {
    if (!user)
      next({
        name: "Login",
        query: { redirectReason: REDIRECT_REASON.authRequired },
      });
    else next();
  }

  // Admin Required
  else if (to.matched.some((route) => route.meta.adminRequired)) {
    if (!(isAdmin && !!user)) {
      next({
        name: "Home",
        query: { redirectReason: REDIRECT_REASON.authRequired },
      });
    } else {
      next();
    }
  }

  // No permissions required
  else {
    next();
  }
});

// QUERY PARAMS
router.beforeResolve((to, from, next) => {
  // Show Alert Messages
  switch (to.query.redirectReason) {
    case REDIRECT_REASON.authRequired:
      store.dispatch("alert", { message: "Please login first." });
      break;
    case REDIRECT_REASON.adminRequired:
      store.dispatch("alert", {
        message: "You don't have enough permissions to access that.",
        type: ALERT_TYPE.DANGER,
      });
      break;
    case REDIRECT_REASON.loggedInAlready:
      store.dispatch("alert", {
        message: "You are already logged in.",
      });
      break;
  }

  // next(removeQueryParams(to));
  next();
});

// Helper Functions
function removeQueryParams(to) {
  if (Object.keys(to.query).length)
    return { path: to.path, query: {}, hash: to.hash };
}

export default router;
