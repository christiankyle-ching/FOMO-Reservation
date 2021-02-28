import { createStore, storeKey } from "vuex";

// Firebase
import "@/firebase";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const dbProducts = firebase.firestore().collection("products");
const dbOrder = firebase.firestore().collection("order");

const store = createStore({
  state: {
    user: firebase.auth().currentUser,
    products: [],
    order: {},
  },
  mutations: {
    SET_USER(state, value) {
      console.log("SET_USER");
      state.user = value;
    },
    SET_PRODUCTS(state, value) {
      console.log("SET_PRODUCTS");
      state.products = value;
    },
    SET_ORDER(state, value) {
      console.log("SET_ORDER");

      state.order = value;
    },
  },
  actions: {
    // User
    fetchUser({ commit }, user) {
      console.log("fetchUser");

      commit("SET_USER", user);
    },

    // Products
    async fetchProducts({ commit }) {
      console.log("fetchProducts");

      const cacheProducts = [];

      const products = await dbProducts.get();
      products.forEach((product) => {
        const data = product.data();

        cacheProducts.push({
          id: product.id,
          ...data,
        });
      });

      commit("SET_PRODUCTS", cacheProducts);
    },

    // Order
    async fetchOrder({ commit, state, dispatch }) {
      console.log("fetchOrder");

      const order = await dbOrder.doc(state.user.uid).get();

      if (!order.exists) {
        return dispatch("resetOrder");
      }

      commit("SET_ORDER", order.data());
    },

    async saveOrder({ commit, state, dispatch }) {
      console.log("saveOrder");

      dispatch("parseOrderToInt");

      // TODO: Don't set in database if no change is done
      await dbOrder.doc(state.user.uid).set(state.order);
      commit("SET_ORDER", state.order);
    },

    async resetOrder({ commit, state }) {
      console.log("resetOrder");

      const blankOrder = {};
      state.products.forEach((product) => (blankOrder[product.id] = 0));

      dbOrder.doc(state.user.uid).set(blankOrder);
      commit("SET_ORDER", blankOrder);
    },

    // Helper Functions
    parseOrderToInt({ commit, state }) {
      console.log("parseOrderToInt");

      Object.keys(state.order).forEach((key) => {
        state.order[key] = parseInt(state.order[key])
      });
    },
  },
  modules: {},
});

// Init Values
store.dispatch("fetchProducts");

// User Observer
firebase.auth().onAuthStateChanged((user) => {
  console.log("AuthChanged");

  store.dispatch("fetchUser", user);

  if (user) {
    // TODO: Remove on Prod
    console.log(user);
    store.dispatch("fetchOrder");
  }
});

export default store;
