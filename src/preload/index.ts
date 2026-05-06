import { contextBridge, ipcRenderer } from 'electron'

// Type-safe bridge exposed to the renderer as window.raga
const api = {
  // ─── Window controls ───────────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close:    () => ipcRenderer.send('window:close'),
  },

  // ─── YouTube ───────────────────────────────────────────────────────────────
  youtube: {
    search:       (query: string)    => ipcRenderer.invoke('yt:search', query),
    streamUrl:    (videoId: string)  => ipcRenderer.invoke('yt:stream-url', videoId),
    videoInfo:    (videoId: string)  => ipcRenderer.invoke('yt:video-info', videoId),
    parseUrl:     (url: string)      => ipcRenderer.invoke('yt:parse-url', url),
    validateUrl:  (url: string)      => ipcRenderer.invoke('yt:validate-url', url),
    videoFromUrl: (url: string)      => ipcRenderer.invoke('yt:video-from-url', url),
  },

  // ─── Playlists ─────────────────────────────────────────────────────────────
  playlists: {
    getAll:      ()                             => ipcRenderer.invoke('db:playlists:get-all'),
    create:      (name: string)                 => ipcRenderer.invoke('db:playlists:create', name),
    delete:      (id: string)                   => ipcRenderer.invoke('db:playlists:delete', id),
    getTracks:   (id: string)                   => ipcRenderer.invoke('db:playlists:get-tracks', id),
    addTrack:    (playlistId: string, track: any) => ipcRenderer.invoke('db:playlists:add-track', playlistId, track),
    removeTrack: (playlistId: string, videoId: string) => ipcRenderer.invoke('db:playlists:remove-track', playlistId, videoId),
  },

  // ─── History ───────────────────────────────────────────────────────────────
  history: {
    get:   ()          => ipcRenderer.invoke('db:history:get'),
    add:   (track: any) => ipcRenderer.invoke('db:history:add', track),
    clear: ()          => ipcRenderer.invoke('db:history:clear'),
  },

  // ─── Updater events ────────────────────────────────────────────────────────
  updater: {
    onUpdateAvailable: (cb: () => void) => ipcRenderer.on('updater:update-available', cb),
    onUpdateDownloaded: (cb: () => void) => ipcRenderer.on('updater:update-downloaded', cb),
    install: () => ipcRenderer.send('updater:install'),
  },
}

contextBridge.exposeInMainWorld('raga', api)

// Export type so renderer has full type safety via declare
export type RagaAPI = typeof api
