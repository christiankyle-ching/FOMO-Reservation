<template>
  <div class="login">
    <div id="firebaseui-auth-container" class="mt-20 mx-auto p-5"></div>
  </div>
</template>

<script>
import firebase from "firebase/app";

import "firebaseui";
const ui = new firebaseui.auth.AuthUI(firebase.auth());

export default {
  name: "Login",
  mounted() {
    ui.start("#firebaseui-auth-container", {
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
      siteName: this.$store.state.clientName,
      signInSuccessUrl: this.$router.resolve({ name: "Home" }).href,

      // TODO: Terms of Service & Privacy Policy
      tosUrl: "",
      privacyPolicyUrl: "",
      callbacks: {
        uiShown: () => {
          this.$router.replace(this.$route.path); // Remove query params
        },
      },
    });
  },
};
</script>

<style>
/* FirebaseUI */
@import url("https://www.gstatic.com/firebasejs/ui/4.6.1/firebase-ui-auth.css");
</style>