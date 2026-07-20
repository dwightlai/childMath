import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Session from './pages/Session'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import GameGallery from './pages/GameGallery'
import PlayGame from './pages/PlayGame'
import Mistakes from './pages/Mistakes'

export default function App() {
  return (
    <div className="min-h-full bg-cream">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/session/:moduleId" element={<Session />} />
        <Route path="/gallery" element={<GameGallery />} />
        <Route path="/play/:moduleId/:gameId" element={<PlayGame />} />
        <Route path="/mistakes" element={<Mistakes />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
