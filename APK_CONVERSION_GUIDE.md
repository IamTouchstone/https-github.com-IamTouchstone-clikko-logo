# Clikko APK Packaging & Bolt.new Backend Guide 📱⚡

This guide provides clean, step-by-step instructions to run Clikko with its robust Express backend on **Bolt.new** and compile the frontend into a highly responsive, native **Android APK** using **Capacitor**.

---

## Part 1: How Clikko Frontend & Backend Interact ⚙️
Clikko uses a hybrid, high-reliability **Offline-First Synchronization** strategy. This ensures that the app functions incredibly fast even when offline, while syncing with the server whenever a network is active:

1. **Local States (Offline Support):** When a user triggers timers, records work shifts, or adds category items, all actions are immediately saved to native `localStorage` on the phone/browser. This means the app never crashes or lags if the server is offline.
2. **Central Sync Database (`clikko_db.json`):** Your Express backend maintains a lightweight local database file (`clikko_db.json`) on the server.
3. **Synchronicity Actions:**
   - **Auth Check:** On user logins or organization registrations, the frontend sends a `POST /api/auth/login` request to verify organizational credentials (SuperAdmin, SubAdmin, Staff).
   - **Records Syncing:** The app can automatically push local time entries to `POST /api/sync/entries` and save them securely on the cloud backup.

---

## Part 2: Running on Bolt.new ⚡
The backend code written in `./server.ts` is **fully compatible** with the Bolt.new engine! 
To start developing or run it on Bolt.new, use the standard scripts defined in `package.json`:

```bash
# 1. Install all dependencies
npm install

# 2. Run the Full-stack Dev Server (boots both backend API & Vite frontend)
npm run dev

# 3. Build & Bundled Server CJS
npm run build
```

---

## Part 3: Compiling Clikko to a Mobile APK 🤖
We use **Capacitor**, the modern, official web-to-native wrapping technology by Ionic. It takes the built React static files (`dist/`) and bundles them directly into a native Android WebView app ready for release.

### Step 1: Install Capacitor CLI
In your local workspace terminal, install the package wrappers:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Initialize Capacitor
Initialize Capacitor with your App configuration. Ensure you set the `web-dir` as `dist` (where Vite places compiled files):
```bash
npx cap init Clikko com.yourcompany.clikko --web-dir=dist
```

### Step 3: Build & Synchronize Frontend
Compile the React App to produce static browser assets, and sync them to the Capacitor Android project container:
```bash
# Build the production files
npm run build

# Add Android Platform
npx cap add android

# Sync built assets into the native Android folder
npx cap sync
```

### Step 4: Open in Android Studio & Export APK
Launch your native Android container project inside **Android Studio**:
```bash
npx cap open android
```

1. Wait for Android Studio to index the project.
2. In the top toolbar, go to: **Build** ➜ **Build Bundle(s) / APK(s)** ➜ **Build APK(s)**.
3. Android Studio will instantly compile your code into a installable **`app-debug.apk`**!
4. Click the popup notification **"locate"** to grab your physical APK file and send it straight to any Android device!

---

## Part 4: Why this is APK-Compatible 💡
* **Perfect Proportions:** Visual designs are built with responsive Tailwind grids, keeping font scaling, touch targets, and headers beautiful on mobile screens.
* **Storage Reliability:** Uses persistent local storage which preserves database sessions inside the device's native WebView sandbox automatically.
* **No Broken APIs:** Completely avoids non-iframe-friendly APIs like `window.alert` or `window.open` which can break on mobile devices.
