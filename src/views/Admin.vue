<template>
  <div class="admin container">
    <h1 class="text-center py-10">Manage Gringo</h1>

    <Batches class="m-5"/>
    <Products class="m-5"/>
  </div>
</template>

<script>
import Products from '@/components/Products.vue';
import Batches from '@/components/Batches.vue';

export default {
  name: "Admin",
  components: { Products, Batches },
};
</script>

<style>
</style>