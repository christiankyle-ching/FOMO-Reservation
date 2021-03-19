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
import { UserProfile } from "@/models/UserProfile";

const _user = firebase.auth().currentUser;
const _db = firebase.firestore();

const store = createStore({
  state: {
    // APP
    isOnline: navigator.onLine,
    appTitle: process.env.VUE_APP_TITLE,
    clientName: process.env.VUE_APP_CLIENT,
    clientUrl: process.env.VUE_APP_CLIENT_LINK,
    darkModeEnabled: null,

    // #region SHARED
    products: null, // Product()[]
    status: null, // {}
    unsubscribeStatus: null, // method()
    openBatch: null, // {} - Can be used in Batch()
    unsubscribeOpenBatch: null, // method()
    latestBatch: null, // Batch()
    unsubscribeLatestBatch: null, // method()
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
    userProfile: null, // UserProfile()
    pendingOrder: null, // Order()
    unsubscribePendingOrder: null, // method()
    // Status Tracking of Customer Order
    orderAllowed: null, // bool
    orderDone: null, // bool
    reservationExists: null, // bool
    paymentReceived: null, // bool
    // Firebase Refs
    dbReservation: null, // Pending Reservation
    dbPendingOrder: null,
    dbUserProfile: null,
    // #endregion

    // #region ADMIN
    formProducts: [], // Product()[]
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
    SET_USER_PROFILE(state, value) {
      console.log("DB_SET_USER_PROFILE");
      state.userProfile = value;
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
    DB_SET_USER_PROFILE(state, value) {
      console.log("DB_SET_USER_PROFILE");
      state.dbUserProfile = value;
    },
  },
  actions: {
    // GLOBAL
    async initApp({ dispatch, commit }, user) {
      // App
      if (localStorage.darkMode == "true") dispatch("toggleDarkMode", true);

      // Set User whether logged in or not
      dispatch("setUser", user);

      if (user) {
        console.log("---LOGGED IN---");

        dispatch("fetchProducts");
        dispatch("listenLatestBatch");

        // #region Customer DB References
        commit(
          "DB_SET_RESERVATION",
          firebase
            .firestore()
            .collection("PUBLIC_RESERVATIONS")
            .doc(user.uid)
        );
        commit(
          "DB_SET_PENDING_ORDER",
          firebase
            .firestore()
            .collection("PUBLIC_ORDERS")
            .doc(user.uid)
        );
        commit(
          "DB_SET_USER_PROFILE",
          firebase
            .firestore()
            .collection("user-profiles")
            .doc(user.uid)
        );
        // #endregion

        // TODO: Conditional data fetch based on privileges
        const isAdmin = true;
        if (isAdmin) {
          dispatch("fetchBatches");
          dispatch("listenPendingOrders");

          // Listener for Reservation Count
          dispatch("listenCounters");
        }

        // Fetch / Listeners
        dispatch("fetchUserProfile");
        dispatch("listenOpenBatch");
        dispatch("listenStatus");
        dispatch("listenCustomerPendingOrder");
      } else {
        console.log("---LOGGED OUT---");

        // Reset values set above when logged in
        commit("DB_SET_PENDING_ORDER", null);
        commit("DB_SET_RESERVATION", null);

        // Detach Listeners
        dispatch("detachLatestBatch");
        dispatch("detachOpenBatch");
        dispatch("detachStatus");
        dispatch("detachCounters");
      }
    },
    toggleDarkMode({ state }, value) {
      const newValue = value ?? !state.darkModeEnabled;

      state.darkModeEnabled = newValue;
      localStorage.darkMode = newValue;

      newValue
        ? document.querySelector("html").classList.add("dark")
        : document.querySelector("html").classList.remove("dark");
    },

    // Alerts
    alert({ state }, alertObj) {
      state.alerts.unshift(new Alert(alertObj));
    },
    removeAlert({ state }, index) {
      state.alerts.splice(index, 1);
    },

    // USER
    setUser({ commit }, user) {
      console.log("setUser");

      commit("SET_USER", user);
    },

    async fetchUserProfile({ commit, state }) {
      console.log("fetchUserProfile");

      const userProfile = await state.dbUserProfile.get();
      const data = userProfile.data();
      commit(
        "SET_USER_PROFILE",
        new UserProfile({ uid: state.user.uid, ...data })
      );
    },
    async saveUserProfile({ state, commit, dispatch }, _userProfile) {
      console.log("saveUserProfile");

      try {
        await state.dbUserProfile.set(
          { ..._userProfile.firestoreDoc },
          { merge: true }
        );

        commit("SET_USER_PROFILE", _userProfile);

        dispatch("alert", {
          message: "Successfully saved your profile.",
          type: ALERT_TYPE.SUCCESS,
        });
      } catch (err) {
        console.error(err);

        dispatch("alert", {
          message: "Something went wrong in saving your profile.",
          type: ALERT_TYPE.DANGER,
        });
      }
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
    async listenLatestBatch({ state, commit }) {
      console.log("listenLatestBatch");

      state.unsubscribeLatestBatch = state.dbLatestBatch.onSnapshot(
        (latest) => {
          if (!latest.empty) {
            const data = latest.docs[0].data();

            commit(
              "SET_LATEST_BATCH",
              new Batch({
                id: latest.docs[0].id,
                ...data,
              })
            );
          }
        }
      );
    },

    detachLatestBatch({ state }) {
      if (state.unsubscribeLatestBatch) state.unsubscribeLatestBatch();
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
            cachePendingOrders.push(
              new Order({ id: order.id, ...order.data() })
            );
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

      const batchWrite = _db.batch();

      try {
        // Set open_batch in database
        const openBatchRef = _db.collection("PUBLIC_READ").doc("open_batch");
        batchWrite.set(
          openBatchRef,
          new Batch({
            name: data.name,
            order_limit: data.order_limit,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
          }).firestoreDoc
        );

        // Update Status
        const statusRef = _db.collection("PUBLIC_READ").doc("status");
        batchWrite.update(statusRef, { batch: BATCH_STATUS.OPEN });

        // Commit in DB
        batchWrite.commit();

        // Alert
        dispatch("alert", {
          message: `Successfully opened batch for "${data.name}". Waiting for reservations...`,
          type: ALERT_TYPE.SUCCESS,
        });

        // Reset Form
        data.name = "";
        data.order_limit = 50; // TODO: Get Default from DB Options (already in $store.state)
      } catch (err) {
        console.error(err);

        dispatch("alert", {
          message: `Something went wrong in opening a batch. Please try again.`,
          type: ALERT_TYPE.DANGER,
        });
      }
    },

    async closeCurrentBatch({ state, dispatch }) {
      console.log("closeCurrentBatch");

      const batchWrite = _db.batch();
      const curBatch = state.openBatch;

      try {
        const reservations = await _db
          .collection("PUBLIC_RESERVATIONS")
          .orderBy("datetime", "asc")
          .limit(curBatch.order_limit)
          .get();

        // Set Reserved Users for Pending Orders
        reservations.forEach(async (r) => {
          const orderRef = _db.collection("PUBLIC_ORDERS").doc(r.id);

          batchWrite.set(orderRef, {});
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
        batchWrite.set(
          _db.collection("batches").doc(),
          closedBatch.firestoreDoc
        );

        // Update Batch Status
        const statusRef = _db.collection("PUBLIC_READ").doc("status");
        batchWrite.update(statusRef, { batch: BATCH_STATUS.CLOSED });

        // Remove Open Batch
        batchWrite.delete(_db.collection("PUBLIC_READ").doc("open_batch"));

        // Clear Unaccepted Reservations
        (await _db.collection("PUBLIC_RESERVATIONS").get()).forEach((r) => {
          batchWrite.delete(r.ref);
          ``;
        });

        // Clear Reservation Count
        batchWrite.update(_db.collection("PUBLIC_WRITE").doc("counters"), {
          reservations: 0,
        });

        batchWrite.commit();

        // Alert
        dispatch("alert", {
          message: "Stopped accepting reservations.",
          type: ALERT_TYPE.INFO,
        });
      } catch (err) {
        console.error(err);

        // Alert
        dispatch("alert", {
          message:
            "Something went wrong in closing the batch. Please try again.",
          type: ALERT_TYPE.DANGER,
        });
      }
    },

    async finalizeBatch({ state, dispatch }) {
      console.log("finalizeBatch");

      const batchWrite = _db.batch();

      try {
        // Copy all data in PUBLIC_ORDERS to batch.orders for those who are paid (with Order.payment)
        const cacheOrders = [];
        (
          await _db
            .collection("PUBLIC_ORDERS")
            .orderBy("payment")
            .get()
        ).forEach((order) => {
          cacheOrders.push({ ...order.data() });
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
            batchWrite.update(latestBatch, {
              orders: cacheOrders,
              locked_at: firebase.firestore.FieldValue.serverTimestamp(),
            });
          }
        }

        // Batch: Clear Pending Orders
        (await _db.collection("PUBLIC_ORDERS").get()).forEach((o) =>
          batchWrite.delete(_db.collection("PUBLIC_ORDERS").doc(o.id))
        );

        // COMMIT WriteBatch
        await batchWrite.commit();

        // Change status to BATCH_STATUS.PENDING again
        dispatch("status_updateBatch", BATCH_STATUS.PENDING);

        // Alert
        dispatch("alert", {
          message: "Stopped accepting orders.",
          type: ALERT_TYPE.INFO,
        });
      } catch (err) {
        console.error(err);

        dispatch("alert", {
          message:
            "Something went wrong in finalizing the batch. Please try again.",
          type: ALERT_TYPE.DANGER,
        });
      }
    },

    async markLatestBatchAsDone({ state, dispatch }) {
      console.log("markLatestBatchAsDone");

      try {
        // Update dbLatestBatch isDone
        state.dbBatches.doc(state.latestBatch.id).update({ isDone: true });

        // Alert
        dispatch("alert", {
          message:
            "Successfully finished the last batch. Ready to open another one.",
          type: ALERT_TYPE.SUCCESS,
        });
      } catch (err) {
        console.error(err);

        dispatch("alert", {
          message:
            "Something went wrong in marking this batch as done. Please try and set it in Batch History.",
          type: ALERT_TYPE.DANGER,
        });
      }
    },

    async updateLatestBatch({ state }) {
      console.log("updateLatestBatch");

      const batchRef = (await state.dbLatestBatch.get()).docs[0].ref;

      if (!batchRef.empty) {
        const data = state.latestBatch;

        const updatedBatch = new Batch({ ...data });

        await batchRef.update(updatedBatch.firestoreDoc);
      }
    },

    async updatePendingOrder({ state }, order) {
      console.log("updatePendingOrder");

      const pendingOrder = state.dbPendingOrders.doc(order.uid);

      if (!pendingOrder.exists) {
        await pendingOrder.update(order.firestoreDoc);
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
      const userProfile = state.userProfile;

      const orderObj = new Order({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        fbLink: userProfile.fbLink,
        phoneNumber: userProfile.phoneNumber,
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
          const orderObj = new Order({ id: pendingOrder.id, ...data });

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

      state.unsubscribeOpenBatch = state.dbOpenBatch.onSnapshot(
        async (batch) => {
          if (batch.exists) {
            // FIXME: Can be a Batch() Object
            commit("SET_OPEN_BATCH", new Batch({ ...batch.data() }));

            const reservationExists = (await state.dbReservation.get()).exists;
            // Update if Reservation is allowed
            commit("SET_RESERVATION_EXISTS", reservationExists);
          } else {
            commit("SET_OPEN_BATCH", null);
            commit("SET_RESERVATION_EXISTS", null);
          }
        }
      );
    },

    detachOpenBatch({ state }) {
      console.log("Detach: open_batch");

      if (state.unsubscribeOpenBatch) state.unsubscribeOpenBatch();
    },
    // #endregion
  },
  modules: {},
});

// User Observer
firebase.auth().onAuthStateChanged((user) => {
  console.log("AuthChanged");

  console.log(user);
  // console.log(user.getIdToken().then((token) => console.log(token)));

  // Setup User
  store.dispatch("initApp", user);
});

export default store;
