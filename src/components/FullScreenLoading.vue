<template>
  <div class="fullscreen-overlay">
    <div class="backdrop"></div>
    <div class="m-auto">
      <LoadingSpinner />
    </div>
  </div>
</template>

<script>
import LoadingSpinner from "@/components/LoadingSpinner";

export default {
  components: { LoadingSpinner },
  inheritAttrs: false,
  mounted() {
    document.body.classList.add("prevent-scroll");
  },
  unmounted() {
    document.body.classList.remove("prevent-scroll");
  },
};
</script>

<style>
</style>