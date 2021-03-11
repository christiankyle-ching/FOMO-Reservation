<template>
  <div class="home container flex flex-col min-h-screen">
    <h1 class="text-center py-10 flex-grow-0">FOMO's Waitlist</h1>

    <div v-if="user" class="flex-grow flex">
      <Order v-if="orderAllowed" class="mx-auto" />
      <h3 v-else-if="orderDone" class="text-center m-auto">
        You already submitted your order. Please wait for our confirmation on
        Facebook.
      </h3>

      <Reserve v-else class="m-auto pb-48" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { Alert } from "@/models/Alert";
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
  methods: {
    testAlert(type) {
      this.$store.dispatch(
        "alert",
        new Alert({
          message:
            "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore officiis esse, dicta dolores quos eius?",
          type: type,
        })
      );
    },
  },
};
</script>
