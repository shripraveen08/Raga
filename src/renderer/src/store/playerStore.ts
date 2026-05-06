import { create } from 'zustand'
import { Howl } from 'howler'
import type { Track, RepeatMode } from '../types'

interface PlayerState {
  queue: Track[]
  currentIndex: number
  currentTrack: Track | null
  playing: boolean
  loading: boolean
  progress: number        // 0-1
  volume: number          // 0-1
  muted: boolean
  repeat: RepeatMode
  shuffle: boolean
  howl: Howl | null
  error: string | null

  // Actions
  loadTrack: (track: Track, autoplay?: boolean) => Promise<void>
  playTrackFromQueue: (index: number) => Promise<void>
  togglePlay: () => void
  next: () => void
  prev: () => void
  seek: (pct: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleRepeat: () => void
  toggleShuffle: () => void
  setQueue: (tracks: Track[], startIndex?: number) => Promise<void>
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
}

let progressTimer: ReturnType<typeof setInterval> | null = null

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  currentTrack: null,
  playing: false,
  loading: false,
  progress: 0,
  volume: 0.8,
  muted: false,
  repeat: 'none',
  shuffle: false,
  howl: null,
  error: null,

  loadTrack: async (track, autoplay = true) => {
    set({ loading: true, error: null, progress: 0 })

    // Clean up existing howl
    const { howl: existing } = get()
    existing?.unload()
    if (progressTimer) { clearInterval(progressTimer); progressTimer = null }

    try {
      const url: string = await window.raga.youtube.streamUrl(track.id)

      const howl = new Howl({
        src: [url],
        html5: true,
        format: ['webm', 'mp4', 'mp3'],
        volume: get().muted ? 0 : get().volume,
        onplay: () => {
          set({ playing: true, loading: false })
          progressTimer = setInterval(() => {
            const h = get().howl
            if (!h) return
            const seek = h.seek() as number
            set({ progress: isNaN(seek) ? 0 : seek / (h.duration() || 1) })
          }, 500)
        },
        onpause: () => {
          set({ playing: false })
          if (progressTimer) { clearInterval(progressTimer); progressTimer = null }
        },
        onstop: () => {
          set({ playing: false, progress: 0 })
          if (progressTimer) { clearInterval(progressTimer); progressTimer = null }
        },
        onend: () => {
          if (progressTimer) { clearInterval(progressTimer); progressTimer = null }
          get().next()
        },
        onloaderror: (_, err) => {
          set({ loading: false, error: `Failed to load audio: ${err}` })
        },
      })

      set({ howl, currentTrack: track, loading: false })

      if (autoplay) {
        howl.play()
        // Record to history
        window.raga.history.add(track).catch(() => {})
      }
    } catch (err: any) {
      set({ loading: false, error: err?.message ?? 'Stream unavailable' })
    }
  },

  playTrackFromQueue: async (index) => {
    const { queue } = get()
    if (index < 0 || index >= queue.length) return
    set({ currentIndex: index })
    await get().loadTrack(queue[index])
  },

  togglePlay: () => {
    const { howl, playing } = get()
    if (!howl) return
    playing ? howl.pause() : howl.play()
  },

  next: () => {
    const { queue, currentIndex, repeat, shuffle } = get()
    if (!queue.length) return
    if (repeat === 'one') {
      get().howl?.seek(0)
      get().howl?.play()
      return
    }
    let nextIdx: number
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length)
    } else {
      nextIdx = (currentIndex + 1) % queue.length
      if (nextIdx === 0 && repeat === 'none') {
        get().howl?.stop()
        set({ progress: 0, playing: false, currentIndex: 0 })
        return
      }
    }
    get().playTrackFromQueue(nextIdx)
  },

  prev: () => {
    const { howl, currentIndex, queue, progress } = get()
    // If >3s into track, restart; else go previous
    if (progress > 0.05) {
      howl?.seek(0)
      return
    }
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length
    get().playTrackFromQueue(prevIdx)
  },

  seek: (pct) => {
    const { howl } = get()
    if (howl) {
      howl.seek(pct * howl.duration())
      set({ progress: pct })
    }
  },

  setVolume: (v) => {
    const vol = Math.max(0, Math.min(1, v))
    get().howl?.volume(vol)
    set({ volume: vol, muted: vol === 0 })
  },

  toggleMute: () => {
    const { muted, volume, howl } = get()
    const next = !muted
    howl?.volume(next ? 0 : volume)
    set({ muted: next })
  },

  toggleRepeat: () => {
    const map: Record<RepeatMode, RepeatMode> = { none: 'all', all: 'one', one: 'none' }
    set(s => ({ repeat: map[s.repeat] }))
  },

  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),

  setQueue: async (tracks, startIndex = 0) => {
    set({ queue: tracks, currentIndex: startIndex })
    if (tracks.length > 0) await get().loadTrack(tracks[startIndex])
  },

  addToQueue: (track) => set(s => ({ queue: [...s.queue, track] })),

  removeFromQueue: (index) =>
    set(s => ({
      queue: s.queue.filter((_, i) => i !== index),
      currentIndex: index < s.currentIndex ? s.currentIndex - 1 : s.currentIndex,
    })),

  clearQueue: () => {
    get().howl?.unload()
    if (progressTimer) clearInterval(progressTimer)
    set({ queue: [], currentIndex: 0, currentTrack: null, howl: null, playing: false, progress: 0 })
  },
}))
