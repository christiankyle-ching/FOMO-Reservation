<template>
  <div class="admin container">
    <h1 class="text-center py-10">Manage Gringo</h1>

    <Products class="m-5"/>
  </div>
</template>

<script>
import Products from '@/components/Products.vue';

export default {
  name: "Admin",
  components: { Products },
};
</script>

<style>
</style>