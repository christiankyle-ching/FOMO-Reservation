import "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCS7Kl2rY5hgRGbc0dIDttdJvLpu8lP324",
  authDomain: "proto-gringo.firebaseapp.com",
  projectId: "proto-gringo",
  storageBucket: "proto-gringo.appspot.com",
  messagingSenderId: "990238963058",
  appId: "1:990238963058:web:88fd3c9f809fa4217219eb",
  measurementId: "G-21BGSXZRBM",
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
console.log("Init: Firebase");

// Other services
if (process.env.NODE_ENV !== "development") {
  console.log("Init: Analytics");
  firebase.analytics();
}

export default firebase;
