import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

let db: Database.Database

export function initDB() {
  const dbPath = join(app.getPath('userData'), 'raga.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS playlists (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS playlist_tracks (
      playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
      video_id    TEXT NOT NULL,
      title       TEXT NOT NULL,
      artist      TEXT NOT NULL DEFAULT 'Unknown',
      duration    INTEGER NOT NULL DEFAULT 0,
      duration_text TEXT NOT NULL DEFAULT '0:00',
      thumbnail   TEXT,
      position    INTEGER NOT NULL DEFAULT 0,
      added_at    INTEGER DEFAULT (unixepoch()),
      PRIMARY KEY (playlist_id, video_id)
    );

    CREATE TABLE IF NOT EXISTS history (
      video_id      TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      artist        TEXT NOT NULL DEFAULT 'Unknown',
      duration      INTEGER NOT NULL DEFAULT 0,
      duration_text TEXT NOT NULL DEFAULT '0:00',
      thumbnail     TEXT,
      played_at     INTEGER DEFAULT (unixepoch()),
      play_count    INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_history_played ON history(played_at DESC);
    CREATE INDEX IF NOT EXISTS idx_pt_playlist    ON playlist_tracks(playlist_id, position);
  `)
}

export const dbOps = {
  // ─── Playlists ─────────────────────────────────────────────────────────────
  getAllPlaylists() {
    return db
      .prepare(
        `SELECT p.*, COUNT(pt.video_id) as track_count
         FROM playlists p
         LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id
         GROUP BY p.id
         ORDER BY p.updated_at DESC`
      )
      .all()
  },

  createPlaylist(name: string) {
    const id = uuidv4()
    db.prepare('INSERT INTO playlists (id, name) VALUES (?, ?)').run(id, name)
    return { id, name, track_count: 0 }
  },

  deletePlaylist(id: string) {
    db.prepare('DELETE FROM playlists WHERE id = ?').run(id)
  },

  getPlaylistTracks(playlistId: string) {
    return db
      .prepare('SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY position')
      .all(playlistId)
  },

  addTrackToPlaylist(playlistId: string, track: any) {
    const maxPos = (
      db
        .prepare('SELECT MAX(position) as m FROM playlist_tracks WHERE playlist_id = ?')
        .get(playlistId) as any
    )?.m ?? -1

    db
      .prepare(
        `INSERT OR REPLACE INTO playlist_tracks
         (playlist_id, video_id, title, artist, duration, duration_text, thumbnail, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        playlistId,
        track.id,
        track.title,
        track.artist,
        track.duration,
        track.durationText,
        track.thumbnail,
        maxPos + 1
      )

    db
      .prepare('UPDATE playlists SET updated_at = unixepoch() WHERE id = ?')
      .run(playlistId)
  },

  removeTrackFromPlaylist(playlistId: string, videoId: string) {
    db
      .prepare('DELETE FROM playlist_tracks WHERE playlist_id = ? AND video_id = ?')
      .run(playlistId, videoId)
  },

  // ─── History ───────────────────────────────────────────────────────────────
  getHistory() {
    return db
      .prepare('SELECT * FROM history ORDER BY played_at DESC LIMIT 100')
      .all()
  },

  addToHistory(track: any) {
    db
      .prepare(
        `INSERT INTO history (video_id, title, artist, duration, duration_text, thumbnail, play_count)
         VALUES (?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(video_id) DO UPDATE SET
           played_at  = unixepoch(),
           play_count = play_count + 1`
      )
      .run(
        track.id,
        track.title,
        track.artist,
        track.duration,
        track.durationText,
        track.thumbnail
      )
  },

  clearHistory() {
    db.prepare('DELETE FROM history').run()
  },
}
