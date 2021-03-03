import { createStore } from "vuex";

// Firebase
import "@/firebase";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Batch, BATCH_STATUS } from "@/models/Batch";

const _user = firebase.auth().currentUser;

const store = createStore({
  state: {
    // Shared
    products: [],
    status: {},
    openBatch: null,
    unsubscribeBatch: null,

    // Customer
    user: _user,
    order: null,
    orderAllowed: null,
    orderDone: null,
    reservationExists: null,

    // Admin
    formProducts: [],
    latestBatch: null,
    batches: [],
    formNewBatch: {
      name: "",
      order_limit: 1,
    },
    pendingOrders: [],
    unsubscribe_PendingOrders: null,

    // Firebase References
    // null: References that depend on other state
    dbProducts: firebase.firestore().collection("products"),
    dbBatches: firebase.firestore().collection("batches"),
    dbOrder: null,
    dbOpenBatch: firebase
      .firestore()
      .collection("PUBLIC_READ")
      .doc("open_batch"),
    dbStatus: firebase
      .firestore()
      .collection("PUBLIC_READ")
      .doc("status"),
    dbReservation: null,
    dbReservations: firebase.firestore().collection("PUBLIC_RESERVATIONS"),
    dbPendingOrders: firebase.firestore().collection("PUBLIC_ORDERS"),
    dbLatestBatch: firebase
      .firestore()
      .collection("batches")
      .orderBy("closed_at", "desc")
      .limit(1),
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
    DB_SET_RESERVATION(state, value) {
      console.log("DB_SET_RESERVATION");

      state.dbReservation = value;
    },
    DB_SET_RESERVATIONS(state, value) {
      console.log("DB_SET_RESERVATIONS");

      state.dbReservation = value;
    },

    SET_OPEN_BATCH(state, value) {
      console.log("SET_OPEN_BATCH");

      state.openBatch = value;
    },
    SET_BATCHES(state, value) {
      console.log("SET_BATCHES");

      state.batches = value;
    },
    SET_LATEST_BATCH(state, value) {
      console.log("SET_LATEST_BATCH");

      state.latestBatch = value;
    },
    SET_PENDING_ORDERS(state, value) {
      console.log("SET_PENDING_ORDERS");

      state.pendingOrders = value;
    },
    SET_RESERVATION_EXISTS(state, value) {
      console.log("SET_RESERVATION_EXISTS");

      state.reservationExists = value;
    },
    SET_FORM_NEWBATCH(state, value) {
      console.log("SET_FORM_NEWBATCH");

      state.formNewBatch = value;
    },
    SET_STATUS(state, value) {
      console.log("SET_STATUS");

      state.status = value;
    },
    SET_STATUS_BATCH(state, value) {
      console.log("SET_STATUS_BATCH");

      state.status.batch = value;
    },
  },
  actions: {
    // User
    fetchUser({ commit }, user) {
      console.log("fetchUser");

      commit("SET_USER", user);
    },

    // Products
    async fetchProducts({ commit, state, dispatch }) {
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

      // Set Order Form Object for Customer
      const orderProducts = {};
      // Set orderProducts based on current available items
      state.products.forEach((product) => (orderProducts[product.id] = 0));

      const user = state.user;
      const order = new Order(
        user.uid,
        user.displayName,
        user.email,
        user.phoneNumber,
        orderProducts
      );

      commit("SET_ORDER", order);
      dispatch("getOrderStatus");
    },

    async getOrderStatus({ state, commit }, order) {
      // Only Allow Submitting of Order if
      // a) User exists in PUBLIC_ORDERS, and
      // b) User does not finalize order yet
      const pendingOrder = await state.dbOrder.get();
      state.orderAllowed = pendingOrder.exists && !pendingOrder.data().order;
      state.orderDone = pendingOrder.exists && pendingOrder.data().order;
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
    async saveOrder({ state, dispatch }) {
      console.log("saveOrder");

      const orderDoc = {
        ...state.order.firestoreDoc,
        ...state.order.getOrderProductsDoc(state.products),
      };

      state.dbOrder.set(orderDoc);
      dispatch("getOrderStatus");
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
            data.closed_at,
            data.locked_at,
            data.order_limit,
            data.orders,
            data.isDone
          )
        );
      });

      commit("SET_BATCHES", cacheBatches);
      commit("SET_LATEST_BATCH", cacheBatches[0]);
    },

    async fetchPendingOrders({ state, commit }) {
      console.log("fetchPendingOrders");

      state.unsubscribe_PendingOrders = state.dbPendingOrders.onSnapshot(
        (pendingOrders) => {
          const cachePendingOrders = [];
          pendingOrders.forEach((order) => {
            cachePendingOrders.push({ id: order.id, ...order.data() });
          });

          commit("SET_PENDING_ORDERS", cachePendingOrders);
        }
      );
    },

    async openNewBatch({ state, commit }) {
      const data = state.formNewBatch;

      // Set open_batch in database
      state.dbOpenBatch.set({
        name: data.name,
        order_limit: data.order_limit,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Update Status
      dispatch("status_updateBatch", BATCH_STATUS.OPEN);

      // Reset Form
      data.name = "";
      data.order_limit = 0;
    },

    async closeCurrentBatch({ state, dispatch }) {
      console.log("closeCurrentBatch");

      const curBatch = state.openBatch;

      // Get All Reserved Users based on Limit
      const reservations = await state.dbReservations
        .orderBy("datetime", "asc")
        .limit(curBatch.order_limit)
        .get();

      // Set Reserved Users for Pending Orders
      reservations.forEach(async (r) => {
        await state.dbPendingOrders.doc(r.id).set({});
      });

      // Save Open Batch to Batches
      const closedBatch = new Batch(
        null,
        curBatch.name,
        curBatch.created_at,
        firebase.firestore.FieldValue.serverTimestamp(),
        null,
        curBatch.order_limit,
        null,
        false
      );

      const closedBatchRef = await state.dbBatches.add(
        closedBatch.firestoreDoc
      );

      // Update Batch Status
      dispatch("status_updateBatch", BATCH_STATUS.CLOSED);

      // Remove Open Batch
      await state.dbOpenBatch.delete();

      // Clear Unaccepted Reservations
      (await state.dbReservations.get()).forEach(
        async (r) => await state.dbReservations.doc(r.id).delete()
      );
    },

    async finishBatch({ state }, id) {
      console.log("finishBatch");
    },

    async status_updateBatch({ commit, state }, status) {
      // Set Status in Database
      state.dbStatus.update({ batch: status });

      commit("SET_STATUS_BATCH", status);
    },

    // Reserve
    async reserve({ state }) {
      console.log("reserve");

      const reservation = await state.dbReservation.get();

      if (!reservation.exists) {
        state.dbReservation.set({
          datetime: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
    },

    async observeOpenBatch({ state, commit }) {
      console.log("Listen: open_batch");

      // Get Status
      const status = (await state.dbStatus.get()).data();
      commit("SET_STATUS", status);

      state.unsubscribeBatch = state.dbOpenBatch.onSnapshot(async (batch) => {
        if (batch.exists) {
          commit("SET_OPEN_BATCH", batch.data());

          const reservationExists = (await state.dbReservation.get()).exists;
          // Update if Reservation is allowed
          commit("SET_RESERVATION_EXISTS", reservationExists);
        } else {
          commit("SET_OPEN_BATCH", null);
          commit("SET_RESERVATION_EXISTS", null);
        }
      });
    },

    // Helper Functions
    detachObservers({ state }) {
      console.log("Detach: open_batch");
      if (state.unsubscribeBatch) state.unsubscribeBatch();
    },
  },
  modules: {},
});

// User Observer
firebase.auth().onAuthStateChanged((user) => {
  console.log("AuthChanged");

  store.dispatch("fetchUser", user);
  console.log(user);

  if (user) {
    store.dispatch("fetchProducts");

    // References with User Dependencies
    store.commit(
      "DB_SET_ORDER",
      firebase
        .firestore()
        .collection("PUBLIC_ORDERS")
        .doc(user.uid)
    );
    store.commit(
      "DB_SET_RESERVATION",
      firebase
        .firestore()
        .collection("PUBLIC_RESERVATIONS")
        .doc(user.uid)
    );

    // TODO: Conditional data fetch based on privileges
    const isAdmin = true;
    if (isAdmin) {
      store.dispatch("fetchBatches");
      store.dispatch("fetchPendingOrders");
    }
  } else {
    store.commit("DB_SET_ORDER", null);
    store.commit("SET_ORDER", null);
  }
});

export default store;
