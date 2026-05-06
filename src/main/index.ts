import { app, shell, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import { searchYouTube, getStreamUrl, getVideoInfo, parseYouTubeUrl, isValidYouTubeUrl, getVideoFromUrl } from './youtube'
import { initDB, dbOps } from './db'
import { is, optimizer } from '@electron-toolkit/utils'

const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: false,          // custom titlebar
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f13',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const isDev = !app.isPackaged

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
app.setAppUserModelId('com.raga.musicplayer')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  nativeTheme.themeSource = 'dark'

  initDB()
  registerIpcHandlers()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Auto-updater (only in production)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ─── IPC Handlers ────────────────────────────────────────────────────────────

function registerIpcHandlers() {
  // Window controls
  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
  })
  ipcMain.on('window:close', () => mainWindow?.close())

  // YouTube
  ipcMain.handle('yt:search', async (_, query: string) => {
    return searchYouTube(query)
  })

  ipcMain.handle('yt:stream-url', async (_, videoId: string) => {
    return getStreamUrl(videoId)
  })

  ipcMain.handle('yt:video-info', async (_, videoId: string) => {
    return getVideoInfo(videoId)
  })

  ipcMain.handle('yt:parse-url', async (_, url: string) => {
    return parseYouTubeUrl(url)
  })

  ipcMain.handle('yt:validate-url', async (_, url: string) => {
    return isValidYouTubeUrl(url)
  })

  ipcMain.handle('yt:video-from-url', async (_, url: string) => {
    return getVideoFromUrl(url)
  })

  // Playlists
  ipcMain.handle('db:playlists:get-all', () => dbOps.getAllPlaylists())
  ipcMain.handle('db:playlists:create', (_, name: string) => dbOps.createPlaylist(name))
  ipcMain.handle('db:playlists:delete', (_, id: string) => dbOps.deletePlaylist(id))
  ipcMain.handle('db:playlists:get-tracks', (_, id: string) => dbOps.getPlaylistTracks(id))
  ipcMain.handle('db:playlists:add-track', (_, playlistId: string, track: any) =>
    dbOps.addTrackToPlaylist(playlistId, track)
  )
  ipcMain.handle('db:playlists:remove-track', (_, playlistId: string, videoId: string) =>
    dbOps.removeTrackFromPlaylist(playlistId, videoId)
  )

  // History
  ipcMain.handle('db:history:get', () => dbOps.getHistory())
  ipcMain.handle('db:history:add', (_, track: any) => dbOps.addToHistory(track))
  ipcMain.handle('db:history:clear', () => dbOps.clearHistory())

  // Auto-updater events
  autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('updater:update-available')
  })
  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('updater:update-downloaded')
  })
  ipcMain.on('updater:install', () => {
    autoUpdater.quitAndInstall()
  })
}
