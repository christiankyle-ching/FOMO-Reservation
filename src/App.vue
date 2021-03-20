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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <!-- Icon: Left -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        <router-link :to="{ name: 'Home' }">
          <h3>{{ $store.state.clientName }}</h3>
        </router-link>

        <div class="ml-auto my-auto flex items-center">
          <!-- Toggle: Dark Mode -->
          <button
            type="button"
            class="button-icon button-icon-sm button-transparent mr-3 md:mr-7"
            @click="toggleDarkMode()"
          >
            <transition name="fade" mode="out-in">
              <div v-if="darkModeEnabled" class="text-lightPrimary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <!-- Icon: Lightbulb-sm -->
                  <path
                    d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"
                  />
                </svg>
              </div>
              <div v-else class="text-darkSecondary">
                <!-- Icon: Moon-sm -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                  />
                </svg>
              </div>
            </transition>
          </button>

          <router-link
            v-if="isAdmin"
            :to="{ name: 'Admin' }"
            class="button button-transparent mr-2"
            >Admin</router-link
          >

          <router-link
            v-else
            :to="{ name: 'Home' }"
            class="button button-transparent mr-2"
            >Home</router-link
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

  <router-view class="min-h-screen" />
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
      isAdmin: "isAdmin",
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
