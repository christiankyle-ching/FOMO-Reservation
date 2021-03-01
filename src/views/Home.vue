<template>
  <div class="home container">
    <h1 class="text-center py-10">Gringo's Waitlist</h1>
    <div v-if="user">

      <Reserve />
      
      <Order class="m-5"/>
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
    }),
  },
  methods: {},
};
</script>
