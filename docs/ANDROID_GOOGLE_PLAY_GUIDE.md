# Android Standalone Game & Google Play Store Guide

This document outlines the architecture, workflow, and release procedure for building and publishing **Mzansi Midnight** as a **100% standalone, offline native Android game** using Capacitor.

---

## 1. Standalone Architecture (Zero Web Server Dependency)

Unlike a Progressive Web App (PWA) or hybrid web wrapper that streams assets from a remote server, **Mzansi Midnight** is fully compiled into the Android APK / Android App Bundle (`.aab`):

1. **Static Export**: Next.js exports the entire React client app into static HTML, JavaScript, and CSS bundles (`out/`) via `output: 'export'`.
2. **Local Asset Bundling**: During `npm run cap:sync`, Capacitor synchronizes the contents of `out/` into `android/app/src/main/assets/public/`.
3. **Internal WebView Protocol**: The app serves assets from the device's local internal storage using the secure `https://localhost` scheme.
4. **Complete Offline Autonomy**: All 40 district node banners, 5 regional tactical maps, 20 origin and ending backgrounds, 38 character avatars, and procedural Web Audio soundscapes exist on the phone. The game requires **no internet connection** to play.
5. **Native Device Hardware Integration**:
   - **Hardware Back Button**: Handled cleanly in [`engine/nativeBridge.ts`](file:///c:/Users/Faiz/Documents/workspaces/mzansi-midnight/engine/nativeBridge.ts) (closes modals, clears active dice, or confirms exit).
   - **Status Bar**: Automatically styled to match the dark noir aesthetic (`#020617`).
   - **Splash Screen**: Seamless native launch screen that auto-hides once the React engine mounts.
   - **Haptics**: Tactile rumble feedback on dice rolls, threat alarms, and critical events.

---

## 2. Quick Command Reference

| Command | Purpose |
| :--- | :--- |
| `npm run cap:sync` | Builds Next.js static export and syncs assets & plugins with Android. |
| `npm run cap:open` | Opens the native project in Android Studio. |
| `npm run cap:build` | Syncs and compiles a standalone Debug APK (`app-debug.apk`). |
| `npm run cap:bundle` | Syncs and compiles a Google Play Release App Bundle (`.aab`). |

---

## 3. Installing on an Android Device or Emulator

### Method A: Install the Debug APK Directly (Fastest)

1. Connect your Android device via USB and enable **USB Debugging** in Developer Options (or start an Android Virtual Device emulator in Android Studio).
2. Run:
   ```bash
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```
3. Alternatively, copy `android/app/build/outputs/apk/debug/app-debug.apk` directly to your phone and tap to install.

### Method B: Run via Android Studio

1. Run `npm run cap:open` to launch the project in Android Studio.
2. Select your connected device or emulator from the top toolbar.
3. Click the green **Run (▶)** button.

---

## 4. Google Play Store Release Preparation

### Step 1: Create a Release Keystore

To sign the app for Google Play, generate an upload key using the Java `keytool` (included with your Android Studio installation):

```bash
keytool -genkey -v -keystore mzansi-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mzansi-key
```

Keep `mzansi-release-key.jks` and your password safe and backed up. **Do not commit this file to public git repositories.**

### Step 2: Configure Signing in `android/app/build.gradle`

In `android/app/build.gradle`, add your signing configuration:

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file("path/to/mzansi-release-key.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias "mzansi-key"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Build the Android App Bundle (`.aab`)

Google Play requires the **Android App Bundle (`.aab`)** format for new applications:

```bash
npm run cap:bundle
```

The resulting bundle will be generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 5. Google Play Console Listing Checklist

1. **App Identity**:
   - **App Name**: Mzansi Midnight
   - **Short Description**: A Dice-and-Node Noir RPG set in a captured South African metropolis.
   - **Package ID**: `za.co.mzansimidnight.app`
2. **Store Assets**:
   - **App Icon**: 512×512 px PNG (32-bit color).
   - **Feature Graphic**: 1024×500 px PNG/JPEG.
   - **Screenshots**: At least 4 phone screenshots (16:9 or 18:9 aspect ratio) showcasing the Tactical District Map, Red-String Conspiracy Board, Dice Assignment Drawer, and Contact Interrogations.
3. **Content Rating**:
   - Complete the IARC questionnaire in Google Play Console (rated for Mild Crime Themes / Violence).
4. **Target Audience & Target SDK**:
   - Target SDK: 36 (exceeds Google Play's minimum requirement of API 34).
   - Category: Games > Role-Playing / Strategy.
5. **Privacy Policy & POPIA Compliance (Mandatory for Google Play)**:
   - **Privacy Policy URL**: `https://<your-domain>/privacy` (hosted at your production domain from `app/privacy/page.tsx`).
   - **In-App Disclosure**: Accessible in-game via the title screen footer, the Settings Modal (`05 // Privacy & POPIA Compliance`), and the User Profile modal.
   - **Data Disclosures**: Details local offline storage (`localStorage`), optional Google OAuth & Supabase cloud backup, public leaderboard scoreboards, and zero third-party advertising or trackers.
   - **Account Deletion URL / Instructions**: Users can purge all local data in-app or request cloud account/profile erasure by emailing `seitznsounds@gmail.com` in terms of POPIA Section 24 and GDPR Article 17.

---

## 6. Google Play Closed Testing & "Visita Testers" Workflow

### Mandatory Google Play Policy Requirement
Under Google Play's developer policy, **all new personal developer accounts are required to run a closed test before applying for public production release**:
- **Requirement**: Minimum of **20 testers** opted into your closed test track.
- **Duration**: Testers must remain continuously opted in for at least **14 consecutive days**.
- **Crucial Warning**: Anyone attempting to access the direct Google Play Store URL (`https://play.google.com/store/apps/details?id=za.co.mzansimidnight.app&hl=en`) **without being on the authorized testers list will receive an "Item not found" or "Requested URL not found" error**.

### In-App Tester Enrollment
The game features a native in-app onboarding modal (`components/GooglePlayTesterModal.tsx`) accessible directly from the Title Screen banner, Main Menu, and System Settings:
1. **User Notification**: Explicitly informs the user of Google's closed testing policy and why the Play Store link is restricted.
2. **Email Capture**: Prompts the user for their Google Play account email (pre-filled if authenticated via Google OAuth).
3. **Visita Testers List**: Automatically enrolls the operative into the **Visita Testers** list.
4. **Key Authorization**: Uses `GOOGLE_PLAY_STORE_API_KEY` for verification across the developer pipeline.
5. **Dual Persistence**: Saves locally in `localStorage` (`mzansi_midnight_play_tester_v1`) and syncs to Supabase (`public.mzansi_play_testers`).

### Links & Synchronization Tooling
- **Play Store App URL**: `https://play.google.com/store/apps/details?id=za.co.mzansimidnight.app&hl=en`
- **Web Testing Opt-In URL**: `https://play.google.com/apps/testing/za.co.mzansimidnight.app`
- **Supabase SQL Schema**: `supabase/testers_schema.sql`
- **Tester Sync CLI Utility**:
  ```bash
  node scripts/sync-play-testers.mjs
  # Or export CSV to upload directly to Google Play Console:
  node scripts/sync-play-testers.mjs --csv
  ```
