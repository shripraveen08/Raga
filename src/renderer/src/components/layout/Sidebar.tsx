import { Search, Library, History, Plus, Trash2, ListMusic } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useState } from 'react'
import type { View } from '../../types'

export function Sidebar() {
  const { view, setView, playlists, createPlaylist, deletePlaylist, openPlaylist } = useUIStore()
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'search',  label: 'Search',  icon: <Search size={18} /> },
    { id: 'library', label: 'Library', icon: <Library size={18} /> },
    { id: 'history', label: 'History', icon: <History size={18} /> },
  ]

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createPlaylist(newName.trim())
    setNewName('')
    setCreating(false)
  }

  return (
    <aside className="w-56 bg-raga-surface border-r border-raga-border flex flex-col flex-shrink-0">
      <nav className="p-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              view === item.id
                ? 'bg-raga-accent/20 text-raga-accent-light'
                : 'text-raga-text-secondary hover:bg-raga-card hover:text-raga-text'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-raga-border mt-1 p-3 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-raga-muted uppercase tracking-wider">Playlists</span>
          <button
            onClick={() => setCreating(true)}
            className="text-raga-muted hover:text-raga-accent transition-colors"
            title="New playlist"
          >
            <Plus size={16} />
          </button>
        </div>

        {creating && (
          <div className="mb-2">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') { setCreating(false); setNewName('') }
              }}
              placeholder="Playlist name…"
              className="w-full bg-raga-card border border-raga-border rounded px-2 py-1 text-sm text-raga-text placeholder-raga-muted outline-none focus:border-raga-accent"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin">
          {playlists.length === 0 && (
            <p className="text-xs text-raga-muted px-1 py-2">No playlists yet</p>
          )}
          {playlists.map(pl => (
            <div
              key={pl.id}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                view === 'playlist' ? 'hover:bg-raga-card' : 'hover:bg-raga-card'
              }`}
              onClick={() => openPlaylist(pl.id)}
            >
              <ListMusic size={14} className="text-raga-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-raga-text truncate">{pl.name}</p>
                <p className="text-xs text-raga-muted">{pl.track_count} tracks</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deletePlaylist(pl.id) }}
                className="opacity-0 group-hover:opacity-100 text-raga-muted hover:text-red-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
