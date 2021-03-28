<template>
  <div class="app-container">
    <div class="app-container__header">
      <h1>Your Profile, {{ user?.displayName }}</h1>
      <i>{{ user.email }}</i>
    </div>

    <div class="grid grid-separated grid-padded">
      <LinkPhoneNumber class="" />

      <!-- Change Display Name -->
      <form
        @submit.prevent="changeDisplayName(newName)"
        class="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-5 items-center"
      >
        <b class="sm:col-span-2">Change Display Name</b>
        <input
          type="text"
          v-model.trim="newName"
          placeholder="Enter your Facebook Name..."
          class="sm:col-span-3 m-0"
        />
        <button
          type="submit"
          class="button button-primary justify-self-end sm:col-span-2"
          :disabled="!newName"
        >
          Change
        </button>
      </form>

      <!-- Reset Password -->
      <div class="flex justify-between items-center">
        <b>Reset Your Password</b>
        <button
          class="button button-danger justify-self-end"
          @click="resetPassword()"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import LinkPhoneNumber from "@/components/LinkPhoneNumber";
import { mapActions, mapState } from "vuex";

export default {
  name: "UserProfile",
  components: { LinkPhoneNumber },
  data() {
    return { newName: "" };
  },
  computed: {
    ...mapState(["user"]),
  },
  methods: {
    ...mapActions({
      changeDisplayName(dispatch) {
        dispatch("confirm", {
          title: "Change Name?",
          message:
            "Are you sure you want to change your name? Please make sure that this name reflects your Facebook Account to serve us an alternative contact to you.",
          buttonMessage: "Yes",
          callback: () => {
            dispatch("changeDisplayName", this.newName);
          },
        });
      },
      resetPassword(dispatch) {
        dispatch("confirmDanger", {
          title: "Reset Password?",
          message:
            "Are you sure you want to reset your password? You will be sent an email for further instructions.",
          buttonMessage: "Yes",
          callback: () => {
            dispatch("resetPassword");
          },
        });
      },
    }),
  },
  mounted() {
    // Autofill current user.displayName in input
    this.newName = this.$store.state.user.displayName;
  },
};
</script>

<style>
</style>