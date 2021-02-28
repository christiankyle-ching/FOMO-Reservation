<template>
  <div class="navbar shadow-2xl">
    <div class="container mx-auto flex p-3">
      <h3 class="py-1">
        <router-link :to="{ name: 'Home' }">Gringo</router-link>
      </h3>

      <div class="ml-auto my-auto">
        <button v-if="user" class="block button button-primary" @click="logout">Logout</button>
        <router-link v-else :to="{ name: 'Login' }" class="block button button-primary "
          >Login</router-link
        >
      </div>
    </div>
  </div>
  <router-view class="container mx-auto" />
</template>

<script>
import firebase from "firebase/app";
import { mapState } from "vuex";

export default {
  computed: mapState({
    user: "user",
  }),
  methods: {
    logout() {
      firebase.auth().signOut();
    },
  },
  created() {
    console.log("App Created");
  },
};
</script>

<style>
</style>
