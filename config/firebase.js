import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  new URL("../firebase/serviceAccountKey.json", import.meta.url);

const raw = fs.readFileSync(
  SERVICE_ACCOUNT_PATH instanceof URL
    ? SERVICE_ACCOUNT_PATH
    : path.resolve(SERVICE_ACCOUNT_PATH),
  "utf8"
);
const serviceAccount = JSON.parse(raw);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };
