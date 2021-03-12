<template>
  <div class="alert" :class="alert.className">
    <span class="message">{{ alert.message }} </span>
    <button v-if="!alert.isPermanent" @click="$emit('remove')">
      <span class="fas fa-times"></span>
    </button>
  </div>
</template>

<script>
export default {
  props: ["alert"],
  emits: ["remove"],
};
</script>

<style>
</style>