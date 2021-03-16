import { createStore } from "vuex";

// Firebase
import "@/firebase";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Batch, BATCH_STATUS } from "@/models/Batch";
import { Alert, ALERT_TYPE } from "@/models/Alert";

const _user = firebase.auth().currentUser;
const _db = firebase.firestore();

const store = createStore({
  state: {
    // APP
    isOnline: navigator.onLine,
    appTitle: process.env.VUE_APP_TITLE,
    clientName: process.env.VUE_APP_CLIENT,
    clientUrl: process.env.VUE_APP_CLIENT_LINK,

    // #region SHARED
    products: null, // Product()[]
    status: null, // {}
    unsubscribeStatus: null, // method()
    openBatch: null, // Batch()
    unsubscribeBatch: null, // method()
    alerts: [],
    maxAllowedOrderQty: 8, // TODO: Fetch this from DB Options
    // Firebase Refs
    dbStatus: _db.collection("PUBLIC_READ").doc("status"),
    dbProducts: _db.collection("PUBLIC_READ").doc("products"),
    dbOpenBatch: firebase
      .firestore()
      .collection("PUBLIC_READ")
      .doc("open_batch"),
    dbCounters: firebase
      .firestore()
      .collection("PUBLIC_WRITE")
      .doc("counters"),
    dbLatestBatch: _db
      .collection("batches")
      .orderBy("created_at", "desc")
      .limit(1),
    // #endregion

    // #region CUSTOMER
    user: _user,
    pendingOrder: null, // Order()
    unsubscribePendingOrder: null, // method()
    // Status Tracking of Customer Order
    orderAllowed: null, // bool
    orderDone: null, // bool
    reservationExists: null, // bool
    paymentReceived: null, // bool
    // Firebase Refs
    dbUserLink: null,
    dbReservation: null, // Pending Reservation
    dbPendingOrder: null,
    // #endregion

    // #region ADMIN
    formProducts: [], // Product()[]
    latestBatch: null, // Batch()
    previousBatches: null, // Batch()[]
    formNewBatch: {
      name: "",
      order_limit: 50, // TODO: Set Default from DB Option: 50
    },
    counters: null, // {}
    unsubscribeCounters: null, // method()
    pendingOrders: [],
    unsubscribePendingOrders: null, // method()
    // Firebase Refs
    dbPendingOrders: _db.collection("PUBLIC_ORDERS"),
    dbBatches: _db.collection("batches"),
    dbBatchesCursor: null, // For Pagination
    dbUserLinks: firebase.firestore().collection("user-links"),
    dbReservations: _db.collection("PUBLIC_RESERVATIONS"),
    // #endregion
  },
  mutations: {
    // APP
    SET_ONLINE(state, value) {
      console.log("SET_ONLINE");
      state.isOnline = value;
    },

    // SHARED
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
    SET_OPEN_BATCH(state, value) {
      console.log("SET_OPEN_BATCH");
      state.openBatch = value;
    },
    SET_BATCHES(state, value) {
      console.log("SET_BATCHES");
      state.previousBatches = value;
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
      console.log("SET_COUNTERS");
      state.counters = value;
    },

    // CUSTOMER
    SET_RESERVATION_EXISTS(state, value) {
      console.log("SET_RESERVATION_EXISTS");
      state.reservationExists = value;
    },
    SET_PENDING_ORDER(state, value) {
      console.log("SET_PENDING_ORDER");
      state.pendingOrder = value;
    },
    DB_SET_RESERVATION(state, value) {
      console.log("DB_SET_RESERVATION");
      state.dbReservation = value;
    },
    DB_SET_USER_LINK(state, value) {
      console.log("DB_SET_USER_LINK");
      state.dbUserLink = value;
    },
    DB_SET_PENDING_ORDER(state, value) {
      console.log("DB_SET_PENDING_ORDER");
      state.dbPendingOrder = value;
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
          "DB_SET_RESERVATION",
          firebase
            .firestore()
            .collection("PUBLIC_RESERVATIONS")
            .doc(user.uid)
        );
        commit(
          "DB_SET_USER_LINK",
          firebase
            .firestore()
            .collection("user-links")
            .doc(user.uid)
        );
        commit(
          "DB_SET_PENDING_ORDER",
          firebase
            .firestore()
            .collection("PUBLIC_ORDERS")
            .doc(user.uid)
        );

        // TODO: Conditional data fetch based on privileges
        const isAdmin = true;
        if (isAdmin) {
          dispatch("fetchLatestBatch");
          dispatch("fetchBatches");
          dispatch("listenPendingOrders");

          // Listener for Reservation Count
          dispatch("listenCounters");
        }

        // Listeners
        dispatch("listenOpenBatch");
        dispatch("listenStatus");
        dispatch("listenCustomerPendingOrder");
      } else {
        console.log("---LOGGED OUT---");

        // Reset values set above when logged in
        commit("DB_SET_PENDING_ORDER", null);
        commit("DB_SET_RESERVATION", null);

        // Detach Listeners
        dispatch("detachOpenBatch");
        dispatch("detachStatus");
        dispatch("detachCounters");
      }
    },

    // Alerts
    alert({ state }, alertObj) {
      state.alerts.unshift(new Alert(alertObj));
    },
    removeAlert({ state }, index) {
      state.alerts.splice(index, 1);
    },

    // USER
    fetchUser({ commit }, user) {
      console.log("fetchUser");

      commit("SET_USER", user);
    },

    // #region ADMIN
    // Products
    async fetchProducts({ state, commit }) {
      console.log("fetchProducts");

      const products = (await state.dbProducts.get()).data().products;

      const cacheProducts = [];

      products.forEach((p) => {
        cacheProducts.push(new Product({ ...p }));
      });

      commit("SET_PRODUCTS", cacheProducts);
    },

    // Product Form
    async updateProducts({ state, dispatch }) {
      console.log("updateProducts");

      await state.dbProducts.set({
        products: state.products.map((p) => p.firestoreDoc),
      });

      dispatch("alert", {
        message: "Successfully updated products.",
        type: ALERT_TYPE.SUCCESS,
      });
    },

    replaceProducts({ commit, dispatch }, products) {
      commit("SET_PRODUCTS", products);

      dispatch("alert", {
        message: "Replaced all products with the template.",
        type: ALERT_TYPE.INFO,
      });
    },

    appendToProducts({ state, commit, dispatch }, products) {
      const mergedProducts = state.products.concat(products);

      commit("SET_PRODUCTS", mergedProducts);

      dispatch("alert", {
        message: "Added products in template to existing products.",
        type: ALERT_TYPE.INFO,
      });
    },

    // Batches
    async fetchLatestBatch({ state, commit }) {
      console.log("fetchLatestBatch");

      const batch = await state.dbLatestBatch.get();

      if (!batch.empty) {
        const data = batch.docs[0].data();

        commit(
          "SET_LATEST_BATCH",
          new Batch({
            id: batch.docs[0].id,
            ...data,
          })
        );
      }
    },

    async fetchBatches({ state, commit }) {
      console.log("fetchBatches");

      const batches = await state.dbBatches
        .orderBy("created_at", "desc")
        .limit(5)
        .get();

      const cacheBatches = [];
      batches.forEach((batch) => {
        const data = batch.data();
        cacheBatches.push(
          new Batch({
            id: batch.id,
            ...data,
          })
        );
      });

      const _last = batches.docs[batches.docs.length - 1];

      // Save cursor to fetch next batch
      if (_last != undefined) {
        state.dbBatchesCursor = state.dbBatches
          .orderBy("created_at", "desc")
          .startAfter(_last)
          .limit(5);
      }

      commit("SET_BATCHES", cacheBatches);
    },

    async fetchNextBatches({ state, commit }) {
      console.log("fetchNextBatches");

      return new Promise(async (resolve, _) => {
        const nextBatches = await state.dbBatchesCursor.get();

        const cacheBatches = [];
        nextBatches.forEach((batch) => {
          const data = batch.data();
          cacheBatches.push(
            new Batch({
              id: batch.id,
              ...data,
            })
          );
        });

        const _last = nextBatches.docs[nextBatches.docs.length - 1];

        // Save cursor to fetch next batch
        if (_last != undefined && state.dbBatchesCursor != null) {
          state.dbBatchesCursor = state.dbBatches
            .orderBy("created_at", "desc")
            .startAfter(_last)
            .limit(5);
        } else {
          state.dbBatchesCursor = null;
        }

        commit("SET_BATCHES", state.previousBatches.concat(cacheBatches));
        resolve();
      });
    },

    // Listener: Pending Orders
    async listenPendingOrders({ state, commit }) {
      console.log("Listen: Pending Orders");

      state.unsubscribePendingOrders = state.dbPendingOrders.onSnapshot(
        (pendingOrders) => {
          const cachePendingOrders = [];
          pendingOrders.forEach((order) => {
            cachePendingOrders.push(new Order({ ...order.data() }));
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

      // Alert
      dispatch("alert", {
        message: `Successfully opened batch for "${data.name}". Waiting for reservations...`,
        type: ALERT_TYPE.SUCCESS,
      });

      // Reset Form
      data.name = "";
      data.order_limit = 50; // TODO: Get Default from DB Options (already in $store.state)
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
      const closedBatch = new Batch({
        id: null,
        name: curBatch.name,
        created_at: curBatch.created_at,
        closed_at: firebase.firestore.FieldValue.serverTimestamp(),
        locked_at: null,
        order_limit: curBatch.order_limit,
        orders: null,
        isDone: false,
      });

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

      // Alert
      dispatch("alert", {
        message: "Stopped accepting reservations.",
        type: ALERT_TYPE.INFO,
      });
    },

    async finalizeBatch({ state, dispatch }) {
      console.log("finalizeBatch");

      // WRITEBATCH
      const batchOp = _db.batch();

      // Copy all data in PUBLIC_ORDERS to batch.orders for those who are paid (with Order.payment)
      const cacheOrders = [];
      (
        await _db
          .collection("PUBLIC_ORDERS")
          .orderBy("payment")
          .get()
      ).forEach((order) => {
        cacheOrders.push({ ...order.data(), isDone: false });
      });

      const queryLatest = await _db
        .collection("batches")
        .orderBy("created_at", "desc")
        .limit(1)
        .get();
      if (!queryLatest.empty) {
        const latestBatch = queryLatest.docs[0].ref;
        const data = (await latestBatch.get()).data();

        if (!data.orders) {
          // Safety check if orders is already copied
          // Prevents erasure of orders

          // Batch: Copy All Paid Orders
          batchOp.update(latestBatch, {
            orders: cacheOrders,
            locked_at: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // Batch: Clear Pending Orders
      (await _db.collection("PUBLIC_ORDERS").get()).forEach((o) =>
        batchOp.delete(_db.collection("PUBLIC_ORDERS").doc(o.id))
      );

      // COMMIT WriteBatch
      await batchOp.commit();

      // Change status to BATCH_STATUS.PENDING again
      dispatch("status_updateBatch", BATCH_STATUS.PENDING);

      // Fetch Latest Batch again
      dispatch("fetchLatestBatch");

      // Alert
      dispatch("alert", {
        message: "Stopped accepting orders.",
        type: ALERT_TYPE.INFO,
      });
    },

    async markLatestBatchAsDone({ state, dispatch }) {
      console.log("markLatestBatchAsDone");

      // Update dbLatestBatch isDone
      state.dbBatches.doc(state.latestBatch.id).update({ isDone: true });

      // Update the local latest batch
      // or fetch updated version (another read)
      state.latestBatch.isDone = true;

      // Alert
      dispatch("alert", {
        message:
          "Successfully finished the last batch. Ready to open another one.",
        type: ALERT_TYPE.SUCCESS,
      });
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
    async saveOrder({ state, dispatch }, orderList) {
      console.log("saveOrder");

      const user = state.user;
      const fbLink = (await state.dbUserLink.get()).data().fb;

      const orderObj = new Order({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        fbLink: fbLink,
        orderList: orderList,
      });

      // Only Allow Orders of > 100 PHP
      if (
        orderObj.totalPrice > 100 &&
        orderObj.totalQty <= state.maxAllowedOrderQty
      ) {
        // Update DB
        state.dbPendingOrder.set(orderObj.firestoreDoc);

        dispatch("alert", {
          message: "Successfully sent your order. Thank you!",
          type: ALERT_TYPE.SUCCESS,
        });
      } else {
        dispatch("alert", {
          message: `Minimum amount of order is 100 PHP. Order also cannot exceed ${state.maxAllowedOrderQty} item/s`,
          type: ALERT_TYPE.DANGER,
        });
      }
    },

    // Listener: Customer Pending Order
    async listenCustomerPendingOrder({ state, commit, dispatch }) {
      console.log("Listen: Customer's Pending Order");

      state.unsubscribePendingOrder = state.dbPendingOrder.onSnapshot(
        (pendingOrder) => {
          const data = pendingOrder.data();
          const orderObj = new Order({ ...data });

          commit("SET_PENDING_ORDER", orderObj);

          // Track Status of Ordering System based on order attributes
          state.orderAllowed =
            pendingOrder.exists &&
            orderObj.orderList == null &&
            orderObj.payment == null;

          state.orderDone =
            pendingOrder.exists &&
            orderObj.orderList != null &&
            orderObj.payment == null;

          state.paymentReceived =
            pendingOrder.exists && orderObj.payment != null;
        }
      );
    },

    detachCustomerPendingOrder({ state }) {
      if (state.unsubscribePendingOrder) state.unsubscribePendingOrder();
    },
    // #endregion

    // #region GLOBAL
    // Status Listener
    listenStatus({ commit, state, dispatch }) {
      console.log("Listen: Status");

      state.unsubscribeStatus = state.dbStatus.onSnapshot((status) => {
        commit("SET_STATUS", status.data());
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

  // Setup User
  store.dispatch("initApp", user);
});

export default store;
