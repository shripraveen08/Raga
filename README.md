# Raga 🎵
A cross-platform YouTube music player built with Electron + React + TypeScript.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start in development mode
npm run dev

# 3. The app will open automatically
```

> **Note:** The first launch may take a moment as ytdl-core fetches stream metadata.

---

## Project Structure

```
raga/
├── src/
│   ├── main/               ← Electron main process (Node.js)
│   │   ├── index.ts        ← App entry, IPC registration, window creation
│   │   ├── youtube.ts      ← YouTube search + stream URL resolver
│   │   └── db.ts           ← SQLite operations (playlists, history)
│   ├── preload/
│   │   └── index.ts        ← contextBridge — safe API bridge to renderer
│   └── renderer/
│       └── src/
│           ├── App.tsx             ← Root layout
│           ├── main.tsx            ← React entry point
│           ├── types/index.ts      ← Shared TypeScript types
│           ├── store/
│           │   ├── playerStore.ts  ← Zustand: audio state, Howler.js
│           │   └── uiStore.ts      ← Zustand: view, playlists, search
│           ├── components/
│           │   ├── layout/         ← Titlebar, Sidebar
│           │   ├── player/         ← PlayerBar (controls, scrubber, volume)
│           │   ├── search/         ← SearchView + TrackList
│           │   └── library/        ← LibraryView, PlaylistView, HistoryView
│           └── styles/globals.css
├── resources/              ← App icons (.ico, .icns, .png)
├── electron.vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## Building & Packaging

### Development build
```bash
npm run build
```

### Package for your current OS
```bash
npm run package
```

### Package for specific OS
```bash
npm run package:win    # → release/Raga Setup.exe + portable
npm run package:mac    # → release/Raga.dmg + .zip
npm run package:linux  # → release/Raga.AppImage + .deb
```

Output files are in the `release/` folder.

---

## Auto-Updates

Raga uses `electron-updater` with GitHub Releases as the update server.

**Setup:**
1. Create a GitHub repository for Raga
2. In `package.json` → `build.publish`, set your `owner` and `repo`
3. Generate a GitHub personal access token with `repo` scope
4. Set it as `GH_TOKEN` environment variable when publishing:
   ```bash
   GH_TOKEN=your_token npm run package
   ```
5. Create a GitHub Release and attach the build artifacts
6. On next app launch, users are automatically notified of updates

The renderer listens for `updater:update-available` and `updater:update-downloaded` events via `window.raga.updater` — add a toast/banner component to show these to users.

---

## Android APK (Capacitor)

To extend Raga into an Android app:

### 1. Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init Raga com.raga.musicplayer --web-dir dist/renderer
```

### 2. Build the web output
```bash
npm run build
```

### 3. Add Android platform
```bash
npx cap add android
npx cap sync
```

### 4. Open in Android Studio
```bash
npx cap open android
```

### 5. Key differences for Android

| Feature         | Electron approach         | Capacitor approach              |
|----------------|---------------------------|----------------------------------|
| Audio streaming | Howler.js via HTTP        | Same — WebView plays URLs        |
| File system     | Node.js `fs`              | `@capacitor/filesystem` plugin   |
| SQLite          | better-sqlite3            | `@capacitor-community/sqlite`    |
| Background play | OS handles it             | Foreground service (Kotlin)      |
| IPC             | contextBridge             | Capacitor plugin bridge          |

### 6. Background audio plugin (critical for Android)
The WebView stops audio when backgrounded. You need a small native Android foreground service:
```bash
npm install @capacitor-community/background-runner
```
Or write a custom Capacitor plugin that wraps an Android `MediaSessionService`.

---

## Feature Implementation Roadmap

### Next features to build

#### 1. Mini player / picture-in-picture
Add a collapsed player view that shows when you minimize the sidebar. Track `collapsed` state in `uiStore`.

#### 2. Keyboard shortcuts
Register global shortcuts in `src/main/index.ts`:
```typescript
import { globalShortcut } from 'electron'

app.whenReady().then(() => {
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow?.webContents.send('shortcut:playpause')
  })
  globalShortcut.register('MediaNextTrack', () => {
    mainWindow?.webContents.send('shortcut:next')
  })
})
```
Listen in the renderer via `ipcRenderer.on('shortcut:playpause', ...)`.

#### 3. System tray
```typescript
import { Tray, Menu, nativeImage } from 'electron'

const tray = new Tray(nativeImage.createFromPath('resources/icon.png'))
tray.setContextMenu(Menu.buildFromTemplate([
  { label: 'Play/Pause', click: () => mainWindow?.webContents.send('shortcut:playpause') },
  { label: 'Quit',       click: () => app.quit() }
]))
```

#### 4. Audio normalization
In `playerStore.ts`, after creating a Howl, get its `WebAudio` node and apply a `DynamicsCompressorNode`:
```typescript
const ctx = Howler.ctx
const compressor = ctx.createDynamicsCompressor()
compressor.threshold.value = -24
compressor.ratio.value = 4
compressor.connect(ctx.destination)
```

#### 5. Offline downloads
In main process, use `ytdl.downloadFromInfo()` to pipe the stream to a file in `app.getPath('userData')`. Store download state in SQLite. In the renderer, check if a local file exists and pass `file://` URL to Howler instead.

#### 6. Lyrics
Use the [lrclib.net](https://lrclib.net) public API (no key needed) to fetch synchronized LRC lyrics by track title + artist. Parse the timestamps and render them in a scrolling lyrics panel.

#### 7. Discord Rich Presence
```bash
npm install discord-rpc
```
In main process, connect to Discord RPC and call `setActivity()` with the current track name whenever a song changes.

---

## Troubleshooting

**`ytdl-core` stream URL errors** — YouTube occasionally changes their internal API. Run:
```bash
npm install ytdl-core@latest
```

**App won't open on macOS** — You need to codesign for distribution. For local development, right-click → Open in Finder.

**`better-sqlite3` native module errors** — Run:
```bash
npx electron-rebuild -f -w better-sqlite3
```

**Audio doesn't play on Linux** — Install `libffmpeg.so`:
```bash
sudo apt install libavcodec-extra
```

---

## Tech Stack

| Layer      | Technology                          |
|-----------|-------------------------------------|
| Shell      | Electron 29                        |
| Frontend   | React 18 + TypeScript              |
| Build      | electron-vite + Vite 5             |
| Styling    | Tailwind CSS                        |
| State      | Zustand                             |
| Audio      | Howler.js (HTML5 Audio / Web Audio) |
| YouTube    | ytdl-core + youtube-sr             |
| Database   | better-sqlite3 (SQLite)            |
| Packaging  | electron-builder                   |
| Updates    | electron-updater + GitHub Releases |
