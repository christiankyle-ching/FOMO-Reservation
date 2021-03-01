import { createStore } from "vuex";

// Firebase
import "@/firebase";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { Order, OrderProduct } from "@/models/Order";
import { Product } from "@/models/Product";
import { Batch } from "@/models/Batch";

const _user = firebase.auth().currentUser;

const store = createStore({
  state: {
    // Shared
    products: [],

    // Customer
    user: _user,

    order: {},
    blankOrderItem: null,
    latestBatch: null,

    // Admin
    formProducts: [],
    batches: [],

    // Firebase References
    // null: References that depend on other state
    dbProducts: firebase.firestore().collection("products"),
    dbBatches: firebase.firestore().collection("batches"),
    dbOrder: null,
    dbLatestBatch: firebase
      .firestore()
      .collection("batches")
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
    SET_BLANKORDER(state, value) {
      console.log("SET_BLANKORDER");

      state.blankOrder = value;
    },
    SET_LATEST_BATCH(state, value) {
      console.log("SET_LATEST_BATCH");

      state.latestBatch = value;
    },
    SET_BATCHES(state, value) {
      console.log("SET_BATCHES");

      state.batches = value;
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

        cacheProducts.push(
          new Product(
            product.id,
            data.name,
            data.price,
            data.created_at,
            data.last_updated
          )
        );
      });

      commit("SET_PRODUCTS", cacheProducts);

      // FIXME: Might find another way to copy this value
      // FIXME: Might be irrelevant since I fetch products even on discard?
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
          const updatedProduct = new Product(
            null,
            formProd.name,
            formProd.price
          );

          dbProd.update(updatedProduct.firestoreDoc);
        } else {
          // Else delete
          dbProd.delete();
        }
      });

      // Add New Products
      newProducts.forEach((p) => {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();

        const newProduct = new Product(timestamp, p.name, p.price, timestamp);

        state.dbProducts.add(newProduct.firestoreDoc);
      });

      // Fetch Updated Products
      dispatch("fetchProducts");
    },

    addFormProduct({ state }) {
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const newProduct = new Product(null, "", "", timestamp, timestamp);
      state.formProducts.push(newProduct);
    },

    removeFormProduct({ state }, index) {
      state.formProducts.splice(index, 1);
    },

    // Order
    async fetchOrder({ commit, state, dispatch }) {
      console.log("fetchOrder");

      const order = await state.dbOrder.get();

      if (!order.exists) {
        return dispatch("resetOrder");
      }

      const ordersData = order.data();
      const userOrder = new Order(state.user.uid, null);
      Object.keys(ordersData).forEach((key) => {
        userOrder.addOrder(new OrderProduct(key, ordersData[key]));
      });

      dispatch("updateOrderWithProducts", userOrder);
    },

    async updateOrderWithProducts({ state, commit }, fetchedOrder) {
      console.log("updateOrderWithProducts");

      const availableProductsIDs = state.products.map((p) => p.id);

      availableProductsIDs.forEach((id) => {
        const isProductInOrder = fetchedOrder.orders[id] !== undefined;

        if (!isProductInOrder) {
          // Add the New Product to User Order
          fetchedOrder.addOrder(new OrderProduct(id, 0));
        }
      });

      // TODO: Discuss whether to remove unavailable products? Might increase reads.

      commit("SET_ORDER", fetchedOrder);
    },

    async saveOrder({ commit, state, dispatch }) {
      console.log("saveOrder");

      // TODO: Don't set in database if no change is done

      await state.dbOrder.set(state.order.firestoreDoc);
      commit("SET_ORDER", state.order);
    },

    async resetOrder({ commit, state }) {
      console.log("resetOrder");

      const orders = [];

      state.products.forEach((product) =>
        orders.push(new OrderProduct(product.id, 0))
      );

      const blankOrder = new Order(state.user.uid, orders);

      state.dbOrder.set(blankOrder.firestoreDoc);
      commit("SET_ORDER", blankOrder);
    },

    // Batches
    async fetchBatches({ state, commit }) {
      console.log("fetchBatches");

      const cacheBatches = [];

      const batches = await state.dbBatches.orderBy("created_at", "desc").get();

      batches.forEach((batch) => {
        const data = batch.data();

        cacheBatches.push(
          new Batch(
            batch.id,
            data.name,
            data.created_at,
            data.is_active,
            data.reserved_users
          )
        );
      });

      commit("SET_BATCHES", cacheBatches);

      // FIXME: Might find another way to copy this value
      // const cloneProducts = JSON.parse(JSON.stringify(cacheProducts));
      // commit("SET_FORM_PRODUCTS", cloneProducts);
    },

    async saveBatch({ state, commit }, batch) {
      console.log("Save Batch: ", batch);

      const isAdding = !batch.id;

      if (isAdding) {
        state.dbBatches.add(batch.firestoreDoc)
      } else {
        state.dbBatches.doc(batch.id).update(batch.firestoreDoc)
      }
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
      });
    },

    // Helper Functions
    detachObservers({ state }) {
      if (state.unsubscribeBatch) state.unsubscribeBatch();
    },
  },
  modules: {},
});

// Listen for Batch Changes for Reservation
store.dispatch("observeBatchChanges");

// User Observer
firebase.auth().onAuthStateChanged((user) => {
  console.log("AuthChanged");

  store.dispatch("fetchUser", user);

  if (user) {
    store.dispatch("fetchProducts");
    store.commit(
      "DB_SET_ORDER",
      firebase
        .firestore()
        .collection("order")
        .doc(user.uid)
    );
    store.dispatch("fetchOrder");

    // TODO: Conditional data fetch based on privileges
    const isAdmin = true;
    if (isAdmin) {
      store.dispatch("fetchBatches");
    }
  } else {
    store.commit("DB_SET_ORDER", null);
    store.commit("SET_ORDER", null);
  }
});

export default store;
