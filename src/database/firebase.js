import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export class Firebase {
  constructor() {
    this._conf = {
      apiKey: "AIzaSyD55wniW_uky-iZq0whh-TipooT0lApDAE",
      authDomain: "whatsapp-test-8919a.firebaseapp.com",
      projectId: "whatsapp-test-8919a",
      storageBucket: "whatsapp-test-8919a.appspot.com",
      messagingSenderId: "1072722289248",
      appId: "1:1072722289248:web:6befaf1ed5337401cc9905",
      measurementId: "G-QGSB519P3E",
    };

    this.init();
  }

  init() {
    this._app = initializeApp(this._conf);
  }

  static db() {
    return getFirestore(this._app);
  }

  static hd() {
    return getStorage(this._app);
  }

  auth() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    return signInWithPopup(auth, provider);
  }
}
