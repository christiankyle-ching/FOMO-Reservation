<template>
  <div class="home pt-10">
    <h1 class="text-center">Gringo's Waitlist</h1>
    <div v-if="user">
      <Order class="mt-5"/>
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
