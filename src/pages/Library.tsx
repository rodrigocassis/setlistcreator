import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import type { Song } from '../types/models'
import { songPalcoLabel } from '../utils/songDisplay'

function SongCard({
  song,
  onDelete,
}: {
  song: Song
  onDelete: () => void
}) {
  const { toggleFavorite } = useAppData()
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-white">{songPalcoLabel(song)}</p>
          <p className="text-sm text-zinc-400">{song.artista}</p>
          {song.apelido?.trim() ? (
            <p className="mt-0.5 text-xs text-zinc-500">Obra: {song.musica}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(song.id)}
          className="shrink-0 text-xl text-amber-500/90 hover:text-amber-400"
          aria-label={song.favorita ? 'Remover dos favoritos' : 'Favoritar'}
        >
          {song.favorita ? '★' : '☆'}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {song.afinacao} · {song.estilo}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/biblioteca/${song.id}/editar`}
          className="min-h-[40px] flex-1 rounded-lg bg-zinc-800 py-2 text-center text-sm font-medium text-white hover:bg-zinc-700"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Excluir "${song.musica}"?`)) onDelete()
          }}
          className="min-h-[40px] flex-1 rounded-lg border border-red-900/50 py-2 text-sm text-red-400 hover:bg-red-950/50"
        >
          Excluir
        </button>
      </div>
    </div>
  )
}

export function Library() {
  const { songs, deleteSong, exportSongsJson, replaceSongs, loading } = useAppData()
  const [q, setQ] = useState('')
  const [estilo, setEstilo] = useState('')
  const [afinacao, setAfinacao] = useState('')

  const estilos = useMemo(
    () => [...new Set(songs.map((s) => s.estilo).filter(Boolean))].sort(),
    [songs],
  )
  const afinacoes = useMemo(
    () => [...new Set(songs.map((s) => s.afinacao).filter(Boolean))].sort(),
    [songs],
  )

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return songs.filter((s) => {
      if (estilo && s.estilo !== estilo) return false
      if (afinacao && s.afinacao !== afinacao) return false
      if (!qq) return true
      return (
        s.musica.toLowerCase().includes(qq) ||
        s.artista.toLowerCase().includes(qq) ||
        (s.apelido?.toLowerCase().includes(qq) ?? false)
      )
    })
  }, [songs, q, estilo, afinacao])

  const downloadExport = () => {
    const blob = new Blob([exportSongsJson()], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `musicas-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        const arr = Array.isArray(data) ? data : data.songs
        if (!Array.isArray(arr)) throw new Error('Formato inválido')
        const merged = new Map(songs.map((s) => [s.id, s]))
        for (const raw of arr) {
          const t = new Date().toISOString()
          const id = typeof raw.id === 'string' ? raw.id : crypto.randomUUID()
          merged.set(id, {
            id,
            artista: String(raw.artista ?? ''),
            musica: String(raw.musica ?? ''),
            apelido: String(raw.apelido ?? ''),
            afinacao: String(raw.afinacao ?? ''),
            estilo: String(raw.estilo ?? ''),
            baixo: String(raw.baixo ?? ''),
            bateria: String(raw.bateria ?? ''),
            guitarra1: String(raw.guitarra1 ?? ''),
            guitarra2: String(raw.guitarra2 ?? ''),
            violao: String(raw.violao ?? ''),
            voz: String(raw.voz ?? ''),
            duracaoMinutos:
              typeof raw.duracaoMinutos === 'number' ? raw.duracaoMinutos : undefined,
            favorita: Boolean(raw.favorita),
            createdAt: String(raw.createdAt ?? t),
            updatedAt: t,
          })
        }
        replaceSongs([...merged.values()])
      } catch {
        alert('JSON inválido')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (loading) return <p className="text-zinc-500">Carregando…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Biblioteca</h1>
          <p className="text-sm text-zinc-500">Busca, filtros e cadastro de músicas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800">
            Importar JSON
            <input type="file" accept=".json" className="hidden" onChange={importFile} />
          </label>
          <button
            type="button"
            onClick={downloadExport}
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            Exportar JSON
          </button>
          <Link
            to="/biblioteca/nova"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            + Nova música
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          type="search"
          placeholder="Buscar artista ou música…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white placeholder:text-zinc-600 sm:col-span-1"
        />
        <select
          value={estilo}
          onChange={(e) => setEstilo(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white"
        >
          <option value="">Todos os estilos</option>
          {estilos.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          value={afinacao}
          onChange={(e) => setAfinacao(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white"
        >
          <option value="">Todas as afinações</option>
          {afinacoes.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-zinc-500">
        {filtered.length} de {songs.length} músicas
      </p>

      <ul className="hidden sm:block sm:space-y-2">
        {filtered.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
          >
            <div className="min-w-0">
              <span className="font-medium text-white">{songPalcoLabel(s)}</span>
              <span className="text-zinc-500"> — {s.artista}</span>
              {s.apelido?.trim() ? (
                <span className="ml-2 text-xs text-zinc-600">({s.musica})</span>
              ) : null}
              <span className="ml-2 text-xs text-zinc-600">
                {s.afinacao} · {s.estilo}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/biblioteca/${s.id}/editar`}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Excluir "${s.musica}"?`)) deleteSong(s.id)
                }}
                className="rounded-lg border border-red-900/40 px-3 py-1.5 text-sm text-red-400"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:hidden">
        {filtered.map((s) => (
          <SongCard key={s.id} song={s} onDelete={() => deleteSong(s.id)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-zinc-500">Nenhuma música encontrada.</p>
      ) : null}
    </div>
  )
}
