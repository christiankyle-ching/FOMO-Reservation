<template>
  <div>
    <transition name="fade">
      <ConfirmModal v-if="!!confirmModal" />
    </transition>

    <Sidebar :active="sidebarActive" @close="hideSidebar()">
      <template v-slot:header>
        <router-link :to="{ name: 'Home' }">
          <h1>{{ $store.state.clientName }}</h1>
        </router-link>
      </template>

      <!-- SIDEBAR LINKS -->
      <template v-slot:content>
        <!-- Home / Admin Dashboard -->
        <router-link
          v-if="isAdmin || isSuperAdmin"
          :to="{ name: 'Admin' }"
          class="sidebar-link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <!-- Icon: chart-square-bar -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Admin</router-link
        >
        <router-link v-else :to="{ name: 'Home' }" class="sidebar-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <!-- Icon: home -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Home</router-link
        >

        <!-- Profile -->
        <router-link :to="{ name: 'UserProfile' }" class="sidebar-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <!-- Icon: user-circle -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Profile</router-link
        >

        <!-- CUSTOMER ONLY -->
        <router-link
          v-if="!isAdmin && !isSuperAdmin"
          :to="{ name: 'PaidOrders' }"
          class="sidebar-link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <!-- Icon: clipboard-check -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Past Orders</router-link
        >

        <!-- #region ADMINS ONLY -->
        <div v-if="isAdmin || isSuperAdmin">
          <!-- Food Menu -->
          <span
            :title="
              isTakingOrders ? 'Cannot adjust prices when taking orders' : null
            "
          >
            <router-link
              :to="isTakingOrders ? {} : { name: 'Products' }"
              :disabled="isTakingOrders"
              tag="button"
              class="sidebar-link"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <!-- Icon: flag-sm -->
                <path
                  fill-rule="evenodd"
                  d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                  clip-rule="evenodd"
                />
              </svg>
              Food Menu
            </router-link>
          </span>

          <!-- Batch History -->
          <router-link :to="{ name: 'BatchHistory' }" class="sidebar-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <!-- Icon: collection-sm -->
              <path
                d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
              />
            </svg>
            View Batch History
          </router-link>

          <!-- Default Settings -->
          <router-link :to="{ name: 'AdminSettings' }" class="sidebar-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <!-- Icon: cog-sm -->
              <path
                fill-rule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd"
              />
            </svg>
            Settings
          </router-link>

          <!-- SuperAdmin Only: Manage Admins -->
          <router-link
            :to="{ name: 'ManageAdmins' }"
            class="sidebar-link"
            v-if="isSuperAdmin"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <!-- Icon: user-group -->
              <path
                d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
              />
            </svg>
            Manage Admins
          </router-link>
        </div>
        <!-- #endregion -->

        <!-- Login / Logout -->
        <button v-if="user" @click="logout()" class="sidebar-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <!-- Icon: logout -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
        <router-link v-else :to="{ name: 'Login' }" class="sidebar-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <!-- Icon: login -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Login</router-link
        >
      </template>
    </Sidebar>

    <!-- Navbar -->
    <nav class="navbar shadow-xl h-16">
      <div class="container mx-auto flex p-3 items-center">
        <!-- Sidebar Toggle -->
        <button
          type="button"
          class="button button-transparent button-icon button-icon-md"
          @click="showSidebar()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <router-link :to="{ name: 'Home' }" class="ml-3">
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

          <!-- Login / Logout -->
          <button
            v-if="user"
            class="block button button-danger"
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
import { mapActions, mapGetters, mapState } from "vuex";
import Sidebar from "@/components/Sidebar";
import Alert from "@/components/Alert";
import ConfirmModal from "@/components/ConfirmModal";
import { Alert as AlertObj } from "@/models/Alert";

export default {
  components: { Alert, Sidebar, ConfirmModal },
  data() {
    return {
      sidebarActive: false,
      isCModalShown: false,

      noInternetAlert: new AlertObj({
        message: "Please check your internet connection.",
        type: "danger",
        isPermanent: true,
      }),
    };
  },
  computed: {
    ...mapState([
      "user",
      "isAdmin",
      "isSuperAdmin",
      "alerts",
      "isOnline",
      "darkModeEnabled",

      "confirmModal",
    ]),
    ...mapGetters({
      isTakingOrders: "admin/allowFinishBatch",
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
    async logout() {
      this.sidebarActive = false;

      this.$store.dispatch("confirmDanger", {
        title: "Logout",
        message: "Are you sure you want to log out?",
        buttonMessage: "Yes",
        callback: async () => {
          try {
            await this.dispatchLogout();
            this.$router.push({ name: "Login" });
          } catch (err) {
            console.error(err);
          }
        },
      });
    },
    ...mapActions({
      dispatchLogout: "logout",
      removeAlert: "removeAlert",
      toggleDarkMode: "toggleDarkMode",
    }),

    // Sidebar
    showSidebar() {
      this.sidebarActive = true;
    },
    hideSidebar() {
      this.sidebarActive = false;
    },
  },
};
</script>

<style>
</style>
