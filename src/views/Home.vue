<template>
  <div class="home">
    <h1>Gringo's Waitlist</h1>
    <div v-if="user">
      <div class="user">
        {{ user.displayName }}
        <button @click="logout">Logout</button>
      </div>

      <Order />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import firebase from "firebase/app";

import Order from "@/components/Order.vue";

export default {
  name: "Home",
  components: { Order },
  computed: mapState({
    user: "user",
  }),
  methods: {
    logout() {
      firebase.auth().signOut();
    },
  },
};
</script>
