import { create } from 'zustand'
import type { Playlist, Track, View } from '../types'

interface UIState {
  view: View
  playlists: Playlist[]
  activePlaylistId: string | null
  activePlaylistTracks: Track[]
  history: Track[]
  searchResults: Track[]
  searchQuery: string
  searching: boolean

  setView: (v: View) => void
  setSearchQuery: (q: string) => void
  setSearchResults: (results: Track[]) => void
  setSearching: (b: boolean) => void

  loadPlaylists: () => Promise<void>
  createPlaylist: (name: string) => Promise<void>
  deletePlaylist: (id: string) => Promise<void>
  openPlaylist: (id: string) => Promise<void>
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>
  removeTrackFromPlaylist: (playlistId: string, videoId: string) => Promise<void>

  loadHistory: () => Promise<void>
}

export const useUIStore = create<UIState>((set, get) => ({
  view: 'search',
  playlists: [],
  activePlaylistId: null,
  activePlaylistTracks: [],
  history: [],
  searchResults: [],
  searchQuery: '',
  searching: false,

  setView: (view) => set({ view }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearching: (searching) => set({ searching }),

  loadPlaylists: async () => {
    const playlists = await window.raga.playlists.getAll()
    set({ playlists })
  },

  createPlaylist: async (name) => {
    await window.raga.playlists.create(name)
    await get().loadPlaylists()
  },

  deletePlaylist: async (id) => {
    await window.raga.playlists.delete(id)
    if (get().activePlaylistId === id) set({ activePlaylistId: null, activePlaylistTracks: [] })
    await get().loadPlaylists()
  },

  openPlaylist: async (id) => {
    const tracks = await window.raga.playlists.getTracks(id)
    set({ activePlaylistId: id, activePlaylistTracks: tracks, view: 'playlist' })
  },

  addTrackToPlaylist: async (playlistId, track) => {
    await window.raga.playlists.addTrack(playlistId, track)
    if (get().activePlaylistId === playlistId) await get().openPlaylist(playlistId)
    await get().loadPlaylists()
  },

  removeTrackFromPlaylist: async (playlistId, videoId) => {
    await window.raga.playlists.removeTrack(playlistId, videoId)
    if (get().activePlaylistId === playlistId) await get().openPlaylist(playlistId)
    await get().loadPlaylists()
  },

  loadHistory: async () => {
    const history = await window.raga.history.get()
    set({ history })
  },
}))
