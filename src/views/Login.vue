<template>
  <div class="login">
    <div class="flex h-screen m-auto">
      <div id="firebaseui-auth-container" class="flex m-auto"></div>
    </div>
  </div>
</template>

<script>
import "@/firebase";
import firebase from "firebase/app";
import "firebaseui";
import { UserProfile } from "@/models/UserProfile";

const ui = new firebaseui.auth.AuthUI(firebase.auth());

export default {
  name: "Login",
  mounted() {
    ui.start("#firebaseui-auth-container", {
      signInOptions: [
        {
          provider: "facebook.com",
          providerName: "Facebook",
          scopes: ["user_link"],
        },
      ],

      callbacks: {
        signInSuccessWithAuthResult: async (result, __) => {
          // Fetch FB Link with FB API
          const fbUid = result.user.providerData[0].uid;
          const token = result.credential.accessToken;
          const reqUrl = `https://graph.facebook.com/${fbUid}?fields=link&access_token=${token}`;

          const apiRes = await (await fetch(reqUrl)).json();

          const uid = result.user.uid;

          await firebase
            .firestore()
            .collection("user-profiles")
            .doc(uid)
            .set(
              new UserProfile({ uid: uid, fbLink: apiRes.link }).firestoreDoc,
              { merge: true }
            );

          // Redirect to Home
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