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
        <button
          @click="$emit('close')"
          class="button-icon button-icon-md button-transparent"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <!-- Icon: x-sm -->
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
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