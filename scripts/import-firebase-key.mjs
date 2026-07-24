import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const keyPath = process.argv[2];

if (!keyPath) {
  throw new Error("Usage: node scripts/import-firebase-key.mjs <service-account.json>");
}

const credentials = JSON.parse(await readFile(resolve(keyPath), "utf8"));

if (
  credentials.type !== "service_account" ||
  typeof credentials.project_id !== "string" ||
  typeof credentials.client_email !== "string" ||
  typeof credentials.private_key !== "string"
) {
  throw new Error("The selected file is not a valid Firebase service-account key.");
}

const envPath = resolve(".env.local");
let env = await readFile(envPath, "utf8");

const replacements = {
  FIREBASE_ADMIN_PROJECT_ID: credentials.project_id,
  FIREBASE_ADMIN_CLIENT_EMAIL: credentials.client_email,
  FIREBASE_ADMIN_PRIVATE_KEY: credentials.private_key.replace(/\r?\n/g, "\\n"),
};

for (const [name, value] of Object.entries(replacements)) {
  const line = `${name}=${value}`;
  const expression = new RegExp(`^${name}=.*$`, "m");
  env = expression.test(env) ? env.replace(expression, line) : `${env.trimEnd()}\n${line}\n`;
}

await writeFile(envPath, env, "utf8");
console.log(`Imported Firebase Admin credentials for ${credentials.project_id}.`);
