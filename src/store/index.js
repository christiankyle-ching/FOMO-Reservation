import { createStore } from "vuex";

// Firebase
import "@/firebase";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const _user = firebase.auth().currentUser;

const store = createStore({
  state: {
    user: _user,
    products: [],
    formProducts: [],
    order: {},
    latestBatch: null,

    // Firebase References
    // null: References that depend on other state
    dbProducts: firebase.firestore().collection("products"),
    dbOrder: null,
    dbLatestBatch: firebase
      .firestore()
      .collection("batch")
      .where("is_active", "==", true)
      .orderBy("created_at", "desc")
      .limit(1),
    latestBatch: null,
    unsubscribeBatch: null,
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
    DB_SET_ORDER(state, value) {
      console.log("DB_SET_ORDER");

      state.dbOrder = value;
    },
    SET_ORDER(state, value) {
      console.log("SET_ORDER");

      state.order = value;
    },
    SET_LATEST_BATCH(state, value) {
      console.log("SET_LATEST_BATCH");

      state.latestBatch = value;
    },
  },
  actions: {
    // User
    fetchUser({ commit }, user) {
      console.log("fetchUser");

      commit("SET_USER", user);
    },

    // Products
    async fetchProducts({ commit, state }) {
      console.log("fetchProducts");

      const cacheProducts = [];

      const products = await state.dbProducts.orderBy("name", "asc").get();

      products.forEach((product) => {
        const data = product.data();

        cacheProducts.push({
          id: product.id,
          ...data,
        });
      });

      commit("SET_PRODUCTS", cacheProducts);

      // FIXME: Find another way to copy this value
      const cloneProducts = JSON.parse(JSON.stringify(cacheProducts));
      commit("SET_FORM_PRODUCTS", cloneProducts);
    },

    // Product Form
    async updateProducts({ dispatch, state }) {
      const savedProducts = await state.dbProducts.get();
      const newProducts = state.formProducts.filter((p) => !p.id);

      savedProducts.forEach((product) => {
        const dbProd = state.dbProducts.doc(product.id);
        const formProd = state.formProducts.find((p) => p.id == product.id);

        // If product still in form, just update
        if (formProd !== undefined) {
          formProd.price = parseInt(formProd.price);

          // FIXME: Other solution to not get the created_at updated?
          delete formProd.created_at;
          formProd.last_updated = firebase.firestore.FieldValue.serverTimestamp();
          dbProd.update(formProd);
        } else {
          // Else delete
          dbProd.delete();
        }
      });

      // Add New Products
      newProducts.forEach((p) => {
        p.price = parseInt(p.price);
        state.dbProducts.add(p);

        console.log("Added: ", p);
      });

      // Fetch Updated Products
      dispatch("fetchProducts");
    },

    addFormProduct({ state }) {
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const newProduct = {
        name: "",
        price: "",
        created_at: timestamp,
        last_updated: timestamp,
      };
      state.formProducts.push(newProduct);
    },

    removeFormProduct({ state }, index) {
      state.formProducts.splice(index, 1);
    },

    // Order
    async fetchOrder({ commit, state, dispatch }) {
      console.log("fetchOrder");

      const order = await state.dbOrder.get();

      console.log("Order Exists? ", order.exists);
      console.log("Order ID: ", order.id);

      if (!order.exists) {
        return dispatch("resetOrder");
      }

      dispatch("updateOrderWithProducts", order.data());
    },

    async saveOrder({ commit, state, dispatch }) {
      console.log("saveOrder");

      dispatch("parseOrderToInt");

      // TODO: Don't set in database if no change is done
      await state.dbOrder.set(state.order);
      commit("SET_ORDER", state.order);
    },

    async resetOrder({ commit, state }) {
      console.log("resetOrder");

      const blankOrder = {};
      state.products.forEach((product) => (blankOrder[product.id] = 0));

      state.dbOrder.set(blankOrder);
      commit("SET_ORDER", blankOrder);
    },

    async updateOrderWithProducts({ state, commit }, fetchedOrder) {
      console.log("updateOrderWithProducts");

      const availableProductsIDs = state.products.map((p) => p.id);

      availableProductsIDs.forEach((id) => {
        const isProductInOrder = fetchedOrder[id] !== undefined;

        if (!isProductInOrder) {
          // Add the New Product to User Order
          console.log("ADD NEW");
          fetchedOrder[id] = 0;
        }
      });

      // TODO: Discuss whether to remove unavailable products? Might increase reads.

      commit("SET_ORDER", fetchedOrder);
    },

    // Reserve
    async reserve() {
      console.log("reserve");
    },

    observeBatchChanges({ state, commit }) {
      state.unsubscribeBatch = state.dbLatestBatch.onSnapshot(async (batch) => {
        if (batch.size >= 1) {
          commit("SET_LATEST_BATCH", batch.docs[0].data());
        } else {
          commit("SET_LATEST_BATCH", null);
        }
        console.log(state.latestBatch);
      });
    },

    // Helper Functions
    parseOrderToInt({ state }) {
      console.log("parseOrderToInt");

      Object.keys(state.order).forEach((key) => {
        state.order[key] = parseInt(state.order[key]);
      });
    },

    detachObservers({ state }) {
      if (state.unsubscribeBatch) state.unsubscribeBatch();
    },
  },
  modules: {},
});

// Init Values
store.dispatch("fetchProducts");

// Listen for Batch Changes for Reservation
store.dispatch("observeBatchChanges");

// User Observer
firebase.auth().onAuthStateChanged((user) => {
  console.log("AuthChanged");

  store.dispatch("fetchUser", user);

  if (user) {
    // TODO: Remove on Prod
    console.log("User UID: ", user.uid);

    store.commit(
      "DB_SET_ORDER",
      firebase
        .firestore()
        .collection("order")
        .doc(user.uid)
    );
    store.dispatch("fetchOrder");
  } else {
    store.commit("DB_SET_ORDER", null);
    store.commit("SET_ORDER", null);
  }
});

export default store;
