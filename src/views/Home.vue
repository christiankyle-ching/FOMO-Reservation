<template>
  <div class="home container">
    <h1 class="text-center py-10">Gringo's Waitlist</h1>
    <div v-if="user">
      <Order class="m-5"/>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Order from "@/components/Order.vue";

export default {
  name: "Home",
  components: { Order },
  data() {
    return {
      showProfileDropdown: false,
    };
  },
  computed: {
    ...mapState({
      user: "user",
    }),
  },
  methods: {},
};
</script>
