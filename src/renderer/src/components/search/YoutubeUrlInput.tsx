import { useState } from 'react'
import { Link, Download, Play, Plus, X, Check, AlertCircle } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { useUIStore } from '../../store/uiStore'
import type { Track } from '../../types'

export function YoutubeUrlInput() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [fetchedTrack, setFetchedTrack] = useState<Track | null>(null)
  
  const { loadTrack, addToQueue } = usePlayerStore()
  const { addTrackToPlaylist, playlists } = useUIStore()

  const validateAndFetch = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)
    setFetchedTrack(null)

    try {
      // First validate the URL
      const isValid = await window.raga.youtube.validateUrl(url)
      if (!isValid) {
        setError('Invalid YouTube URL. Please check and try again.')
        return
      }

      // Fetch video information
      const track = await window.raga.youtube.videoFromUrl(url)
      if (!track) {
        setError('Could not fetch video information. The video might be private or unavailable.')
        return
      }

      setFetchedTrack(track)
      setSuccess(true)
      
    } catch (err) {
      console.error('Error fetching YouTube video:', err)
      setError('Failed to fetch video information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = () => {
    if (fetchedTrack) {
      loadTrack(fetchedTrack)
      // Add to history
      window.raga.history.add(fetchedTrack)
    }
  }

  const handleAddToQueue = () => {
    if (fetchedTrack) {
      addToQueue(fetchedTrack)
    }
  }

  const handleAddToPlaylist = (playlistId: string) => {
    if (fetchedTrack) {
      addTrackToPlaylist(playlistId, fetchedTrack)
    }
  }

  const reset = () => {
    setUrl('')
    setError('')
    setSuccess(false)
    setFetchedTrack(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAndFetch()
    } else if (e.key === 'Escape') {
      reset()
    }
  }

  return (
    <div className="p-4 border-b border-raga-border bg-raga-card/50">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Link size={18} className="text-raga-accent" />
          <h3 className="text-sm font-medium text-raga-text">Add from YouTube URL</h3>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste YouTube URL (youtube.com, youtu.be, music.youtube.com)"
              className={`w-full bg-raga-bg border rounded-lg px-3 py-2 text-sm text-raga-text placeholder-raga-muted outline-none transition-colors pr-8 ${
                error ? 'border-red-500' : success ? 'border-green-500' : 'border-raga-border'
              } focus:border-raga-accent`}
            />
            {url && (
              <button
                onClick={reset}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-raga-muted hover:text-raga-text transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <button
            onClick={validateAndFetch}
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-raga-accent text-white rounded-lg text-sm font-medium hover:bg-raga-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Download size={14} />
                Fetch
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
            <AlertCircle size={12} />
            {error}
          </div>
        )}

        {success && fetchedTrack && (
          <div className="mt-3 p-3 bg-raga-bg rounded-lg border border-green-500/20">
            <div className="flex items-center gap-3">
              <img 
                src={fetchedTrack.thumbnail} 
                alt="" 
                className="w-12 h-12 rounded object-cover bg-raga-card"
              />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-raga-text truncate">{fetchedTrack.title}</p>
                <p className="text-xs text-raga-muted truncate">{fetchedTrack.artist}</p>
                <p className="text-xs text-raga-muted">{fetchedTrack.durationText}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePlay}
                  className="p-2 rounded-lg bg-raga-accent text-white hover:bg-raga-accent-light transition-colors"
                  title="Play now"
                >
                  <Play size={14} />
                </button>
                
                <button
                  onClick={handleAddToQueue}
                  className="p-2 rounded-lg bg-raga-card hover:bg-raga-border text-raga-text transition-colors"
                  title="Add to queue"
                >
                  <Plus size={14} />
                </button>

                {playlists.length > 0 && (
                  <select
                    onChange={(e) => handleAddToPlaylist(e.target.value)}
                    className="px-2 py-1 text-xs bg-raga-card border border-raga-border rounded text-raga-text outline-none focus:border-raga-accent"
                    defaultValue=""
                  >
                    <option value="" disabled>Add to playlist</option>
                    {playlists.map((playlist) => (
                      <option key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
