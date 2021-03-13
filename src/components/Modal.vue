<template>
  <div class="modal">
    <div class="modal__backdrop" @click="$emit('close')"></div>
    <div class="modal__dialog">
      <div class="modal__header">
        <div>
          <slot name="header"></slot>
        </div>

        <!-- Close Button -->
        <button @click="$emit('close')" class="button-icon button-icon-md">
          <span class="fas fa-times"></span>
        </button>
      </div>
      <div class="modal__content">
        <slot name="content"></slot>
      </div>
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