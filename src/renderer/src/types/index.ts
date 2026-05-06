import type { RagaAPI } from '../../preload'

declare global {
  interface Window {
    raga: RagaAPI
  }
}

// ─── Domain types ────────────────────────────────────────────────────────────

export interface Track {
  id: string
  title: string
  artist: string
  duration: number       // seconds
  durationText: string   // "3:45"
  thumbnail: string
  viewCount?: string
}

export interface Playlist {
  id: string
  name: string
  track_count: number
  created_at: number
  updated_at: number
}

export type RepeatMode = 'none' | 'one' | 'all'
export type View = 'search' | 'library' | 'history' | 'playlist'
