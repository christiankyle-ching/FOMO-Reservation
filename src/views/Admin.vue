<template>
  <div class="admin container">
    <h1 class="text-center py-10">Manage FOMO</h1>

    <OpenBatch class="m-5" />
    
    <!-- TODO: Implement View last batches with pagination -->
    <!-- <Batches class="m-5" /> -->
    <Products class="m-5" />
  </div>
</template>

<script>
import Products from "@/components/Products.vue";
import Batches from "@/components/Batches.vue";
import OpenBatch from "@/components/OpenBatch";
import LatestBatch from "@/components/LatestBatch";

export default {
  name: "Admin",
  components: { Products, Batches, OpenBatch, LatestBatch },
};
</script>

<style>
</style>