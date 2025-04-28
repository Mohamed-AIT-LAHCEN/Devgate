import {initializeApp} from 'firebase/app'
import {getFirestore} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'


const firebaseConfig = {
    apiKey: "AIzaSyCLA0FCC2Pj9Y8FINpBr05F-gH7xCl_laQ",
    authDomain: "devgate-project.firebaseapp.com",
    projectId: "devgate-project",
    storageBucket: "devgate-project.firebasestorage.app",
    messagingSenderId: "946114772418",
    appId: "1:946114772418:web:0f14565c053cbd642fea5b"
  };


  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const auth = getAuth(app)