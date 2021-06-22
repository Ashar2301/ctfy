import firebase from "firebase/app"
import "firebase/auth"

const app = firebase.initializeApp({
    apiKey: "AIzaSyBXGBvpR5_97uSrmdlqccvS_JD9ZfTAlNc",
    authDomain: "sma-project-dc315.firebaseapp.com",
    databaseURL: "https://sma-project-dc315-default-rtdb.firebaseio.com",
    projectId: "sma-project-dc315",
    storageBucket: "sma-project-dc315.appspot.com",
    messagingSenderId: "668364093854",
    appId: "1:668364093854:web:b344d2f24d0ab44452fe8f"
  })

export const auth = app.auth()
export default app;
