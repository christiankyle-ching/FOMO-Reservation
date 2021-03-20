<template>
  <div
    class="alert"
    :class="{
      'alert-danger': alert.type === 'danger',
      'alert-info': alert.type === 'info',
      'alert-success': alert.type === 'success',
    }"
  >
    <span class="message">{{ alert.message }} </span>
    <button
      v-if="!alert.isPermanent"
      @click="$emit('remove')"
      class="button button-icon button-icon-md"
    >
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