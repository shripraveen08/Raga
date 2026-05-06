import { ArrowLeft, Play, Trash2, ListMusic } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { usePlayerStore } from '../../store/playerStore'

export function PlaylistView() {
  const { playlists, activePlaylistId, activePlaylistTracks, setView, removeTrackFromPlaylist } = useUIStore()
  const { setQueue, addToQueue } = usePlayerStore()

  const playlist = playlists.find(p => p.id === activePlaylistId)

  if (!playlist) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-raga-muted">Playlist not found</p>
    </div>
  )

  const playAll = () => {
    if (activePlaylistTracks.length) setQueue(activePlaylistTracks, 0)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-raga-border">
        <button
          onClick={() => setView('library')}
          className="flex items-center gap-2 text-sm text-raga-muted hover:text-raga-text transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-raga-card rounded-xl flex items-center justify-center">
            <ListMusic size={32} className="text-raga-muted" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-raga-text">{playlist.name}</h1>
            <p className="text-raga-muted mt-1">{activePlaylistTracks.length} tracks</p>
            {activePlaylistTracks.length > 0 && (
              <button
                onClick={playAll}
                className="flex items-center gap-2 mt-3 px-4 py-1.5 bg-raga-accent hover:bg-raga-accent-light rounded-full text-white text-sm font-medium transition-colors"
              >
                <Play size={14} /> Play all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activePlaylistTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-raga-muted">This playlist is empty</p>
            <p className="text-sm text-raga-muted mt-1">Search for songs and add them here</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {activePlaylistTracks.map((track, idx) => (
              <div
                key={track.id}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-raga-card transition-colors"
              >
                <span className="text-xs text-raga-muted w-5 text-right">{idx + 1}</span>
                <img src={track.thumbnail} alt="" className="w-10 h-10 rounded object-cover bg-raga-card flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-raga-text truncate">{track.title}</p>
                  <p className="text-xs text-raga-muted truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-raga-muted tabular-nums">{track.durationText}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setQueue(activePlaylistTracks, idx)}
                    className="p-1.5 rounded hover:bg-raga-border text-raga-muted hover:text-raga-text transition-colors"
                    title="Play"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    onClick={() => activePlaylistId && removeTrackFromPlaylist(activePlaylistId, track.id)}
                    className="p-1.5 rounded hover:bg-raga-border text-raga-muted hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
