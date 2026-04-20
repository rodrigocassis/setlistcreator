import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppDataProvider } from './context/AppDataContext'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { Library } from './pages/Library'
import { SongEditor } from './pages/SongEditor'
import { Setlists } from './pages/Setlists'
import { SetlistEditorPage } from './pages/SetlistEditorPage'
import { PreviewPage } from './pages/PreviewPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppDataProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/biblioteca" element={<Library />} />
            <Route path="/biblioteca/nova" element={<SongEditor />} />
            <Route path="/biblioteca/:id/editar" element={<SongEditor />} />
            <Route path="/setlists" element={<Setlists />} />
            <Route path="/setlists/novo" element={<SetlistEditorPage />} />
            <Route path="/setlists/:id/editar" element={<SetlistEditorPage />} />
            <Route path="/setlists/:id/preview" element={<PreviewPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppDataProvider>
    </BrowserRouter>
  )
}
