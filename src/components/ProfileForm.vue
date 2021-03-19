<template>
  <form @submit.prevent="saveUserProfile(formUserProfile)">
    <label class="p-0">Phone number:</label>
    <input
      type="tel"
      v-model="formUserProfile.phoneNumber"
      placeholder="Please enter your phone number"
      class="mt-2"
      required
    />
    <small v-if="formUserProfile.isPhoneValid"
      >{{ formUserProfile.formattedPhoneNumber }}</small
    >
    <small class="italic text-danger" v-else>Invalid Phone Number</small>

    <div class="text-right mt-3">
      <button
        type="submit"
        class="button button-primary"
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
    saveUserProfile(userProfile) {
      this.$store.dispatch("saveUserProfile", userProfile);
      this.formUserProfile.phoneNumber = this.formUserProfile.formattedPhoneNumber;
    },
  },
};
</script>

<style>
</style>