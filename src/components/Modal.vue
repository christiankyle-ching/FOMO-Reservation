<template>
  <div class="modal">
    <div class="modal__backdrop" @click="$emit('close')"></div>
    <div class="modal__dialog">
      <!-- Header -->
      <div class="modal__header">
        <div>
          <slot name="header"></slot>
        </div>
        <!-- Close Button -->
        <button @click="$emit('close')" class="button-icon button-icon-md">
          <span class="fas fa-times"></span>
        </button>
      </div>

      <!-- Content -->
      <div class="modal__content overflow-y-scroll max-h-96">
        <slot name="content"></slot>
      </div>

      <!-- Buttons / Footer -->
      <div class="modal__buttons">
        <slot name="buttons"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["close"],
};
</script>

<style>
</style>