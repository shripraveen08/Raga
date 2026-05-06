import { Minus, Square, X, Music } from 'lucide-react'

export function Titlebar() {
  return (
    <div
      className="flex items-center justify-between h-10 px-4 bg-raga-surface border-b border-raga-border flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex items-center gap-2">
        <Music size={16} className="text-raga-accent" />
        <span className="text-sm font-semibold text-raga-text">Raga</span>
      </div>

      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <button
          onClick={() => window.raga.window.minimize()}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-raga-card text-raga-muted hover:text-raga-text transition-colors"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => window.raga.window.maximize()}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-raga-card text-raga-muted hover:text-raga-text transition-colors"
        >
          <Square size={12} />
        </button>
        <button
          onClick={() => window.raga.window.close()}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-500/20 text-raga-muted hover:text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
