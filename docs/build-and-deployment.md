# Build & Deployment Guide

This guide covers building, testing, and deploying Ovulate across web, Windows desktop, and Android mobile environments using **Vite**, **pnpm**, and **Tauri v2**.

---

## 1. Development Prerequisites

- **Node.js**: `v22.x` or newer (or as managed by `pnpm/setup`)
- **pnpm**: `v11.x`
- **Rust Toolchain**: `stable` (installed via [rustup.rs](https://rustup.rs/))
- **Windows Build Tools** (for Windows desktop target): Visual Studio C++ Build Tools
- **Android Studio / SDK** (for Android target): SDK Platform 34+, Android NDK `27.0.11902837`, and `cargo-ndk`

---

## 2. Web Development & Testing

### Commands
```bash
# Install dependencies
pnpm install

# Start local Vite development server (hot module replacement)
pnpm dev

# Type check and build frontend production assets into /dist
pnpm build

# Preview production build locally
pnpm preview
```

---

## 3. Windows Desktop Build (Tauri v2)

Tauri v2 produces both an **NSIS installer (`.exe`)** and a **Windows Installer (`.msi`)**, along with delta update manifests for the auto-updater plugin.

### Run Desktop App Locally
```bash
pnpm tauri dev
```

### Build Production Desktop Binaries
```bash
pnpm tauri build
```
Compiled installers are output to:
`src-tauri/target/release/bundle/nsis/` and `src-tauri/target/release/bundle/msi/`.

### Desktop Auto-Updater Keys
The desktop build uses Minisign signing keys configured in `src-tauri/tauri.conf.json`:
- Public Key: Embedded in `plugins.updater.pubkey`.
- Endpoints: Points to `https://github.com/carlodandan/ovulate/releases/latest/download/latest.json`.

---

## 4. Android Mobile Build (Tauri v2)

### 4.1 Android Prerequisites Setup
1. **Install Android Rust Targets**:
   ```bash
   rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
   ```
2. **Install cargo-ndk**:
   ```bash
   cargo install cargo-ndk
   ```
3. **Configure Environment Variables**:
   ```bash
   export ANDROID_HOME="$HOME/AppData/Local/Android/Sdk" # or path to Android SDK
   export NDK_HOME="$ANDROID_HOME/ndk/27.0.11902837"
   ```

### 4.2 Initialize & Build Android Project
- **Initialize Gradle Project**:
  ```bash
  pnpm tauri android init
  ```
  *(Creates the native Android project structure in `src-tauri/gen/android`)*

- **Generate Platform Icons**:
  ```bash
  pnpm tauri icon logos/ovulate@Android.png
  ```

- **Run on Android Emulator or Physical Device**:
  ```bash
  pnpm tauri android dev
  ```

- **Build Production Release APK**:
  ```bash
  pnpm tauri android build --apk
  ```
  The unsigned APK is output to:
  `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`.

---

## 5. Automated CI/CD Pipeline (`.github/workflows/build.yml`)

The repository includes a multi-platform GitHub Actions workflow triggered on push to `main` (when `package.json` updates) or manual `workflow_dispatch`.

```mermaid
flowchart TD
    Trigger["Push to main (package.json) / workflow_dispatch"]
    
    subgraph Job: build-windows [Runner: windows-2025]
        W1["Setup Node 22 & pnpm 11"]
        W2["Setup Rust stable"]
        W3["pnpm tauri icon logos/ovulate@Windows.png"]
        W4["tauri-apps/tauri-action@v0"]
        W5["Publish Windows Release (.exe, .msi, latest.json)"]
        W1 --> W2 --> W3 --> W4 --> W5
    end

    subgraph Job: build-android [Runner: ubuntu-latest]
        A1["Setup Java 17 (Temurin) & Android SDK"]
        A2["Install NDK 27.0.11902837"]
        A3["Setup Rust Android Targets & cargo-ndk"]
        A4["pnpm tauri android init & icon logos/ovulate@Android.png"]
        A5["pnpm tauri android build --apk"]
        A6["zipalign & apksigner with ANDROID_KEY_BASE64"]
        A7["softprops/action-gh-release@v3 uploads Ovulate-v*.apk"]
        A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7
    end

    Trigger --> Job: build-windows
    Trigger --> Job: build-android
```

### Required Secrets in GitHub Repository
- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- `ANDROID_KEY_BASE64`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_STORE_PASSWORD`
- `GH_TOKEN`
