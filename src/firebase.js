// Importa os métodos necessários do Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";  // Para usar o Realtime Database

// Configuração do Firebase que você recebeu
const firebaseConfig = {
  apiKey: "AIzaSyAP-7aMvrotZi74uRpxqDujaN8QtfWI_7M",
  authDomain: "treasure-hunter-8376c.firebaseapp.com",
  databaseURL: "https://treasure-hunter-8376c-default-rtdb.firebaseio.com",
  projectId: "treasure-hunter-8376c",
  storageBucket: "treasure-hunter-8376c.appspot.com",
  messagingSenderId: "972242812150",
  appId: "1:972242812150:web:1947bed79af0f6591f80d7",
  measurementId: "G-H4Q0651MT0"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Realtime Database
const database = getDatabase(app);

export default database;
