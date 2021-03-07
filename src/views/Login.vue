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

const ui = new firebaseui.auth.AuthUI(firebase.auth());

export default {
  name: "Login",
  mounted() {
    // TODO: Get user_link permissions
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

          // TODO: Update FB Link in DB
          const uid = result.user.uid;
          await firebase
            .firestore()
            .collection("user-links")
            .doc(uid)
            .set({ fb: apiRes.link });

          // Test
          // const reqUrl2 = `https://graph.facebook.com/${fbUid}?fields=user_link&access_token=${token}`;
          // const apiRes2 = await (await fetch(reqUrl2)).json();
          // console.log(apiRes2);

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