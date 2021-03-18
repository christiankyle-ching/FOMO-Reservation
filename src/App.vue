<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar shadow-xl h-16">
      <div class="container mx-auto flex p-3 items-center">
        <button
          v-if="$route.name != 'Home'"
          @click="$router.go(-1)"
          class="button-icon button-icon-md mr-3"
        >
          <span class="fas fa-arrow-left"></span>
        </button>

        <router-link :to="{ name: 'Home' }">
          <h3>{{ $store.state.clientName }}</h3>
        </router-link>

        <!-- Toggle: Dark Mode -->
        <button
          type="button"
          class="button-icon button-icon-md button-transparent ml-2"
          @click="toggleDarkMode()"
        >
          <transition name="fade" mode="out-in">
            <div v-if="darkModeEnabled">
              <span class="fas fa-sun text-lightPrimary"></span>
            </div>
            <div v-else>
              <span class="fas fa-moon text-darkSecondary"></span>
            </div>
          </transition>
        </button>

        <div class="ml-auto my-auto flex items-center">
          <router-link :to="{ name: 'Admin' }" class="nav-link mr-5"
            >Admin</router-link
          >

          <button
            v-if="user"
            class="block button button-primary"
            @click="logout()"
          >
            Logout
          </button>
          <router-link
            v-else
            :to="{ name: 'Login' }"
            class="block button button-primary"
            >Login</router-link
          >
        </div>
      </div>
    </nav>

    <!-- Alerts -->
    <div class="alerts">
      <transition name="fade">
        <Alert v-if="!isOnline" :alert="noInternetAlert" />
      </transition>
      <transition-group name="fade">
        <div v-for="(alert, index) in alerts" :key="alert">
          <Alert :alert="alert" @remove="removeAlert(index)" />
        </div>
      </transition-group>
    </div>
  </div>

  <router-view class="container mx-auto min-h-screen p-5 sm:p-10" />
</template>

<script>
import firebase from "firebase/app";
import { mapActions, mapState } from "vuex";
import Alert from "@/components/Alert";
import { Alert as AlertObj } from "@/models/Alert";

export default {
  components: { Alert },
  data() {
    return {
      noInternetAlert: new AlertObj({
        message: "Please check your internet connection.",
        type: "danger",
        isPermanent: true,
      }),
    };
  },
  computed: {
    ...mapState({
      user: "user",
      alerts: "alerts",
      isOnline: "isOnline",
      darkModeEnabled: "darkModeEnabled",
    }),
  },
  created() {
    // Network Connection Changes
    window.addEventListener("offline", () => {
      store.commit("SET_ONLINE", false);
    });
    window.addEventListener("online", () => {
      store.commit("SET_ONLINE", true);
    });
  },
  methods: {
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router.push({ name: "Login" });
        });
    },
    ...mapActions({
      removeAlert: "removeAlert",
      toggleDarkMode: "toggleDarkMode",
    }),
  },
};
</script>

<style>
</style>
