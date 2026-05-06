import { useEffect, useRef, useState } from 'react'
import { Search, Loader2, Play, ListPlus, Link } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { usePlayerStore } from '../../store/playerStore'
import { TrackContextMenu } from '../library/TrackContextMenu'
import { YoutubeUrlInput } from './YoutubeUrlInput'
import type { Track } from '../../types'

export function SearchView() {
  const { searchQuery, searchResults, searching, setSearchQuery, setSearchResults, setSearching, playlists, addTrackToPlaylist } = useUIStore()
  const { loadTrack, addToQueue, setQueue } = usePlayerStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)

  useEffect(() => { inputRef.current?.focus() }, [])

  const doSearch = async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const results: Track[] = await window.raga.youtube.search(q)
      setSearchResults(results)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(q), 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      doSearch(searchQuery)
    }
  }

  const playAll = () => {
    if (searchResults.length) setQueue(searchResults, 0)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search input */}
      <div className="p-4 border-b border-raga-border">
        <div className="flex items-center gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-raga-muted" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Search songs, artists, albums…"
              className="w-full bg-raga-card border border-raga-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-raga-text placeholder-raga-muted outline-none focus:border-raga-accent transition-colors"
            />
            {searching && (
              <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-raga-muted animate-spin" />
            )}
          </div>
          
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              showUrlInput 
                ? 'bg-raga-accent text-white' 
                : 'bg-raga-card border border-raga-border text-raga-text hover:bg-raga-border'
            }`}
            title="Add from YouTube URL"
          >
            <Link size={14} />
            URL
          </button>
        </div>
      </div>

      {/* YouTube URL Input */}
      {showUrlInput && <YoutubeUrlInput />}

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {!searchQuery && !searching && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Search size={48} className="text-raga-border mb-4" />
            <p className="text-raga-text font-medium">Find something to listen to</p>
            <p className="text-sm text-raga-muted mt-1">Search YouTube Music for songs, artists, or albums</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-raga-muted">{searchResults.length} results</p>
              <button
                onClick={playAll}
                className="flex items-center gap-1.5 text-sm text-raga-accent hover:text-raga-accent-light transition-colors"
              >
                <Play size={14} /> Play all
              </button>
            </div>
            <TrackList
              tracks={searchResults}
              playlists={playlists}
              onPlay={(track, idx) => setQueue(searchResults, idx)}
              onQueue={addToQueue}
              onAddToPlaylist={addTrackToPlaylist}
            />
          </>
        )}

        {searchResults.length === 0 && searchQuery && !searching && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-raga-muted">No results for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Inline TrackList ─────────────────────────────────────────────────────────

function TrackList({ tracks, playlists, onPlay, onQueue, onAddToPlaylist }: {
  tracks: Track[]
  playlists: any[]
  onPlay: (t: Track, idx: number) => void
  onQueue: (t: Track) => void
  onAddToPlaylist: (pid: string, t: Track) => void
}) {
  return (
    <div className="space-y-0.5">
      {tracks.map((track, idx) => (
        <TrackRow
          key={track.id}
          track={track}
          index={idx}
          playlists={playlists}
          onPlay={() => onPlay(track, idx)}
          onQueue={() => onQueue(track)}
          onAddToPlaylist={(pid) => onAddToPlaylist(pid, track)}
        />
      ))}
    </div>
  )
}

function TrackRow({ track, index, playlists, onPlay, onQueue, onAddToPlaylist }: {
  track: Track; index: number; playlists: any[]
  onPlay: () => void; onQueue: () => void; onAddToPlaylist: (pid: string) => void
}) {
  return (
    <div
      className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-raga-card cursor-pointer transition-colors"
      onDoubleClick={onPlay}
    >
      <div className="relative w-10 h-10 flex-shrink-0">
        <img src={track.thumbnail} alt="" className="w-10 h-10 rounded object-cover bg-raga-card" />
        <button
          onClick={onPlay}
          className="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Play size={16} className="text-white ml-0.5" />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-raga-text truncate">{track.title}</p>
        <p className="text-xs text-raga-muted truncate">{track.artist}</p>
      </div>

      {track.viewCount && (
        <span className="text-xs text-raga-muted hidden lg:block">{track.viewCount}</span>
      )}
      <span className="text-xs text-raga-muted w-10 text-right tabular-nums">{track.durationText}</span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); onQueue() }}
          title="Add to queue"
          className="p-1.5 rounded hover:bg-raga-border text-raga-muted hover:text-raga-text transition-colors"
        >
          <ListPlus size={15} />
        </button>
        <TrackContextMenu track={track} playlists={playlists} onAddToPlaylist={onAddToPlaylist} />
      </div>
    </div>
  )
}
