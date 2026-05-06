import ytdl from 'ytdl-core'
import { YouTube } from 'youtube-sr'

export interface SearchResult {
  id: string
  title: string
  artist: string
  duration: number      // seconds
  durationText: string  // "3:45"
  thumbnail: string
  viewCount?: string
}

export async function searchYouTube(query: string): Promise<SearchResult[]> {
  try {
    const results = await YouTube.search(query, { limit: 25, type: 'video' })
    return results
      .filter(v => v.id && v.title)
      .map(v => ({
        id: v.id!,
        title: v.title!,
        artist: v.channel?.name ?? 'Unknown Artist',
        duration: v.duration ?? 0,
        durationText: formatDuration(v.duration ?? 0),
        thumbnail:
          v.thumbnail?.url ??
          `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
        viewCount: v.views ? formatViews(v.views) : undefined,
      }))
  } catch (err) {
    console.error('[YouTube] Search error:', err)
    return []
  }
}

export async function getStreamUrl(videoId: string): Promise<string> {
  const info = await ytdl.getInfo(videoId)
  const format = ytdl.chooseFormat(info.formats, {
    quality: 'highestaudio',
    filter: 'audioonly',
  })
  if (!format?.url) throw new Error('No audio format found')
  return format.url
}

export async function getVideoInfo(videoId: string): Promise<Partial<SearchResult>> {
  try {
    const info = await ytdl.getBasicInfo(videoId)
    const d = info.videoDetails
    return {
      id: d.videoId,
      title: d.title,
      artist: d.author.name,
      duration: parseInt(d.lengthSeconds),
      durationText: formatDuration(parseInt(d.lengthSeconds)),
      thumbnail: d.thumbnails.at(-1)?.url ?? '',
    }
  } catch {
    return {}
  }
}

export function parseYouTubeUrl(url: string): string | null {
  // Regular expressions for various YouTube URL formats
  const patterns = [
    // Standard YouTube URLs
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // YouTube music URLs
    /(?:music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // Short URLs
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    // Mobile URLs
    /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  // Check if it's a raw video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim()
  }

  return null
}

export function isValidYouTubeUrl(url: string): boolean {
  return parseYouTubeUrl(url) !== null
}

export async function getVideoFromUrl(url: string): Promise<SearchResult | null> {
  const videoId = parseYouTubeUrl(url)
  if (!videoId) {
    return null
  }

  try {
    const info = await getVideoInfo(videoId)
    if (!info.id || !info.title) {
      return null
    }

    return {
      id: info.id,
      title: info.title,
      artist: info.artist || 'Unknown Artist',
      duration: info.duration || 0,
      durationText: info.durationText || '0:00',
      thumbnail: info.thumbnail || `https://i.ytimg.com/vi/${info.id}/mqdefault.jpg`,
      viewCount: undefined,
    }
  } catch (error) {
    console.error('[YouTube] Error fetching video from URL:', error)
    return null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`
  return `${n} views`
}
