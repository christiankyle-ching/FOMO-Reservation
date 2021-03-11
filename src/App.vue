<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar shadow-xl">
      <div class="container mx-auto flex p-3">
        <h3 class="py-1">
          <router-link :to="{ name: 'Home' }">FOMO</router-link>
        </h3>

        <div class="ml-auto my-auto flex items-center">
          <router-link :to="{ name: 'Admin' }" class="nav-link mr-5"
            >Admin</router-link
          >

          <button
            v-if="user"
            class="block button button-primary"
            @click="logout"
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

    <div class="alerts absolute top-0 p-5">
      <transition-group name="fade">
        <div v-for="(alert, index) in alerts" :key="alert">
          <Alert :alert="alert" @remove="removeAlert(index)" />
        </div>
      </transition-group>
    </div>
  </div>

  <router-view class="container mx-auto" />
</template>

<script>
import firebase from "firebase/app";
import { mapActions, mapState } from "vuex";
import Alert from "@/components/Alert";

export default {
  components: { Alert },
  computed: mapState({
    user: "user",
    alerts: "alerts",
  }),
  methods: {
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router.push({ name: "Login" });
        });
    },
    ...mapActions({ removeAlert: "removeAlert" }),
  },
  mounted() {},
};
</script>

<style>
</style>
