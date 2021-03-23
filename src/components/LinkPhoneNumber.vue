<template>
  <div :key="_userKey">
    <!-- a: If no phone number linked -->
    <div v-show="!user?.phoneNumber">
      <form
        @submit.prevent
        class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5"
      >
        <!-- Phone Number -->
        <div class="col-span-1">
          <label class="p-0">Phone Number:</label>
          <div class="flex items-center mt-2">
            <span class="mr-3">+63</span>
            <input
              type="tel"
              v-model="phoneNumber"
              maxlength="10"
              placeholder="9xxxxxxxxx"
              class="flex-grow m-0"
              :disabled="isSMSSent"
            />
          </div>
        </div>

        <!-- Verification Code -->
        <div class="col-span-1" v-if="isSMSSent">
          <!-- Code Input -->
          <label class="p-0">Verification Code:</label>
          <input
            type="number"
            v-model.trim="verificationCode"
            class="mt-2"
            maxlength="10"
          />
        </div>

        <!-- Buttons -->
        <div
          v-if="isSMSSent"
          class="self-end sm:col-span-2 grid grid-cols-2 gap-5"
        >
          <button
            type="button"
            class="button button-secondary"
            @click="resetForm()"
          >
            Cancel
          </button>

          <button
            type="button"
            class="button button-primary"
            @click="verifyCode()"
          >
            Verify
          </button>
        </div>

        <button
          type="button"
          class="button button-secondary self-end"
          @click="requestCode()"
          :disabled="!(phoneNumber.length >= 10 && recaptchaSolved)"
          v-else
        >
          Send Code
        </button>
      </form>

      <!-- recaptcha -->
      <div class="flex justify-center mt-3">
        <div id="recaptcha-container" v-show="!isSMSSent"></div>
      </div>
    </div>

    <!-- b: Unlink phone number -->
    <div v-show="!!user?.phoneNumber">
      <form @submit.prevent="unlinkPhoneNumber()" class="flex items-center">
        <div class="flex-grow">
          <b>Phone Number:</b>
          <span class="ml-3">{{ user.phoneNumber }}</span>
        </div>
        <button type="submit" class="button button-danger">Unlink</button>
      </form>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import { ALERT_TYPE } from "../models/Alert";
import { mapState } from "vuex";

export default {
  data() {
    return {
      _key: 0,

      appVerifier: null,
      verificationId: null,

      phoneNumber: "",
      verificationCode: "",
      isSMSSent: false,

      recaptchaSolved: false,
    };
  },

  computed: {
    ...mapState({ user: "user", _userKey: "_userKey" }),
  },

  methods: {
    // Link Phone
    requestCode() {
      firebase
        .auth()
        .signInWithPhoneNumber(`+63${this.phoneNumber}`, this.appVerifier)
        .then((confirmationResult) => {
          this.verificationId = confirmationResult.verificationId;
          this.isSMSSent = true;
        })
        .catch((error) => {
          console.error(error);

          this.$store.dispatch(
            "alertError",
            "Cannot send SMS to that number. Please check the number and try again."
          );

          this.isSMSSent = false;
          this.recaptchaSolved = false;
        });
    },

    verifyCode() {
      console.log("verifyCode");

      const credential = firebase.auth.PhoneAuthProvider.credential(
        this.verificationId,
        this.verificationCode
      );

      firebase
        .auth()
        .currentUser.linkWithCredential(credential)
        .then((result) => {
          this.$store.commit("SET_USER", result.user);

          this.$store.dispatch(
            "alertSuccess",
            "Successfully linked your phone number."
          );
        })
        .catch((err) => {
          console.error(err);
          this.$store.dispatch(
            "alertError",
            "Unable to verify code. Please try again."
          );

          this.resetForm();
        });
    },

    onRecaptchaSolve(response) {
      console.log("onRecaptchaSolve");

      this.recaptchaSolved = true;
    },

    onRecaptchaExpire() {
      console.log("onRecaptchaExpire");

      this.recaptchaSolved = false;
    },

    // Unlink Phone
    unlinkPhoneNumber() {
      firebase
        .auth()
        .currentUser.unlink(firebase.auth.PhoneAuthProvider.PROVIDER_ID)
        .then((user) => {
          this.$store.commit("SET_USER", user);

          this.$store.dispatch(
            "alertError",
            "Successfully unlinked your phone number. Please provide one to be able to order."
          );

          this.resetForm();
        })
        .catch((err) => {
          console.error(err);

          this.$store.dispatch(
            "alertError",
            "Something went wrong. Please try again later."
          );
        });
    },

    // Form
    resetForm() {
      this.phoneNumber = "";
      this.verificationCode = "";
      this.isSMSSent = false;
      this.recaptchaSolved = false;
    },
  },

  mounted() {
    const recaptchaOptions = {
      callback: this.onRecaptchaSolve,
      "expired-callback": this.onRecaptchaExpire,
    };

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      recaptchaOptions
    );

    this.appVerifier = window.recaptchaVerifier;
    this.appVerifier.render();
  },
};
</script>

<style>
</style>