# Firebase Setup for LeadDesk Mini

This setup creates the real database and real administrator login required by the assignment. Do not send or commit passwords or service-account keys.

## 1. Create the project

1. Open <https://console.firebase.google.com/>.
2. Select **Create a project**.
3. Use the name `leaddesk-mini-mousumi`.
4. Google Analytics is not required for this assignment.
5. Wait until the project is ready.

## 2. Register the web application

1. In **Project Overview**, select the Web icon (`</>`).
2. Use the nickname `LeadDesk Mini Web`.
3. Firebase Hosting is not required because the Next.js application will be deployed separately.
4. Copy the displayed Firebase configuration values into `.env.local`:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

These values identify the Firebase web application. Administrator privileges do not come from these public values.

## 3. Enable real authentication

1. Open **Build > Authentication**.
2. Select **Get started**.
3. Open **Sign-in method**.
4. Enable **Email/Password** only.
5. Do not enable anonymous access.

## 4. Create Firestore

1. Open **Build > Firestore Database**.
2. Select **Create database**.
3. Choose **Production mode**.
4. Choose a nearby available region and record it in the README.
5. Publish the repository's `firestore.rules`, which deny all browser database access. LeadDesk Mini writes through protected server routes using the Admin SDK.

## 5. Create server credentials

1. Open **Project settings > Service accounts**.
2. Select **Generate new private key**.
3. Save the downloaded JSON outside the repository.
4. Copy its values into `.env.local`:

```dotenv
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SESSION_COOKIE_NAME=leaddesk_session
```

Never upload the JSON file, `.env.local`, or the private key to GitHub or Google Drive.

## 6. Provision the test administrator

Set temporary process variables in PowerShell and run the provisioning script:

```powershell
$env:ADMIN_EMAIL='the-test-admin-email'
$env:ADMIN_PASSWORD='a-unique-12-character-or-longer-password'
pnpm provision:admin
Remove-Item Env:ADMIN_EMAIL
Remove-Item Env:ADMIN_PASSWORD
```

The script creates or updates the Firebase Authentication user and writes `admins/{uid}` with `role: "admin"`. It never prints the password.

## 7. Verify

1. Submit a lead from `/`.
2. Confirm a document appears in the Firestore `leads` collection.
3. Sign in at `/login`.
4. Confirm the lead appears in `/admin`.
5. Change its status and refresh.
6. Confirm the status remains changed in both the dashboard and Firestore.
7. Sign out and confirm `/admin` redirects to `/login`.
