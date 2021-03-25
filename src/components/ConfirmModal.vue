<template>
  <Modal @close="closeConfirmModal()" class="z-30">
    <template v-slot:header>
      <h3>{{ confirmModal?.title }}</h3>
    </template>
    <template v-slot:content>
      <p class="whitespace-pre-line">{{ confirmModal?.message }}</p>
    </template>
    <template v-slot:buttons>
      <!-- Cancel -->
      <button
        @click="closeConfirmModal()"
        type="button"
        class="button button-secondary"
      >
        Cancel
      </button>

      <!-- Confirm -->
      <button
        @click="onConfirm()"
        type="button"
        class="button"
        :class="{
          'button-danger': confirmModal?.type === 'danger',
          'button-primary': confirmModal?.type === '',
        }"
        :disabled="!confirmModal?.callback"
      >
        {{ confirmModal?.buttonMessage }}
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal";
import { mapActions, mapState } from "vuex";

export default {
  components: { Modal },
  emits: ["close"],
  computed: {
    ...mapState(["confirmModal"]),
  },
  methods: {
    ...mapActions(["closeConfirmModal"]),
    onConfirm() {
      try {
        this.confirmModal.callback();
      } catch (err) {
        console.error(err);
      } finally {
        this.closeConfirmModal();
      }
    },
  },
  mounted() {},
};
</script>

<style>
</style>