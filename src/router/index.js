import store, { getCurrentUser } from "@/store";

import { createRouter, createWebHistory } from "vue-router";

import { nextTick } from "vue";

import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Admin from "@/views/Admin.vue";
import Batch from "@/views/Batch.vue";
import BatchHistory from "@/views/BatchHistory.vue";
import Products from "@/views/Products.vue";
import AdminSettings from "@/views/AdminSettings.vue";
import UserProfile from "@/views/UserProfile.vue";
import ManageAdmins from "@/views/ManageAdmins.vue";
// Default Views
import PageNotFound from "@/views/default/PageNotFound.vue";
import { BATCH_STATUS } from "../models/Batch";

const REDIRECT_REASON = Object.freeze({
  loginRequired: "loginRequired",
  notEnoughPermissions: "notEnoughPermissions",
  loggedInAlready: "loggedInAlready",
  currentlyNotAllowed: "currentlyNotAllowed",
});

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      title: "Login",
    },
    beforeEnter: (to, from, next) => {
      // Conditional Redirect based on access
      if (!!store.state.user) {
        router.replace({
          name:
            store.state.isAdmin || store.state.isSuperAdmin ? "Admin" : "Home",
          query: { redirectReason: REDIRECT_REASON.loggedInAlready },
        });
      } else {
        next();
      }
    },
  },

  //#region SHARED REGION
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "Home",
      authRequired: true,
    },
    beforeEnter: (to, from) => {
      if (store.state.isAdmin || store.state.isSuperAdmin) {
        // Redirect and append queries
        router.replace({ name: "Admin", query: to.query });
      }
    },
  },
  {
    path: "/profile",
    name: "UserProfile",
    component: UserProfile,
    meta: {
      title: "Your Profile",
      authRequired: true,
    },
  },
  //#endregion

  //#region ADMIN VIEWS

  // superAdmin only
  {
    path: "/admins/manage",
    name: "ManageAdmins",
    component: ManageAdmins,
    meta: {
      title: "Manage Admins",
      superAdminRequired: true,
    },
  },

  // All Admins
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
    path: "/admin/settings",
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
    beforeEnter: (to, from, next) => {
      console.log(store.state.status?.batch);
      if (
        !!store.state.status &&
        store.state.status?.batch !== BATCH_STATUS.CLOSED
      ) {
        next();
      } else {
        next({
          name: "Home",
          query: { redirectReason: REDIRECT_REASON.currentlyNotAllowed },
        });
      }
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
  //#endregion

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
  const { user, isAdmin, isSuperAdmin } = await getCurrentUser();

  console.log(
    to.matched.some((route) => route.meta.authRequired),
    to.matched.some((route) => route.meta.adminRequired),
    to.matched.some((route) => route.meta.superAdminRequired)
  );

  // Auth Required
  if (to.matched.some((route) => route.meta.authRequired)) {
    if (!user)
      next({
        name: "Login",
        query: { redirectReason: REDIRECT_REASON.loginRequired },
      });
    else next();
  }

  // Admin Required
  else if (to.matched.some((route) => route.meta.adminRequired)) {
    if (!((isAdmin || isSuperAdmin) && !!user)) {
      next({
        name: "Home",
        query: { redirectReason: REDIRECT_REASON.notEnoughPermissions },
      });
    } else {
      next();
    }
  }

  // Admin Required
  else if (to.matched.some((route) => route.meta.superAdminRequired)) {
    if (!(isSuperAdmin && !!user)) {
      next({
        name: "Home",
        query: { redirectReason: REDIRECT_REASON.notEnoughPermissions },
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
    case REDIRECT_REASON.loginRequired:
      store.dispatch("alertInfo", "Please login first.");
      break;
    case REDIRECT_REASON.notEnoughPermissions:
      store.dispatch(
        "alertError",
        "You don't have enough permissions to access that."
      );
      break;
    case REDIRECT_REASON.loggedInAlready:
      store.dispatch("alertInfo", "You are already logged in.");
      break;
    case REDIRECT_REASON.currentlyNotAllowed:
      store.dispatch("alertInfo", "You can't access that right now.");
      break;
  }

  next();
});

// Helper Functions
function removeQueryParams(to) {
  if (Object.keys(to.query).length)
    return { path: to.path, query: {}, hash: to.hash };
}

export default router;
