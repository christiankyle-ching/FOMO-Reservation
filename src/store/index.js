import { createStore } from "vuex";

// Firebase
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Batch } from "@/models/Batch";
import { Alert, ALERT_TYPE } from "@/models/Alert";
import { AdminSettings } from "../models/AdminSettings";

const _db = firebase.firestore();
firebase.auth().languageCode = "ph";

const store = createStore({
  state: {
    // APP
    isOnline: navigator.onLine,
    appTitle: process.env.VUE_APP_TITLE,
    clientName: process.env.VUE_APP_CLIENT,
    clientUrl: process.env.VUE_APP_CLIENT_LINK,
    darkModeEnabled: null,
    confirmModal: null, // {}

    // USER
    _userKey: 0, // For forcedRerender
    user: null,
    isAdmin: false,
    isSuperAdmin: false,

    //#region SHARED
    products: null, // Product()[]
    openBatch: null, // Batch()
    unsubscribeOpenBatch: null, // method()
    alerts: [],
    // Firebase Refs
    dbProducts: _db.collection("PUBLIC_READ").doc("products"),
    dbOpenBatch: firebase
      .firestore()
      .collection("PUBLIC_READ")
      .doc("open_batch"),
    dbCounters: firebase
      .firestore()
      .collection("PUBLIC_WRITE")
      .doc("counters"),
    //#endregion

    //#region CUSTOMER
    pendingOrder: null, // Order()
    unsubscribePendingOrder: null, // method()
    reservation: null,
    pastPaidOrders: null, // Array
    // Firebase Refs
    dbReservation: null, // Pending Reservation
    dbPendingOrder: null,
    dbPaidOrders: null,
    dbPaidOrdersCursor: null,
    //#endregion

    //#region SUPERADMIN
    admins: null,
    //#endregion

    //#region ADMIN
    formProducts: [], // Product()[]
    latestBatch: null, // Batch()
    unsubscribeLatestBatch: null, // method()
    previousBatches: null, // Batch()[]
    formNewBatch: null, // { name, order_limit, maxAllowedOrderQty}
    counters: null, // {}
    unsubscribeCounters: null, // method()
    pendingOrders: [],
    unsubscribePendingOrders: null, // method()
    adminSettings: null,
    // Firebase Refs
    dbPendingOrders: _db.collection("PUBLIC_ORDERS"),
    dbBatches: _db.collection("batches"),
    dbBatchesCursor: null, // For Pagination
    dbAdminSettings: _db.collection("PRIVATE").doc("settings"),
    dbLatestBatch: _db
      .collection("batches")
      .orderBy("created_at", "desc")
      .limit(1),
    //#endregion
  },
  mutations: {
    // APP
    SET_ONLINE(state, value) {
      console.log("SET_ONLINE");
      state.isOnline = value;
    },

    // USER & SHARED
    SET_USER(state, value) {
      console.log("SET_USER");
      state.user = value;
      state._userKey++;
    },
    SET_IS_ADMIN(state, value) {
      console.log("SET_IS_ADMIN");
      state.isAdmin = value;
    },
    SET_IS_SUPER_ADMIN(state, value) {
      console.log("SET_IS_SUPER_ADMIN");
      state.isSuperAdmin = value;
    },

    // SUPERADMIN
    SET_ADMINS(state, value) {
      console.log("SET_ADMINS");
      state.admins = value;
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
    APPEND_BATCHES(state, value) {
      console.log("APPEND_BATCHES");
      state.previousBatches.concat(value);
    },
    SET_PENDING_ORDERS(state, value) {
      console.log("SET_PENDING_ORDERS");
      state.pendingOrders = value;
    },
    SET_COUNTERS(state, value) {
      console.log("SET_COUNTERS");
      state.counters = value;
    },
    SET_ADMIN_SETTINGS(state, value) {
      console.log("SET_ADMIN_SETTINGS");

      state.adminSettings = value;
    },
    SET_LATEST_BATCH(state, value) {
      console.log("SET_LATEST_BATCH");
      state.latestBatch = value;
    },

    // CUSTOMER
    SET_RESERVATION(state, value) {
      console.log("SET_RESERVATION");
      state.reservation = value;
    },
    SET_PENDING_ORDER(state, value) {
      console.log("SET_PENDING_ORDER");
      state.pendingOrder = value;
    },
    SET_PAST_PAID_ORDERS(state, value) {
      console.log("SET_PAST_PAID_ORDERS");
      state.pastPaidOrders = value;
    },
    APPEND_PAST_PAID_ORDERS(state, list) {
      console.log("APPEND_PAST_PAID_ORDERS");
      state.pastPaidOrders.concat(list);
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
    DB_SET_PREVIOUS_PAID_ORDERS(state, value) {
      console.log("DB_SET_PREVIOUS_PAID_ORDERS");
      state.dbPaidOrders = value;
    },
  },
  actions: {
    // GLOBAL
    async initApp({ dispatch, commit }, user) {
      console.log("initApp");

      // App
      if (localStorage.darkMode == "true") dispatch("toggleDarkMode", true);

      // Set User whether logged in or not
      commit("SET_USER", user);

      if (user) {
        console.log("---LOGGED IN---");

        //#region Customer DB References
        commit(
          "DB_SET_RESERVATION",
          _db.collection("PUBLIC_RESERVATIONS").doc(user.uid)
        );
        commit(
          "DB_SET_PENDING_ORDER",
          _db.collection("PUBLIC_ORDERS").doc(user.uid)
        );
        commit(
          "DB_SET_PREVIOUS_PAID_ORDERS",
          _db.collection("paid-orders").where("uid", "==", user.uid)
        );

        //#endregion

        const token = await user.getIdTokenResult();
        const isAdmin = !!token.claims.admin;
        const isSuperAdmin = !!token.claims.superAdmin;

        commit("SET_IS_ADMIN", isAdmin);
        commit("SET_IS_SUPER_ADMIN", isSuperAdmin);

        if (isAdmin || isSuperAdmin) {
          dispatch("listenLatestBatch");
          dispatch("listenPendingOrders");
          dispatch("listenCounters");
          dispatch("fetchAdminSettings");
        }

        if (isSuperAdmin) {
          dispatch("fetchAdmins");
        }

        // Fetch / Listeners
        dispatch("fetchProducts");
        dispatch("listenOpenBatch");
        dispatch("listenCustomerPendingOrder");
      } else {
        console.log("---LOGGED OUT---");

        // Detach Listeners
        dispatch("detachOpenBatch");
        dispatch("detachLatestBatch");
        dispatch("detachCounters");
        dispatch("detachPendingOrders");
        dispatch("detachCustomerPendingOrder");

        // TODO: Do I need to reset all values (i.e. products)
        // Reset values set above when logged in
        commit("DB_SET_PENDING_ORDER", null);
        commit("DB_SET_RESERVATION", null);
        commit("SET_IS_ADMIN", false);
        commit("SET_IS_SUPER_ADMIN", false);
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

    //#region Alerts
    alert({ state }, alertObj) {
      state.alerts.unshift(new Alert(alertObj));
    },
    alertSuccess({ dispatch }, _message, _isPermanent) {
      dispatch("alert", {
        message: _message,
        type: ALERT_TYPE.SUCCESS,
        isPermanent: _isPermanent,
      });
    },
    alertInfo({ dispatch }, _message, _isPermanent) {
      dispatch("alert", {
        message: _message,
        type: ALERT_TYPE.INFO,
        isPermanent: _isPermanent,
      });
    },
    alertError({ dispatch }, _message, _isPermanent) {
      dispatch("alert", {
        message: _message,
        type: ALERT_TYPE.DANGER,
        isPermanent: _isPermanent,
      });
    },

    removeAlert({ state }, index) {
      state.alerts.splice(index, 1);
    },
    //#endregion

    //#region ConfirmModal
    confirm({ state }, { title, message, buttonMessage, callback }) {
      state.confirmModal = {
        title: title ?? "",
        message: message ?? "",
        buttonMessage: buttonMessage ?? "",
        callback: callback ?? null,
        type: "",
      };
    },
    confirmDanger({ state }, { title, message, buttonMessage, callback }) {
      state.confirmModal = {
        title: title ?? "",
        message: message ?? "",
        buttonMessage: buttonMessage ?? "",
        callback: callback ?? null,
        type: "danger",
      };
    },
    closeConfirmModal({ state }) {
      state.confirmModal = null;
    },

    //#endregion

    //#region User
    async logout({ dispatch }) {
      try {
        await firebase.auth().signOut();

        dispatch("alertInfo", "You have been logged out.");
        return true;
      } catch (err) {
        throw err;
      }
    },

    async changeDisplayName({ state, dispatch }, _newName) {
      const user = state.user;

      try {
        await user.updateProfile({
          displayName: _newName,
        });

        dispatch("alertSuccess", "Successfully updated your name.");
      } catch (err) {
        console.error(err);

        dispatch("alertError", "Something went wrong in updating your name.");
      }
    },
    async resetPassword({ state, dispatch }) {
      const emailAddress = state.user.email;

      try {
        await firebase.auth().sendPasswordResetEmail(emailAddress);

        dispatch("alertSuccess", "Please check your email for the next steps.");
      } catch (err) {
        console.error(err);

        dispatch("alertError", "Something went wrong in sending you an email.");
      }
    },
    //#endregion

    //#region SUPERADMIN
    async fetchAdmins({ commit }) {
      console.log("fetchAdmins");

      const admins = await _db
        .collection("PRIVATE_SUPER_ADMIN")
        .doc("admins")
        .get();

      try {
        if (!admins.exists) {
          await admins.ref.set({ adminList: [] });

          commit("SET_ADMINS", { adminList: [] });
        } else {
          commit("SET_ADMINS", admins.data());
        }
      } catch (err) {
        console.error(err);
      }
    },

    async addAdmin({ dispatch, state }, _email) {
      const url = `${process.env.VUE_APP_BACKEND_URL}/api/admins`;

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: await state.user.getIdToken(),
          userEmail: _email,
        }),
      };

      const response = await fetch(url, options);
      const body = await response.json();

      if (!response.ok) {
        throw body;
      }

      // Add to current state
      state.admins.adminList.push({ uid: body.uid, email: body.email });

      dispatch("alertSuccess", `Added ${body.name} as an admin`);

      return body;
    },

    async removeAdmin({ dispatch, state }, _uid) {
      const url = `${process.env.VUE_APP_BACKEND_URL}/api/admins/${_uid}/remove`;

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: await state.user.getIdToken(),
        }),
      };

      const response = await fetch(url, options);
      const body = await response.json();

      if (!response.ok) {
        throw body;
      }

      // Remove from current state
      const adminToRemoveIndex = state.admins.adminList.findIndex(
        (a) => a.uid === body.uid && a.email === body.email
      );
      if (adminToRemoveIndex >= 0)
        state.admins.adminList.splice(adminToRemoveIndex, 1);

      dispatch("alertSuccess", `Removed ${body.name} as an admin`);

      return body;
    },
    //#endregion

    //#region ADMIN
    // Products
    async fetchProducts({ state, commit }) {
      console.log("fetchProducts");

      try {
        const productsDoc = await state.dbProducts.get();

        if (productsDoc.exists) {
          const data = productsDoc.data();

          const cacheProducts = [];
          data.products.forEach((p) => {
            cacheProducts.push(new Product({ ...p }));
          });

          commit("SET_PRODUCTS", cacheProducts);
        } else {
          if (state.isAdmin || state.isSuperAdmin) {
            productsDoc.ref.set({ products: [] });
          }

          commit("SET_PRODUCTS", []);
        }
      } catch (err) {
        console.error("fetchProducts: ", err);
      }
    },

    clearProducts({ commit }) {
      commit("SET_PRODUCTS", []);
    },

    // Product Form
    async updateProducts({ state, dispatch }) {
      console.log("updateProducts");

      try {
        await state.dbProducts.set({
          products: state.products.map((p) => p.firestoreDoc),
        });

        dispatch("alertSuccess", "Successfully updated products.");
      } catch (err) {
        dispatch(
          "alertError",
          "Something went wrong in updating your products. Please check if you are currently accpeting orders."
        );
      }
    },

    replaceProducts({ commit, dispatch }, products) {
      commit("SET_PRODUCTS", products);

      dispatch("alertInfo", "Replaced all products with the template.");
    },

    appendToProducts({ state, commit, dispatch }, products) {
      const mergedProducts = state.products.concat(products);

      commit("SET_PRODUCTS", mergedProducts);

      dispatch("alertInfo", "Added products in template to existing products.");
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
        },
        (error) => {
          console.error("Pending Orders: ", error);
        }
      );
    },

    detachPendingOrders({ state }) {
      if (state.unsubscribePendingOrders) state.unsubscribePendingOrders();
    },

    // Order Flow
    // TODO: Order Flow Loading Animations
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
            maxAllowedOrderQty: data.maxAllowedOrderQty,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
          }).firestoreDoc
        );

        // Commit in DB
        batchWrite.commit();

        // Alert
        dispatch(
          "alertSuccess",
          `Successfully opened batch for "${data.name}". Waiting for reservations...`
        );

        // Reset Form
        data.name = "";
        data.order_limit = state.adminSettings.order_limit;
        data.maxAllowedOrderQty = state.adminSettings.maxAllowedOrderQty;
      } catch (err) {
        console.error(err);

        dispatch(
          "alertError",
          `Something went wrong in opening a batch. Please try again.`
        );
      }
    },

    async closeCurrentBatch({ state, dispatch }) {
      console.log("closeCurrentBatch");

      const batchWrite = _db.batch();
      const currentOpenBatch = state.openBatch;

      try {
        const reservations = await _db
          .collection("PUBLIC_RESERVATIONS")
          .orderBy("datetime", "asc")
          .limit(currentOpenBatch.order_limit)
          .get();

        // Set Reserved Users for Pending Orders
        reservations.forEach(async (r) => {
          const orderRef = _db.collection("PUBLIC_ORDERS").doc(r.id);

          batchWrite.set(orderRef, {});
        });

        // Update Open Batch
        const closedBatch = new Batch({
          id: null,
          name: currentOpenBatch.name,
          created_at: currentOpenBatch.created_at,
          closed_at: firebase.firestore.FieldValue.serverTimestamp(),
          locked_at: null,
          order_limit: currentOpenBatch.order_limit,
          maxAllowedOrderQty: currentOpenBatch.maxAllowedOrderQty,
          orders: null,
          isDone: false,
        });

        batchWrite.update(
          _db.collection("PUBLIC_READ").doc("open_batch"),
          closedBatch.firestoreDoc
        );

        // Clear Unaccepted Reservations
        (await _db.collection("PUBLIC_RESERVATIONS").get()).forEach((r) => {
          batchWrite.delete(r.ref);
          ``;
        });

        // Clear Reservation Count
        batchWrite.set(_db.collection("PUBLIC_WRITE").doc("counters"), {
          reservations: 0,
        });

        batchWrite.commit();

        // Alert
        dispatch("alertInfo", "Stopped accepting reservations.");
      } catch (err) {
        console.error("closeCurrentBatch: ", err);

        // Alert
        dispatch(
          "alertError",
          "Something went wrong in closing the batch. Please try again."
        );
      }
    },

    async finalizeBatch({ state, dispatch }) {
      console.log("finalizeBatch");

      const batchWrite = _db.batch();

      try {
        const closedBatch = await _db
          .collection("PUBLIC_READ")
          .doc("open_batch")
          .get();

        if (closedBatch.exists) {
          // Cache Orders to transfer in latestBatch
          const cacheOrders = [];
          (
            await _db
              .collection("PUBLIC_ORDERS")
              .orderBy("payment")
              .get()
          ).forEach((order) => {
            cacheOrders.push({ ...order.data() });

            // Copy All paid orders from customers for reference - Order()
            const newOrderId = _db.collection("paid-orders").doc().id;
            batchWrite.set(_db.collection("paid-orders").doc(newOrderId), {
              ...order.data(),
              batchDetails: {
                name: closedBatch.data().name,
                closed_at: closedBatch.data().closed_at,
              },
            });
          });

          const newBatch = {
            ...closedBatch.data(),
            orders: cacheOrders,
            locked_at: firebase.firestore.FieldValue.serverTimestamp(),
          };

          // 1: Create a new batch in batchesCollection with the paidorders and locked_at
          const newBatchId = _db.collection("batches").doc().id;
          batchWrite.set(_db.collection("batches").doc(newBatchId), newBatch);

          // 2: Remove open_batch
          batchWrite.delete(closedBatch.ref);
        } else {
          throw "open_batch_missing";
        }

        // Batch: Clear Pending Orders
        (await _db.collection("PUBLIC_ORDERS").get()).forEach((o) =>
          batchWrite.delete(_db.collection("PUBLIC_ORDERS").doc(o.id))
        );

        // COMMIT WriteBatch
        await batchWrite.commit();

        // Alert
        dispatch("alertInfo", "Stopped accepting orders.");
      } catch (err) {
        console.error("finalizeBatch", err);

        dispatch(
          "alert",
          "Something went wrong in finalizing the batch. Please try again."
        );
      }
    },

    async markLatestBatchAsDone({ state, dispatch }) {
      console.log("markLatestBatchAsDone");

      try {
        // Update dbLatestBatch isDone
        const latestBatch = await state.dbLatestBatch.get();
        if (!latestBatch.empty) {
          latestBatch.docs[0].ref.update({ isDone: true });

          // Alert
          dispatch(
            "alertSuccess",
            "Successfully finished the last batch. Ready to open another one."
          );
        }
      } catch (err) {
        console.error(err);

        dispatch(
          "alertError",
          "Something went wrong in marking this batch as done. Please try and set it in Batch History."
        );
      }
    },

    async listenLatestBatch({ state, commit }) {
      // latestBatch: The last batch in batches that is not done yet (!isDone)
      console.log("Listen: LatestBatch");

      state.unsubscribeLatestBatch = state.dbLatestBatch.onSnapshot(
        (latestBatch) => {
          if (!latestBatch.empty) {
            const data = latestBatch.docs[0].data();

            // If latestBatch is not done, fetch
            if (!data.isDone) {
              commit("SET_LATEST_BATCH", new Batch({ ...data }));
            }
            // If latestBatch is done, set null instead
            else {
              commit("SET_LATEST_BATCH", null);
            }
          } else {
            commit("SET_LATEST_BATCH", null);
          }
        },
        (error) => {
          console.error("latestBatch: ", error);
        }
      );
    },

    detachLatestBatch({ state }) {
      console.log("Detach: latestBatch");

      if (state.unsubscribeLatestBatch) state.unsubscribeLatestBatch();
    },

    // Batch History
    async fetchBatches({ state, commit }) {
      console.log("fetchBatches");

      try {
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

        return commit("SET_BATCHES", cacheBatches);
      } catch (err) {
        console.error("fetchBatches", err);
      }
    },

    async fetchNextBatches({ state, commit }) {
      console.log("fetchNextBatches");

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
      if (_last != undefined && !!state.dbBatchesCursor) {
        state.dbBatchesCursor = state.dbBatches
          .orderBy("created_at", "desc")
          .startAfter(_last)
          .limit(5);
      } else {
        state.dbBatchesCursor = null;
      }

      return commit("APPEND_BATCHES", cacheBatches);
    },

    async updatePendingOrder({ state }, order) {
      console.log("updatePendingOrder");

      const pendingOrder = state.dbPendingOrders.doc(order.uid);

      if (!pendingOrder.exists) {
        await pendingOrder.update(order.firestoreDoc);
      }
    },

    async updateBatch({ state, dispatch }, batch) {
      console.log("updateBatch");

      try {
        await state.dbBatches
          .doc(batch.id)
          .set(batch.firestoreDoc, { merge: true });
      } catch (err) {
        console.error(err);

        dispatch("alertError", "Something went wrong in updating this batch.");
      }
    },

    // Counters for Reservation, etc
    async listenCounters({ state, commit }) {
      console.log("Listen: Counters");

      state.unsubscribeCounters = state.dbCounters.onSnapshot(
        (counter) => {
          commit("SET_COUNTERS", counter.data());
        },
        (error) => {
          console.error("PUBLIC_WRITE: ", error);
        }
      );
    },

    detachCounters({ state }) {
      console.log("Detach: Counters");

      if (state.unsubscribeCounters) state.unsubscribeCounters();
    },

    // Admin Settings
    async fetchAdminSettings({ state, commit }) {
      console.log("fetchAdminSettings");

      try {
        const settings = await state.dbAdminSettings.get();
        const defaultSettings = new AdminSettings({});

        // If does not exists, update DB with defaults
        if (!settings.exists) {
          settings.ref.set({ ...defaultSettings.firestoreDoc });

          commit("SET_ADMIN_SETTINGS", defaultSettings);
        }

        // Else, fetch from DB
        else {
          commit(
            "SET_ADMIN_SETTINGS",
            new AdminSettings({ ...settings.data() })
          );
        }

        // Update formNewBatch to reflect settings
        state.formNewBatch = {
          name: "",
          order_limit: state.adminSettings.order_limit,
          maxAllowedOrderQty: state.adminSettings.maxAllowedOrderQty,
        };
      } catch (err) {
        console.error("fetchAdminSettings", err);
      }
    },

    async saveAdminSettings({ state, commit, dispatch }, _adminSettings) {
      console.log("saveAdminSettings");

      try {
        await state.dbAdminSettings.set(_adminSettings.firestoreDoc);
        commit("SET_ADMIN_SETTINGS", _adminSettings);

        dispatch("alertSuccess", "Updated settings.");
      } catch (err) {
        console.error(err);

        dispatch("alertError", "Something went wrong in saving settings.");
      } finally {
        // Update formNewBatch to reflect settings fetched
        state.formNewBatch = {
          name: "",
          order_limit: state.adminSettings.order_limit,
          maxAllowedOrderQty: state.adminSettings.maxAllowedOrderQty,
        };
      }
    },

    //#endregion

    //#region CUSTOMER
    // Reserve
    async reserve({ state, commit, dispatch }) {
      console.log("reserve");

      try {
        const reservationDoc = await state.dbReservation.get();

        if (!reservationDoc.exists) {
          await state.dbReservation.set({
            datetime: firebase.firestore.FieldValue.serverTimestamp(),
          });

          // Increment Reservation Count
          state.dbCounters.set(
            {
              reservations: firebase.firestore.FieldValue.increment(1),
            },
            { merge: true }
          );

          // Get reservation submitted
          commit("SET_RESERVATION", (await state.dbReservation.get()).data());
        }
      } catch (err) {
        console.error("reserve", err);

        dispatch(
          "alertError",
          "Something went wrong in reserving your slot. Please reload and try again."
        );
      }
    },

    // Order
    async saveOrder({ state, dispatch }, orderList) {
      console.log("saveOrder");

      const user = state.user;

      if (!user.phoneNumber) {
        return dispatch(
          "alertError",
          "Please provide your mobile phone number."
        );
      }

      const orderObj = new Order({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        name: user.displayName,
        email: user.email,
        orderList: orderList,
      });

      // Only Allow Orders of > 100 PHP
      if (
        orderObj.totalPrice > 100 &&
        orderObj.totalQty <= state.openBatch.maxAllowedOrderQty
      ) {
        // Update DB
        state.dbPendingOrder.update(orderObj.firestoreDoc);

        dispatch("alertSuccess", "Successfully sent your order. Thank you!");
      } else {
        dispatch(
          "alertError",
          `Minimum amount of order is 100 PHP. Order also cannot exceed ${state.openBatch.maxAllowedOrderQty} item/s`
        );
      }
    },

    // Listener: Customer Pending Order
    async listenCustomerPendingOrder({ state, commit }) {
      console.log("Listen: Customer's Pending Order");

      state.unsubscribePendingOrder = state.dbPendingOrder.onSnapshot(
        (pendingOrder) => {
          if (pendingOrder.exists) {
            const data = pendingOrder.data();
            const orderObj = new Order({ ...data });

            commit("SET_PENDING_ORDER", orderObj);
          } else {
            commit("SET_PENDING_ORDER", null);
          }
        },
        (error) => {
          console.error("PUBLIC_ORDERS/uid: ", error);
        }
      );
    },

    detachCustomerPendingOrder({ state }) {
      if (state.unsubscribePendingOrder) state.unsubscribePendingOrder();
    },

    // Paid Orders History
    async fetchPastOrders({ state, commit }) {
      console.log("fetchPastOrders");

      try {
        const paidOrders = await state.dbPaidOrders.limit(5).get();

        const cacheOrders = [];
        paidOrders.forEach((order) => {
          const data = order.data();
          cacheOrders.push(
            new Order({
              ...data,
            })
          );
        });

        const _last = paidOrders.docs[paidOrders.docs.length - 1];

        // Save cursor to fetch next batch
        if (_last != undefined) {
          state.dbPaidOrdersCursor = state.dbPaidOrders
            .startAfter(_last)
            .limit(5);
        }

        return commit("SET_PAST_PAID_ORDERS", cacheOrders);
      } catch (err) {
        console.error("fetchPastOrders", err);
      }
    },

    async fetchNextPastOrders({ state, commit }) {
      console.log("fetchNextPastOrders");

      const paidOrders = await state.dbPaidOrdersCursor.get();

      const cacheOrders = [];
      paidOrders.forEach((order) => {
        const data = order.data();
        cacheOrders.push(
          new Order({
            ...data,
          })
        );
      });

      const _last = paidOrders.docs[paidOrders.docs.length - 1];

      // Save cursor to fetch next batch
      if (_last != undefined && !!state.dbPaidOrdersCursor) {
        state.dbPaidOrdersCursor = state.dbPaidOrders
          .startAfter(_last)
          .limit(5);
      } else {
        state.dbPaidOrdersCursor = null;
      }

      return commit("APPEND_PAST_PAID_ORDERS", cacheOrders);
    },
    //#endregion

    //#region GLOBAL
    async listenOpenBatch({ state, commit }) {
      console.log("Listen: open_batch");

      state.unsubscribeOpenBatch = state.dbOpenBatch.onSnapshot(
        async (batch) => {
          if (batch.exists) {
            const currentOpenBatch = new Batch({ ...batch.data() });

            commit("SET_OPEN_BATCH", currentOpenBatch);

            try {
              const reservation = (await state.dbReservation.get()).data();
              commit("SET_RESERVATION", reservation);
            } catch (err) {
              console.error("reservation", err);
            }
          } else {
            commit("SET_OPEN_BATCH", null);
            commit("SET_RESERVATION", null);
          }
        },
        (error) => {
          console.error("PUBLIC_READ/open_batch: ", error);
        }
      );
    },

    detachOpenBatch({ state }) {
      console.log("Detach: open_batch");

      if (state.unsubscribeOpenBatch) state.unsubscribeOpenBatch();
    },
    //#endregion
  },
  getters: {
    //#region CUSTOMER
    // Status Tracking of Customer Order
    "customer/allowReservation": (state) => {
      return (
        !!state.openBatch && !state.openBatch.closed_at && !state.reservation
      );
    },
    "customer/orderAllowed": (state) => {
      // Has reservation, no order yet
      return (
        !!state.openBatch &&
        !!state.pendingOrder &&
        !state.pendingOrder.orderList &&
        !state.pendingOrder.payment
      );
    },
    "customer/orderDone": (state) => {
      // Order Done, No Payment yet
      return (
        !!state.openBatch &&
        !!state.pendingOrder &&
        !!state.pendingOrder.orderList &&
        !state.pendingOrder.payment
      );
    },
    //#endregion

    //#region ADMIN
    // Allow Actions based on Status of Current Batch
    "admin/allowOpenNewBatch": (state) => {
      // No open batch, Allow opening one
      return !state.openBatch && !state.latestBatch;
    },
    "admin/allowCloseBatch": (state) => {
      // Open batch for reservations, allow closure of the open_batch
      return (
        !!state.openBatch &&
        !!state.openBatch.created_at &&
        !state.openBatch.closed_at &&
        !state.openBatch.locked_at &&
        !state.openBatch.isDone
      );
    },
    "admin/allowFinishBatch": (state) => {
      // open_batch closed_at, accepting orders, menu changes not allowed
      return (
        !!state.openBatch &&
        !!state.openBatch.created_at &&
        !!state.openBatch.closed_at &&
        !state.openBatch.locked_at &&
        !state.openBatch.isDone
      );
    },
    "admin/allowDoneBatch": (state) => {
      // No open_batch, transferred to batches, locked_at is set, but not yet done
      return (
        !!state.latestBatch &&
        !!state.latestBatch.created_at &&
        !!state.latestBatch.closed_at &&
        !!state.latestBatch.locked_at &&
        !state.latestBatch.isDone
      );
    },
    //#endregion
  },
  modules: {},
});

// User Getter
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      unsubscribe();

      if (user) {
        const token = await user.getIdTokenResult();
        const isAdmin = !!token.claims.admin;
        const isSuperAdmin = !!token.claims.superAdmin;
        resolve({ user, isAdmin, isSuperAdmin });
      } else {
        resolve({ user: null, isAdmin: false });
      }
    });
  });
};

// User Observer for initApp Only
firebase.auth().onAuthStateChanged((user) => {
  console.log("Test: AuthChanged");

  // Setup App with User only on real Auth Change
  store.dispatch("initApp", user);
});

export default store;
export { getCurrentUser };
