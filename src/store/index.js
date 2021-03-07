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
const _db = firebase.firestore();

const store = createStore({
  state: {
    // Shared
    products: [],
    status: {},
    unsubscribeStatus: null,
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
      order_limit: 50, // TODO: Set Default: 50
    },
    counters: null,
    unsubscribeCounters: null,
    pendingOrders: [],
    unsubscribePendingOrders: null,

    // Firebase References
    // null: References that depend on other state
    dbProducts: _db.collection("products"),
    dbBatches: _db.collection("batches"),
    dbOrder: null, // Pending Order of Customer
    dbOpenBatch: firebase
      .firestore()
      .collection("PUBLIC_READ")
      .doc("open_batch"),
    dbStatus: _db.collection("PUBLIC_READ").doc("status"),
    dbReservation: null, // Pending Reservation of Customer
    dbReservations: _db.collection("PUBLIC_RESERVATIONS"),
    dbCounters: firebase
      .firestore()
      .collection("PUBLIC_WRITE")
      .doc("counters"),
    dbPendingOrders: _db.collection("PUBLIC_ORDERS"),
    dbLatestBatch: _db
      .collection("batches")
      .orderBy("created_at", "desc")
      .limit(1),
    dbUserLinks: null,
  },
  mutations: {
    // GLOBAL
    SET_USER(state, value) {
      console.log("SET_USER");
      state.user = value;
    },
    SET_STATUS(state, value) {
      console.log("SET_STATUS");

      state.status = value;
    },

    // ADMIN
    SET_PRODUCTS(state, value) {
      console.log("SET_PRODUCTS");
      state.products = value;
    },
    SET_FORM_PRODUCTS(state, value) {
      console.log("SET_FORM_PRODUCTS");
      state.formProducts = value;
    },
    SET_OPEN_BATCH(state, value) {
      console.log("SET_OPEN_BATCH");

      state.openBatch = value;
    },
    SET_FORM_NEWBATCH(state, value) {
      console.log("SET_FORM_NEWBATCH");

      state.formNewBatch = value;
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
    SET_COUNTERS(state, value) {
      console.log("SET_PENDING_ORDERS");

      state.counters = value;
    },
    DB_SET_USER_LINKS(state, value) {
      console.log("DB_SET_USER_LINKS");
      state.dbUserLinks = value;
    },

    // CUSTOMER
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
    SET_RESERVATION_EXISTS(state, value) {
      console.log("SET_RESERVATION_EXISTS");

      state.reservationExists = value;
    },
  },
  actions: {
    // GLOBAL
    async initApp({ dispatch, commit }, user) {
      dispatch("fetchUser", user);

      if (user) {
        console.log("---LOGGED IN---");

        dispatch("fetchProducts");

        // Customer DB References
        commit(
          "DB_SET_ORDER",
          firebase
            .firestore()
            .collection("PUBLIC_ORDERS")
            .doc(user.uid)
        );
        commit(
          "DB_SET_RESERVATION",
          firebase
            .firestore()
            .collection("PUBLIC_RESERVATIONS")
            .doc(user.uid)
        );

        // TODO: Conditional data fetch based on privileges
        const isAdmin = true;
        if (isAdmin) {
          // DB References only for Admin
          commit(
            "DB_SET_USER_LINKS",
            firebase.firestore().collection("user-links")
          );

          dispatch("fetchBatches");
          dispatch("listenPendingOrders");

          // Listener for Reservation Count
          dispatch("listenCounters");
        }

        // Listeners
        dispatch("listenOpenBatch");
        dispatch("listenStatus");
      } else {
        console.log("---LOGGED OUT---");

        // Reset values set above when logged in
        commit("DB_SET_ORDER", null);
        commit("DB_SET_RESERVATION", null);
        commit("SET_ORDER", null);

        // Detach Listeners
        dispatch("detachOpenBatch");
        dispatch("detachStatus");
        dispatch("detachCounters");
      }
    },

    // USER
    fetchUser({ commit }, user) {
      console.log("fetchUser");

      commit("SET_USER", user);
    },

    async getOrderStatus({ state }) {
      // Only Allow Submitting of Order if
      // a) User exists in PUBLIC_ORDERS, and
      // b) User does not finalize order yet
      const pendingOrder = await state.dbOrder.get();
      state.orderAllowed = pendingOrder.exists && !pendingOrder.data().order;
      state.orderDone = pendingOrder.exists && pendingOrder.data().order;
    },


    // #region ADMIN
    // TODO: Move Products data to a singleton
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

      commit(
        "SET_FORM_PRODUCTS",
        cacheProducts.map((p) => p.clone())
      );

      // Set Order Form Object for Customer
      const orderProducts = {};
      // Set orderProducts based on current available items
      products.forEach((p) => (orderProducts[p.id] = 0));

      const order = new Order(
        state.user.uid,
        state.user.displayName,
        orderProducts
      );

      commit("SET_ORDER", order);
      dispatch("getOrderStatus");
    },

    // Product Form
    async updateProducts({ dispatch, state }) {
      const savedProducts = await state.dbProducts.get();
      const newProducts = state.formProducts.filter((p) => !p.id);

      savedProducts.forEach((product) => {
        const dbProd = product.ref;
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

    // Batches
    async fetchLatestBatch({ state, commit }) {
      console.log("fetchLatestBatch");
      
      const batch = await state.dbLatestBatch.get();

      if (!batch.empty) {
        const data = batch.docs[0].data();

        commit(
          "SET_LATEST_BATCH",
          new Batch(
            batch.docs[0].id,
            data.name,
            data.created_at,
            data.closed_at,
            data.locked_at,
            data.order_limit,
            data.orders,
            data.isDone
          )
        );
      }
    },

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

    // Listener: Pending Orders
    async listenPendingOrders({ state, commit }) {
      console.log("Listen: Pending Orders");

      state.unsubscribePendingOrders = state.dbPendingOrders.onSnapshot(
        (pendingOrders) => {
          const cachePendingOrders = [];
          pendingOrders.forEach((order) => {
            cachePendingOrders.push({ id: order.id, ...order.data() });
          });

          commit("SET_PENDING_ORDERS", cachePendingOrders);
        }
      );
    },

    detachPendingOrders({ state }) {
      if (state.unsubscribePendingOrders) state.unsubscribePendingOrders();
    },

    // Order Flow
    async openNewBatch({ state, dispatch }) {
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
      data.order_limit = 50;
    },

    async closeCurrentBatch({ state, dispatch }) {
      console.log("closeCurrentBatch");

      const curBatch = state.openBatch;

      // Get All Reserved Users based on Limit, earliest first
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

      // Save Batch in Batches, Awaiting Finalize to Copy Orders
      await state.dbBatches.add(closedBatch.firestoreDoc);
      dispatch("fetchLatestBatch"); // Fetch the updated latest batch

      // Update Batch Status
      dispatch("status_updateBatch", BATCH_STATUS.CLOSED);

      // Remove Open Batch
      await state.dbOpenBatch.delete();

      // Clear Unaccepted Reservations
      (await state.dbReservations.get()).forEach(
        async (r) => await state.dbReservations.doc(r.id).delete()
      );

      // Clear Reservation Count
      state.dbCounters.update({ reservations: 0 });
    },

    async finalizeBatch({ state, dispatch }) {
      console.log("finalizeBatch");

      // Copy all data in PUBLIC_ORDERS to batch.orders
      const cacheOrders = [];
      (await state.dbPendingOrders.orderBy("order").get()).forEach((order) => {
        cacheOrders.push({ ...order.data(), isDone: false });
      });

      const queryLatest = await state.dbLatestBatch.get();
      if (!queryLatest.empty) {
        const latestBatch = queryLatest.docs[0].ref;

        if (!(await latestBatch.get()).data().orders) {
          // Safety check if orders is already copied
          // Prevents erasure of orders
          latestBatch.update({ orders: cacheOrders });

          // Set locked_at date
          latestBatch.update({
            locked_at: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // Clear Pending Orders
      const batchDeletePendingOrders = _db.batch();
      (await _db.collection("PUBLIC_ORDERS").get()).forEach(async (o) =>
        batchDeletePendingOrders.delete(
          _db.collection("PUBLIC_ORDERS").doc(o.id)
        )
      );
      await batchDeletePendingOrders.commit();

      // Change status to BATCH_STATUS.PENDING again
      dispatch("status_updateBatch", BATCH_STATUS.PENDING);

      // Fetch Latest Batch again
      dispatch("fetchLatestBatch");
    },

    async markLatestBatchAsDone({ state, commit, dispatch }) {
      console.log("markLatestBatchAsDone");

      // Update dbLatestBatch isDone
      state.dbBatches.doc(state.latestBatch.id).update({ isDone: true });

      // Update the local latest batch
      // or fetch updated version (another read)
      state.latestBatch.isDone = true;
    },

    async updateLatestBatch({ state }) {
      console.log("updateLatestBatch");

      const batchRef = (await state.dbLatestBatch.get()).docs[0].ref;

      if (!batchRef.empty) {
        const data = state.latestBatch;

        const updatedBatch = new Batch(
          data.id,
          data.name,
          data.created_at,
          data.closed_at,
          data.locked_at,
          data.order_limit,
          data.orders,
          data.isDone
        );

        await batchRef.update(updatedBatch.firestoreDoc);
      }
    },

    async status_updateBatch({ state }, status) {
      await state.dbStatus.update({ batch: status });
    },

    // Counters for Reservation, etc
    async listenCounters({ state, commit }) {
      console.log("Listen: Counters");

      state.unsubscribeCounters = state.dbCounters.onSnapshot((counter) => {
        commit("SET_COUNTERS", counter.data());
      });
    },

    detachCounters({ state }) {
      console.log("Detach: Counters");

      if (state.unsubscribeCounters) state.unsubscribeCounters();
    },
    // #endregion

    // #region CUSTOMER
    // Reserve
    async reserve({ state, commit }) {
      console.log("reserve");

      const reservation = await state.dbReservation.get();

      if (!reservation.exists) {
        state.dbReservation.set({
          datetime: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Update reservationExists
        commit("SET_RESERVATION_EXISTS", true);

        // Increment Reservation Count
        state.dbCounters.update(
          "reservations",
          firebase.firestore.FieldValue.increment(1)
        );
      }
    },

    // Order
    async saveOrder({ state, dispatch }) {
      console.log("saveOrder");

      const orderDoc = {
        ...state.order.firestoreDoc,
        ...state.order.getOrderProductsDoc(state.products),
      };

      // Update DB
      state.dbOrder.set(orderDoc);

      // Reset Form
      state.order.resetOrder();

      // Update Order Status
      dispatch("getOrderStatus");
    },
    // #endregion

    // #region GLOBAL
    // Status Listener
    listenStatus({ commit, state, dispatch }) {
      console.log("Listen: Status");

      state.unsubscribeStatus = state.dbStatus.onSnapshot((status) => {
        commit("SET_STATUS", status.data());

        // Update Customer orderAllowed when status changes. Might be allowed already.
        dispatch("getOrderStatus");
      });
    },

    detachStatus({ state }) {
      console.log("Detach: status");

      if (state.unsubscribeStatus) state.unsubscribeStatus();
    },

    async listenOpenBatch({ state, commit }) {
      console.log("Listen: open_batch");

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

    detachOpenBatch({ state }) {
      console.log("Detach: open_batch");

      if (state.unsubscribeBatch) state.unsubscribeBatch();
    },
    // #endregion
  },
  modules: {},
});

// User Observer
firebase.auth().onAuthStateChanged((user) => {
  console.log("AuthChanged");

  // TODO: Remove on prod
  console.log(user);

  // Setup User
  store.dispatch("initApp", user);
});

export default store;
