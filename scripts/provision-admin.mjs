import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const email = required("ADMIN_EMAIL").trim().toLowerCase();
const password =
  process.env.ADMIN_PASSWORD ?? `${randomBytes(18).toString("base64url")}A7!`;

if (password.length < 12) {
  throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
}

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: required("FIREBASE_ADMIN_PROJECT_ID"),
      clientEmail: required("FIREBASE_ADMIN_CLIENT_EMAIL"),
      privateKey: required("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  });

const auth = getAuth(app);
const db = getFirestore(app);

let user;
try {
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, { password, disabled: false });
} catch (error) {
  if (error?.code !== "auth/user-not-found") {
    throw error;
  }
  user = await auth.createUser({
    email,
    password,
    emailVerified: true,
  });
}

await db.collection("admins").doc(user.uid).set(
  {
    email,
    role: "admin",
    createdAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);

if (process.env.ADMIN_CREDENTIALS_FILE) {
  const credentialsPath = resolve(process.env.ADMIN_CREDENTIALS_FILE);
  await mkdir(dirname(credentialsPath), { recursive: true });
  await writeFile(
    credentialsPath,
    `LeadDesk Mini administrator\nEmail: ${email}\nPassword: ${password}\n`,
    { encoding: "utf8", mode: 0o600 },
  );
}

console.log(`Administrator provisioned for ${email} (${user.uid}).`);
