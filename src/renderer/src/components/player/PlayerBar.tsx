import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Repeat1, Shuffle,
  ListMusic, Loader2
} from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'

export function PlayerBar() {
  const {
    currentTrack, playing, loading, progress, volume,
    muted, repeat, shuffle, queue, currentIndex,
    togglePlay, next, prev, seek, setVolume, toggleMute,
    toggleRepeat, toggleShuffle,
  } = usePlayerStore()

  if (!currentTrack && queue.length === 0) return (
    <div className="h-20 bg-raga-surface border-t border-raga-border flex items-center justify-center">
      <p className="text-sm text-raga-muted">Search for a song to start listening</p>
    </div>
  )

  const formatTime = (pct: number) => {
    if (!currentTrack) return '0:00'
    const secs = Math.floor(pct * currentTrack.duration)
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
  }

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat

  return (
    <div className="h-20 bg-raga-surface border-t border-raga-border flex items-center px-4 gap-4 flex-shrink-0">
      {/* Track info */}
      <div className="flex items-center gap-3 w-60 flex-shrink-0">
        {currentTrack?.thumbnail && (
          <img
            src={currentTrack.thumbnail}
            alt=""
            className="w-12 h-12 rounded object-cover bg-raga-card flex-shrink-0"
          />
        )}
        {currentTrack && (
          <div className="min-w-0">
            <p className="text-sm font-medium text-raga-text truncate">{currentTrack.title}</p>
            <p className="text-xs text-raga-muted truncate">{currentTrack.artist}</p>
          </div>
        )}
      </div>

      {/* Controls + scrubber */}
      <div className="flex-1 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${shuffle ? 'text-raga-accent' : 'text-raga-muted hover:text-raga-text'}`}
          >
            <Shuffle size={16} />
          </button>

          <button onClick={prev} className="text-raga-text-secondary hover:text-raga-text transition-colors">
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-raga-accent hover:bg-raga-accent-light flex items-center justify-center transition-colors disabled:opacity-60"
          >
            {loading
              ? <Loader2 size={18} className="animate-spin text-white" />
              : playing
                ? <Pause size={18} className="text-white" />
                : <Play size={18} className="text-white ml-0.5" />
            }
          </button>

          <button onClick={next} className="text-raga-text-secondary hover:text-raga-text transition-colors">
            <SkipForward size={20} />
          </button>

          <button
            onClick={toggleRepeat}
            className={`transition-colors ${repeat !== 'none' ? 'text-raga-accent' : 'text-raga-muted hover:text-raga-text'}`}
          >
            <RepeatIcon size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full flex items-center gap-2 max-w-lg">
          <span className="text-xs text-raga-muted w-10 text-right tabular-nums">{formatTime(progress)}</span>
          <div
            className="flex-1 h-1 bg-raga-border rounded-full cursor-pointer group relative"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              seek((e.clientX - rect.left) / rect.width)
            }}
          >
            <div
              className="h-full bg-raga-accent rounded-full relative"
              style={{ width: `${progress * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-xs text-raga-muted w-10 tabular-nums">{currentTrack?.durationText ?? '0:00'}</span>
        </div>
      </div>

      {/* Volume + queue count */}
      <div className="flex items-center gap-3 w-44 justify-end flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-raga-muted">
          <ListMusic size={14} />
          <span>{queue.length}</span>
        </div>

        <button onClick={toggleMute} className="text-raga-muted hover:text-raga-text transition-colors">
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min="0" max="1" step="0.01"
          value={muted ? 0 : volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="w-20 accent-raga-accent"
        />
      </div>
    </div>
  )
}
