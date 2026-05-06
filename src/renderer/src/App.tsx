import { useEffect } from 'react'
import { Titlebar } from './components/layout/Titlebar'
import { Sidebar } from './components/layout/Sidebar'
import { PlayerBar } from './components/player/PlayerBar'
import { SearchView } from './components/search/SearchView'
import { LibraryView } from './components/library/LibraryView'
import { PlaylistView } from './components/library/PlaylistView'
import { HistoryView } from './components/library/HistoryView'
import { useUIStore } from './store/uiStore'

export default function App() {
  const { view, loadPlaylists } = useUIStore()

  useEffect(() => {
    loadPlaylists()
  }, [])

  return (
    <div className="flex flex-col h-screen bg-raga-bg text-raga-text select-none overflow-hidden">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {view === 'search'   && <SearchView />}
          {view === 'library'  && <LibraryView />}
          {view === 'playlist' && <PlaylistView />}
          {view === 'history'  && <HistoryView />}
        </main>
      </div>
      <PlayerBar />
    </div>
  )
}
