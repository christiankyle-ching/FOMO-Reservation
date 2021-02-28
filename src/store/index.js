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
    formProducts: [],
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
    SET_FORM_PRODUCTS(state, value) {
      console.log("SET_FORM_PRODUCTS");
      state.formProducts = value;
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

      // FIXME: Find another way to copy this value
      commit("SET_FORM_PRODUCTS", JSON.parse(JSON.stringify(cacheProducts)));
    },

    // Product Form
    async updateProducts({ dispatch, state }) {
      const savedProducts = await dbProducts.get();
      const newProducts = state.formProducts.filter((p) => !p.id);

      savedProducts.forEach((product) => {
        const dbProd = dbProducts.doc(product.id);
        const formProd = state.formProducts.find((p) => p.id == product.id);

        // If product still in form
        if (formProd !== undefined) {
          formProd.price = parseInt(formProd.price);
          dbProd.set(formProd);
        } else {
          // Else delete
          dbProd.delete();
        }
      });

      // Add New Products
      newProducts.forEach((p) => {
        p.price = parseInt(p.price);
        dbProducts.add(p);
      });

      // Fetch Updated Products
      dispatch("fetchProducts");
    },

    // Order
    async fetchOrder({ commit, state, dispatch }) {
      console.log("fetchOrder");

      const order = await dbOrder.doc(state.user.uid).get();

      if (!order.exists) {
        return dispatch("resetOrder");
      }

      dispatch("updateOrderWithProducts", order.data());
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

    async updateOrderWithProducts({ state, commit }, fetchedOrder) {
      const availableProductsIDs = state.products.map((p) => p.id);

      availableProductsIDs.forEach((id) => {
        const isProductInOrder = fetchedOrder[id] !== undefined;

        if (!isProductInOrder) {
          // Add the New Product to User Order
          fetchedOrder[id] = 0;
        }
      });

      // TODO: Discuss whether to remove unavailable products? Might increase reads.

      commit("SET_ORDER", fetchedOrder);
    },

    // Helper Functions
    parseOrderToInt({ state }) {
      console.log("parseOrderToInt");

      Object.keys(state.order).forEach((key) => {
        state.order[key] = parseInt(state.order[key]);
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
