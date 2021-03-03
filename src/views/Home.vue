<template>
  <div class="home container">
    <h1 class="text-center py-10">FOMO's Waitlist</h1>
    <div v-if="user">
      <Reserve />

      <Order v-if="orderAllowed" class="m-5" />
      <h3 v-else-if="orderDone" class="text-center mt-3">
        You already submitted your order. Please wait for our confirmation on
        Facebook.
      </h3>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Order from "@/components/Order.vue";
import Reserve from "@/components/Reserve.vue";

export default {
  name: "Home",
  components: { Order, Reserve },
  data() {
    return {
      showProfileDropdown: false,
    };
  },
  computed: {
    ...mapState({
      user: "user",
      order: "order",
      orderAllowed: "orderAllowed",
      orderDone: "orderDone",
    }),
  },
  methods: {},
};
</script>
