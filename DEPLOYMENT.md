# Raga - Deployment Guide (OuterTune Style)

## 📱 GitHub APK Distribution (Like OuterTune)

### 🚀 Automatic APK Releases

**Just like OuterTune, create a tag to auto-release:**
```bash
# Create version tag (triggers GitHub Actions)
git tag v1.0.0
git push origin v1.0.0
```

**What happens automatically:**
1. ✅ GitHub Actions builds APK (Debug + Release)
2. ✅ Creates GitHub Release with APK files
3. ✅ Uploads artifacts for download
4. ✅ Generates release notes automatically

### 📥 Download APK from GitHub

**Method 1: Releases Tab (Recommended)**
1. Go to your repository → **Releases**
2. Click on latest release (e.g., v1.0.0)
3. Download:
   - `app-debug.apk` (For testing)
   - `app-release.apk` (Signed, for distribution)

**Method 2: Actions Artifacts**
1. Go to **Actions** tab → Workflow runs
2. Click on latest run
3. Download `raga-debug-apk` or `raga-release-apk`

### 🔧 Manual APK Build

**For development/testing:**
```bash
# Build web app + sync to Android
npm run android:build

# Build APK locally
cd android
./gradlew assembleDebug    # Debug APK
./gradlew assembleRelease  # Release APK (needs signing)
```

**APK Location:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### 📱 Install on Android Device

**Option 1: ADB Install**
```bash
# Enable USB debugging on Android device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Option 2: Direct Install**
```bash
# Run directly on connected device
npm run android:run
```

**Option 3: GitHub Download**
1. Download APK from GitHub Releases
2. Transfer to Android device
3. Install (Allow unknown sources)

## �️ Desktop App Distribution

**Automatic Releases (Same as Android):**
```bash
# Tag triggers both desktop + Android builds
git tag v1.0.0
git push origin v1.0.0
```

**Manual Desktop Build:**
```bash
# Build for current platform
npm run package

# Platform-specific builds
npm run package:mac    # macOS (.dmg, .zip)
npm run package:win    # Windows (.exe, portable)
npm run package:linux  # Linux (.AppImage, .deb)
```

**Desktop Release Files:**
- `Raga-1.0.0.dmg` (macOS)
- `Raga Setup 1.0.0.exe` (Windows)
- `Raga-1.0.0.AppImage` (Linux)
- `raga_1.0.0_amd64.deb` (Linux)

## 🚀 GitHub Actions (OuterTune Style)

**Professional CI/CD Pipeline:**
- **Triggers**: Version tags (`v*`), pull requests, manual
- **Builds**: Android APK (Debug + Release) + Desktop apps
- **Releases**: Automatic GitHub releases with proper assets
- **Artifacts**: Available for download from Actions tab

**Workflow Features:**
- ✅ Java 17 + Android SDK setup
- ✅ Node.js caching for faster builds
- ✅ Gradle build optimization
- ✅ Automatic version synchronization
- ✅ Release APK signing (with secrets)
- ✅ Professional release notes generation

## 📋 Distribution Checklist

### For Desktop Release:
- [ ] Update version in `package.json`
- [ ] Test on all platforms
- [ ] Create git tag
- [ ] GitHub Actions builds automatically
- [ ] Download from Releases tab

### For Android Release:
- [ ] Test APK on Android device
- [ ] Check YouTube functionality works
- [ ] Verify audio playback
- [ ] Upload APK to GitHub Releases or app store

## 🔧 Manual Build Commands

```bash
# Desktop
npm run build && npm run package

# Android
npm run android:build
cd android && ./gradlew assembleDebug

# Clean builds
npm run build && rm -rf release/ && npm run package
```

## 📁 File Structure

```
Raga/
├── release/           # Desktop installers
├── android/           # Android project
│   └── app/build/outputs/apk/debug/
└── dist/             # Built web assets
```

## 🌐 Publishing to Google Play (Optional)

For Google Play Store distribution:

1. **Generate signing key:**
   ```bash
   keytool -genkey -v -keystore raga-release.keystore -alias raga -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing in `android/app/build.gradle`**

3. **Build signed APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **Upload to Google Play Console**

## ⚠️ Notes

- Desktop app uses Electron (Windows, macOS, Linux)
- Android app uses Capacitor wrapper around web app
- YouTube functionality requires internet connection
- Android version has limited offline capabilities compared to desktop
