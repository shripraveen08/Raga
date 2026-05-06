import { useEffect } from 'react'
import { History, Play, Trash2 } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { usePlayerStore } from '../../store/playerStore'

export function HistoryView() {
  const { history, loadHistory } = useUIStore()
  const { loadTrack, addToQueue } = usePlayerStore()

  useEffect(() => { loadHistory() }, [])

  const clearAll = async () => {
    await window.raga.history.clear()
    loadHistory()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-raga-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-raga-text">Recently Played</h1>
          <p className="text-sm text-raga-muted mt-1">{history.length} tracks</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 text-sm text-raga-muted hover:text-red-400 transition-colors"
          >
            <Trash2 size={15} /> Clear history
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <History size={48} className="text-raga-border mb-4" />
            <p className="text-raga-text font-medium">No history yet</p>
            <p className="text-sm text-raga-muted mt-1">Songs you play will appear here</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {history.map(track => (
              <div
                key={track.id}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-raga-card transition-colors cursor-pointer"
                onDoubleClick={() => loadTrack(track)}
              >
                <img src={track.thumbnail} alt="" className="w-10 h-10 rounded object-cover bg-raga-card flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-raga-text truncate">{track.title}</p>
                  <p className="text-xs text-raga-muted truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-raga-muted tabular-nums">{track.durationText}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => loadTrack(track)}
                    className="p-1.5 rounded hover:bg-raga-border text-raga-muted hover:text-raga-text transition-colors"
                  >
                    <Play size={14} />
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
