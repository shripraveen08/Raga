# Raga - Deployment Guide

## 📱 Distribution Options

### 1. Desktop App (GitHub Releases)

**Automatic Releases:**
```bash
# Create a new tag to trigger release
git tag v1.0.0
git push origin v1.0.0
```

**Manual Release:**
```bash
# Build for all platforms
npm run package

# Build for specific platform
npm run package:mac    # macOS
npm run package:win    # Windows  
npm run package:linux  # Linux
```

**Release files will be in `release/` directory:**
- `Raga-1.0.0.dmg` (macOS)
- `Raga Setup 1.0.0.exe` (Windows)
- `Raga-1.0.0.AppImage` (Linux)
- `raga_1.0.0_amd64.deb` (Linux)

### 2. Android APK

**Prerequisites:**
- Android Studio installed
- Android SDK configured

**Build APK:**
```bash
# Build and sync web assets
npm run android:build

# Open Android Studio
npm run android:open

# Or build APK directly
cd android
./gradlew assembleDebug
```

**APK Location:**
`android/app/build/outputs/apk/debug/app-debug.apk`

**Install on Device:**
```bash
# Install via ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or run directly
npm run android:run
```

## 🚀 GitHub Actions

The project includes automated builds via GitHub Actions:

1. **Tag a release:** `git tag v1.0.0 && git push origin v1.0.0`
2. **Automatic builds:** Desktop apps for all platforms + Android APK
3. **Download:** Releases appear in GitHub Releases tab

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
