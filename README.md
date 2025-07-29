# Unity Valiyangadi - Family Tree Platform

Welcome to the Unity Valiyangadi Family Tree project! This is a modern, full-stack web application designed to be a digital home for our family's history, stories, and connections. It provides an interactive and secure platform for family members to explore their heritage and for administrators to manage the family data.

## ✨ Features

-   **Interactive Family Tree:** A beautifully rendered, zoomable, and pannable family tree that visualizes generations of family connections.
-   **Comprehensive Member Directory:** A searchable directory of all family members. Each member has a detailed profile card displaying their information.
-   **Secure Authentication:** Users can sign up and log in securely using their phone number for OTP verification, followed by a standard username and password setup.
-   **Role-Based Access Control:**
    -   **Admin:** Can directly add, edit, and delete family members, manage user-submitted change requests, and upload family magazines.
    -   **Member:** Can view the family tree and directory, and submit requests to add, edit, or delete members.
-   **Admin Dashboard:** A dedicated dashboard for administrators to review and approve or reject change requests submitted by members, ensuring data accuracy and integrity.
-   **Digital Magazine Archive:** Admins can upload PDF versions of family magazines, which can be read online through an elegant flipbook interface.
-   **Admin Notifications:** The system is configured to send WhatsApp notifications to an administrator for key events, such as new user sign-ups and submitted change requests (requires Twilio setup).
-   **Responsive Design:** The application is fully responsive and accessible on desktops, tablets, and mobile devices.

## 🛠️ Tech Stack & Tools

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **UI:** [React](https://reactjs.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Component Library:** [ShadCN UI](https://ui.shadcn.com/)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Firebase Authentication, Cloud Storage)
-   **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
-   **Notifications:** [Twilio](https://www.twilio.com/) (for WhatsApp)
-   **Deployment:** [Firebase Hosting](https://firebase.google.com/docs/hosting)

## 🚀 Getting Started

### 1. Prerequisites

-   Node.js (v18 or later)
-   An active Firebase project
-   A Twilio account with a WhatsApp-enabled number (optional, for notifications)

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <your-repo-url>
cd <repo-name>
npm install
```

### 3. Firebase Project Setup & Environment Variables

This is the most critical step. Your app needs credentials to connect to Firebase.

**First, create a `.env.local` file in the root of the project.** This file will store your secret keys and configuration. Add the following variables to it.

#### a. Client-Side (Public) Keys
In your Firebase project, go to **Project Settings** > **Your apps**. Select your web app and find the Firebase SDK snippet. Copy the configuration object and add it to your `.env.local` file:

```env
# Found in your Firebase project web app settings
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
```

#### b. Server-Side (Admin) Key (CRUCIAL FOR SERVER FUNCTIONALITY)
This key allows your server to access the database and perform admin actions. **Without this, you will see server errors.** Note that Firebase Hosting restricts variable names starting with `FIREBASE_`, so we use `SERVICE_ACCOUNT_JSON`.

1.  In **Project Settings** > **Service accounts**, click **Generate new private key**.
2.  This will download a JSON file. Open it.
3.  Copy the **entire JSON content** and paste it into your `.env.local` file as a single line, like this:

```env
# The full JSON content from the downloaded service account file
SERVICE_ACCOUNT_JSON={"type": "service_account", "project_id": ...}
```

#### c. Admin Phone Number
This number will be automatically granted admin privileges upon sign-up. Use E.164 format (e.g., `+11234567890`).

```env
ADMIN_PHONE_NUMBER=+11234567890
```

### 4. Twilio Configuration (Optional)

Add your Twilio credentials to receive WhatsApp notifications.

```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM_NUMBER=+14155238886 # Your Twilio WhatsApp number
ADMIN_WHATSAPP_TO_NUMBER=+11234567890 # Your personal WhatsApp number
```

### 5. Run the Development Server

Start the application:

```bash
npm run dev
```

The app will be available at `http://localhost:9002`.

## ☁️ Deployment: Making Changes Live

Any changes you make in the editor are saved locally. To make them appear on your live website, you need to deploy the application to Firebase Hosting.

### 1. Install Firebase CLI (One-Time Setup)

If you don't have it installed globally, open a terminal and run:
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase (One-Time Setup)

Authenticate with your Firebase account:
```bash
firebase login
```

### 3. Deploy Your App

From the root of your project directory in the terminal, run the deploy command:
```bash
firebase deploy
```
This command will automatically build your Next.js application, package it, and upload it to Firebase Hosting. Once it's finished, your changes will be live.

### 4. Custom Domain Setup

To use a custom domain (e.g., `www.yourfamilyname.com`), follow these steps after your first deployment:

1.  **Add Custom Domain to Hosting:** In the **Hosting** section of the Firebase Console, add your custom domain and follow the instructions to set up the necessary DNS records.
2.  **Authorize Domain for Authentication:** This is a critical security step. Go to the **Authentication** section > **Settings** tab > **Authorized domains**. Click **Add domain** and enter your custom domain name.

## 🔒 Security Model

The application is built with security as a priority:

-   **Firestore & Storage Security Rules:** Robust rules are in place (`firestore.rules`, `storage.rules`) to protect your data. Unauthenticated users have no access. Authenticated "members" can only create change requests. Only "admins" can directly modify or delete data.
-   **Server-Side Operations:** All database mutations are handled through Next.js Server Actions, ensuring sensitive logic never runs on the client.
-   **Secure Authentication:** Session management uses secure, HTTP-only session cookies. Phone verification prevents unauthorized sign-ups.
-   **Environment Variables:** All sensitive keys (Firebase Admin SDK, Twilio) are stored securely in environment variables and are not exposed to the client.
