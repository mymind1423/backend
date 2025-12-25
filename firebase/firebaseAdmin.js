import admin from "firebase-admin";
import fs from "fs";

let adminInstance;

try {
  const serviceAccountPath = new URL("./serviceAccountKey.json", import.meta.url);
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    adminInstance = admin;
  } else {
    throw new Error("Service account file not found");
  }
} catch (error) {
  console.warn("Firebase Admin Init Failed (Mocking enabled):", error.message);
  adminInstance = {
    apps: [],
    auth: () => ({
      deleteUser: async () => console.log("Mock deleteUser called"),
      getUser: async () => ({ uid: 'mock' })
    }),
    initializeApp: () => { }
  };
}

const exportedAdmin = adminInstance;


export { exportedAdmin as admin };
