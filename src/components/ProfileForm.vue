<template>
  <form @submit.prevent="saveUserProfile(formUserProfile)">
    <label class="p-0">Phone number:</label>
    <input
      type="tel"
      v-model="formUserProfile.phoneNumber"
      placeholder="Enter your phone number..."
      class="mt-2"
      required
    />
    <small v-if="formUserProfile.isPhoneValid" class="text-success"
      >Valid phone number ({{ formUserProfile.formattedPhoneNumber }})</small
    >
    <small class="text-danger" v-else>Please enter a valid phone number</small>

    <div class="text-right mt-3">
      <button
        @click="resetProfile()"
        type="button"
        class="button button-secondary"
      >
        Reset
      </button>

      <button
        type="submit"
        class="button button-primary ml-3"
        :disabled="!formUserProfile.isPhoneValid"
      >
        Save
      </button>
    </div>
  </form>
</template>

<script>
export default {
  data() {
    return { formUserProfile: this.$store.state.userProfile.clone() };
  },
  methods: {
    resetProfile() {
      this.formUserProfile = this.$store.state.userProfile.clone();
    },

    saveUserProfile(userProfile) {
      this.$store.dispatch("saveUserProfile", userProfile);

      this.formUserProfile.phoneNumber = this.formUserProfile.formattedPhoneNumber; // Input sanitation
    },
  },
};
</script>

<style>
</style>