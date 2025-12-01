# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Start in "Test mode" (for development) or set up security rules
4. Choose a location for your database

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click on the Web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

## Step 4: Update Firebase Configuration

Open `src/config/firebase.js` and replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
}
```

## Step 5: Set Up Firestore Security Rules (Optional but Recommended)

In Firebase Console > Firestore Database > Rules, you can set up rules like:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /kameetiGroups/{groupId} {
      allow read, write: if request.auth != null;
      
      match /members/{memberId} {
        allow read, write: if request.auth != null;
      }
      
      match /monthlyCalculations/{calcId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

For development/testing, you can use:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** The permissive rules above are only for development. For production, implement proper authentication and security rules.

## Step 6: Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

