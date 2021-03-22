<template>
  <div v-if="!!products" >
    <div v-for="message in statsMessages" :key="message">
      <p class="flex justify-between">
        <span class="font-medium">{{ message.category }}: </span>
        <span>{{ message.count }}</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: { products: Array },
  data() {
    return {};
  },
  computed: {
    statsMessages() {
      const statsMessages = [];

      const categories = new Set(this.products.map((p) => p.category));
      categories.forEach((c) => {
        statsMessages.push({
          category: c,
          count: this.products.filter((_c) => _c.category == c).length,
        });
      });

      // Total
      statsMessages.push({
        category: "Total",
        count: this.products.length,
      });

      return statsMessages;
    },
  },
};
</script>

<style>
</style>