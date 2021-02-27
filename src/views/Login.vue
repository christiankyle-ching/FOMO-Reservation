<template>
  <div class="login">
    <h1>Login</h1>
    <div id="firebaseui-auth-container"></div>
  </div>
</template>

<script>
import "@/firebase";
import firebase from "firebase/app";
import "firebaseui";

const ui = new firebaseui.auth.AuthUI(firebase.auth());

export default {
  name: "Login",
  mounted() {
    ui.start("#firebaseui-auth-container", {
      signInOptions: [firebase.auth.FacebookAuthProvider.PROVIDER_ID],
      callbacks: {
        signInSuccessWithAuthResult: (_, __) => {
          this.$router.push({ name: "Home" });
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