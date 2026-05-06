import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, ListPlus } from 'lucide-react'
import type { Track } from '../../types'

interface Props {
  track: Track
  playlists: { id: string; name: string }[]
  onAddToPlaylist: (playlistId: string) => void
}

export function TrackContextMenu({ track, playlists, onAddToPlaylist }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        className="p-1.5 rounded hover:bg-raga-border text-raga-muted hover:text-raga-text transition-colors"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1 w-48 bg-raga-card border border-raga-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-raga-border">
            <p className="text-xs font-semibold text-raga-muted uppercase tracking-wider">Add to playlist</p>
          </div>
          {playlists.length === 0 ? (
            <p className="px-3 py-2 text-sm text-raga-muted">No playlists yet</p>
          ) : (
            playlists.map(pl => (
              <button
                key={pl.id}
                onClick={e => {
                  e.stopPropagation()
                  onAddToPlaylist(pl.id)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-raga-text hover:bg-raga-border transition-colors text-left"
              >
                <ListPlus size={14} className="text-raga-muted" />
                {pl.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
