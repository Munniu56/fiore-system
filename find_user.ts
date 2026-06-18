import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function main() {
  console.log("Connecting to Firestore database:", firebaseConfig.firestoreDatabaseId);
  const usersCol = collection(db, "users");
  const usersSnap = await getDocs(usersCol);
  
  console.log(`Found ${usersSnap.size} user documents in total:\n`);
  usersSnap.forEach((doc) => {
    const data = doc.data();
    console.log(`Document ID: ${doc.id}`);
    console.log(JSON.stringify(data, null, 2));
    console.log("-----------------------");
  });
}

main().catch(console.error);
