import dotenv from 'dotenv'
import admin, { ServiceAccount } from "firebase-admin";
dotenv.config()

let appConfig;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  appConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
}

const serviceAccount: ServiceAccount = {
  projectId: appConfig.project_id,
  clientEmail: appConfig.client_email,
  privateKey: appConfig.private_key
}

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default {
  auth: firebase.auth()
};