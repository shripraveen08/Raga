import { Plus, ListMusic, Play } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useState } from 'react'

export function LibraryView() {
  const { playlists, createPlaylist, openPlaylist } = useUIStore()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    await createPlaylist(name.trim())
    setName(''); setCreating(false)
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-raga-text">Your Library</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-raga-accent hover:bg-raga-accent-light rounded-lg text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Playlist
        </button>
      </div>

      {creating && (
        <div className="mb-6 flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') { setCreating(false); setName('') }
            }}
            placeholder="Playlist name…"
            className="flex-1 bg-raga-card border border-raga-accent rounded-lg px-3 py-2 text-sm text-raga-text placeholder-raga-muted outline-none"
          />
          <button onClick={handleCreate} className="px-4 py-2 bg-raga-accent text-white rounded-lg text-sm">Create</button>
          <button onClick={() => { setCreating(false); setName('') }} className="px-4 py-2 bg-raga-card text-raga-muted rounded-lg text-sm">Cancel</button>
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <ListMusic size={48} className="text-raga-border mb-4" />
          <p className="text-raga-text font-medium">No playlists yet</p>
          <p className="text-sm text-raga-muted mt-1">Create one to organize your music</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map(pl => (
            <div
              key={pl.id}
              onClick={() => openPlaylist(pl.id)}
              className="group bg-raga-card border border-raga-border rounded-xl p-4 cursor-pointer hover:border-raga-accent/50 transition-colors"
            >
              <div className="w-full aspect-square bg-raga-surface rounded-lg flex items-center justify-center mb-3 group-hover:bg-raga-accent/10 transition-colors">
                <ListMusic size={32} className="text-raga-muted group-hover:text-raga-accent transition-colors" />
              </div>
              <p className="font-medium text-raga-text truncate">{pl.name}</p>
              <p className="text-sm text-raga-muted mt-0.5">{pl.track_count} tracks</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
