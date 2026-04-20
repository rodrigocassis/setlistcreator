import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import type { Setlist, Song } from '../types/models'
import {
  firebaseAdapter,
  isFirebaseConfigured,
  localStorageAdapter,
} from '../services/persistence'

type AppDataContextValue = {
  songs: Song[]
  setlists: Setlist[]
  loading: boolean
  getSong: (id: string) => Song | undefined
  getSetlist: (id: string) => Setlist | undefined
  addSong: (data: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => Song
  updateSong: (id: string, data: Partial<Omit<Song, 'id' | 'createdAt'>>) => void
  deleteSong: (id: string) => void
  toggleFavorite: (id: string) => void
  addSetlist: (data: Omit<Setlist, 'id' | 'createdAt' | 'updatedAt'>) => Setlist
  updateSetlist: (id: string, data: Partial<Omit<Setlist, 'id' | 'createdAt'>>) => void
  deleteSetlist: (id: string) => void
  duplicateSetlist: (id: string) => Setlist | undefined
  replaceSongs: (songs: Song[]) => void
  replaceSetlists: (setlists: Setlist[]) => void
  exportSongsJson: () => string
  exportSetlistsJson: () => string
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

function resolvePersistenceAdapter() {
  const mode = import.meta.env.VITE_PERSISTENCE_MODE
  if (mode === 'local') return localStorageAdapter
  if (isFirebaseConfigured()) return firebaseAdapter
  return localStorageAdapter
}

const persistenceAdapter = resolvePersistenceAdapter()

const iso = () => new Date().toISOString()

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {
    /* HTTP não seguro ou contexto restrito */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([])
  const [setlists, setSetlists] = useState<Setlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [s, sl] = await Promise.all([
          persistenceAdapter.getSongs(),
          persistenceAdapter.getSetlists(),
        ])
        if (!cancelled) {
          setSongs(s)
          setSetlists(sl)
        }
      } catch (error) {
        console.error('Falha ao carregar dados persistidos:', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /** Sempre derivar o próximo array do estado atual (evita closure obsoleta e corrida com navigate). */
  const persistSongs = useCallback((fn: (prev: Song[]) => Song[]) => {
    setSongs((prev) => {
      const next = fn(prev)
      void persistenceAdapter.saveSongs(next)
      return next
    })
  }, [])

  const persistSetlists = useCallback((fn: (prev: Setlist[]) => Setlist[]) => {
    setSetlists((prev) => {
      const next = fn(prev)
      void persistenceAdapter.saveSetlists(next)
      return next
    })
  }, [])

  const getSong = useCallback(
    (id: string) => songs.find((s) => s.id === id),
    [songs],
  )

  const getSetlist = useCallback(
    (id: string) => setlists.find((s) => s.id === id),
    [setlists],
  )

  const addSong = useCallback(
    (data: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => {
      const t = iso()
      const song: Song = {
        ...data,
        id: newId(),
        createdAt: t,
        updatedAt: t,
      }
      persistSongs((prev) => [...prev, song])
      return song
    },
    [persistSongs],
  )

  const updateSong = useCallback(
    (id: string, data: Partial<Omit<Song, 'id' | 'createdAt'>>) => {
      persistSongs((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, ...data, updatedAt: iso() } : s,
        ),
      )
    },
    [persistSongs],
  )

  const deleteSong = useCallback(
    (id: string) => {
      persistSongs((prev) => prev.filter((s) => s.id !== id))
      persistSetlists((prev) =>
        prev.map((sl) => ({
          ...sl,
          bloco1: sl.bloco1.filter((x) => x !== id),
          bloco2: sl.bloco2.filter((x) => x !== id),
          bloco3: sl.bloco3.filter((x) => x !== id),
          backup: sl.backup.filter((x) => x !== id),
          updatedAt: iso(),
        })),
      )
    },
    [persistSongs, persistSetlists],
  )

  const toggleFavorite = useCallback(
    (id: string) => {
      persistSongs((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, favorita: !s.favorita, updatedAt: iso() } : s,
        ),
      )
    },
    [persistSongs],
  )

  const addSetlist = useCallback(
    (data: Omit<Setlist, 'id' | 'createdAt' | 'updatedAt'>) => {
      const t = iso()
      const sl: Setlist = {
        ...data,
        id: newId(),
        createdAt: t,
        updatedAt: t,
      }
      persistSetlists((prev) => [...prev, sl])
      return sl
    },
    [persistSetlists],
  )

  const updateSetlist = useCallback(
    (id: string, data: Partial<Omit<Setlist, 'id' | 'createdAt'>>) => {
      persistSetlists((prev) =>
        prev.map((sl) =>
          sl.id === id ? { ...sl, ...data, updatedAt: iso() } : sl,
        ),
      )
    },
    [persistSetlists],
  )

  const deleteSetlist = useCallback(
    (id: string) => {
      persistSetlists((prev) => prev.filter((s) => s.id !== id))
    },
    [persistSetlists],
  )

  const duplicateSetlist = useCallback(
    (id: string) => {
      let copy: Setlist | undefined
      flushSync(() => {
        persistSetlists((prev) => {
          const src = prev.find((s) => s.id === id)
          if (!src) return prev
          const t = iso()
          copy = {
            ...src,
            id: newId(),
            nome: `${src.nome} (cópia)`,
            createdAt: t,
            updatedAt: t,
          }
          return [...prev, copy]
        })
      })
      return copy
    },
    [persistSetlists],
  )

  const replaceSongs = useCallback(
    (next: Song[]) => {
      persistSongs(() => next)
    },
    [persistSongs],
  )

  const replaceSetlists = useCallback(
    (next: Setlist[]) => {
      persistSetlists(() => next)
    },
    [persistSetlists],
  )

  const exportSongsJson = useCallback(() => JSON.stringify(songs, null, 2), [songs])

  const exportSetlistsJson = useCallback(
    () => JSON.stringify(setlists, null, 2),
    [setlists],
  )

  const value = useMemo(
    () => ({
      songs,
      setlists,
      loading,
      getSong,
      getSetlist,
      addSong,
      updateSong,
      deleteSong,
      toggleFavorite,
      addSetlist,
      updateSetlist,
      deleteSetlist,
      duplicateSetlist,
      replaceSongs,
      replaceSetlists,
      exportSongsJson,
      exportSetlistsJson,
    }),
    [
      songs,
      setlists,
      loading,
      getSong,
      getSetlist,
      addSong,
      updateSong,
      deleteSong,
      toggleFavorite,
      addSetlist,
      updateSetlist,
      deleteSetlist,
      duplicateSetlist,
      replaceSongs,
      replaceSetlists,
      exportSongsJson,
      exportSetlistsJson,
    ],
  )

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  )
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData fora do AppDataProvider')
  return ctx
}
