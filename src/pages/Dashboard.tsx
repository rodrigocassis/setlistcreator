import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { countSongOccurrencesInSetlists } from '../utils/setlistStats'
import { songPalcoLabel } from '../utils/songDisplay'

const RECENT_COUNT = 8

function formatData(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export function Dashboard() {
  const { songs, setlists, loading } = useAppData()
  const [usageQuery, setUsageQuery] = useState('')

  const recentSetlists = useMemo(() => {
    return [...setlists]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, RECENT_COUNT)
  }, [setlists])

  const usageRows = useMemo(() => {
    const rows = songs.map((song) => ({
      song,
      count: countSongOccurrencesInSetlists(song.id, setlists),
    }))
    rows.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return songPalcoLabel(a.song).localeCompare(songPalcoLabel(b.song), 'pt-BR')
    })
    return rows
  }, [songs, setlists])

  const usageSummary = useMemo(() => {
    const withUse = usageRows.filter((r) => r.count > 0).length
    return { withUse, never: usageRows.length - withUse }
  }, [usageRows])

  const usageFiltered = useMemo(() => {
    const q = usageQuery.trim().toLowerCase()
    if (!q) return usageRows
    return usageRows.filter(
      ({ song }) =>
        songPalcoLabel(song).toLowerCase().includes(q) ||
        song.artista.toLowerCase().includes(q) ||
        song.musica.toLowerCase().includes(q),
    )
  }, [usageRows, usageQuery])

  if (loading) {
    return <p className="text-zinc-500">Carregando…</p>
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-500">Músicas na biblioteca</p>
          <p className="mt-1 text-3xl font-semibold text-violet-400">{songs.length}</p>
          <Link
            to="/biblioteca"
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-zinc-800 px-4 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Abrir biblioteca
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-500">Setlists salvos</p>
          <p className="mt-1 text-3xl font-semibold text-violet-400">{setlists.length}</p>
          <Link
            to="/setlists"
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-zinc-800 px-4 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Ver setlists
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/biblioteca/nova"
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-violet-600 px-4 font-medium text-white shadow-lg shadow-violet-900/30 hover:bg-violet-500"
        >
          + Nova música
        </Link>
        <Link
          to="/setlists/novo"
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-violet-500/50 bg-violet-950/40 px-4 font-medium text-violet-200 hover:bg-violet-950/70"
        >
          + Novo setlist
        </Link>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Últimos setlists
          </h2>
          <Link
            to="/setlists"
            className="text-sm text-violet-400 hover:text-violet-300"
          >
            Ver todos
          </Link>
        </div>
        {recentSetlists.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800 py-8 text-center text-sm text-zinc-500">
            Nenhum setlist ainda. Crie um com o botão acima.
          </p>
        ) : (
          <ul className="space-y-2">
            {recentSetlists.map((sl) => (
              <li key={sl.id}>
                <Link
                  to={`/setlists/${sl.id}/editar`}
                  className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 transition hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-100">{sl.nome}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {[sl.data, sl.local, `${sl.blocos} bloco(s)`]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-600">
                    {formatData(sl.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Uso nas setlists
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Quantas vezes cada música apareceu em blocos ou backup (em todos os shows
              salvos). Útil para ver o que está em rotina e o que não entrou nos sets.
            </p>
          </div>
          {setlists.length > 0 ? (
            <p className="text-xs text-zinc-500">
              <span className="text-zinc-400">{usageSummary.withUse}</span> com uso ·{' '}
              <span className="text-zinc-400">{usageSummary.never}</span> ainda sem uso
            </p>
          ) : null}
        </div>

        {setlists.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800 py-6 text-center text-sm text-zinc-500">
            Crie setlists para começar a ver estatísticas de uso.
          </p>
        ) : songs.length === 0 ? (
          <p className="text-sm text-zinc-500">Cadastre músicas na biblioteca.</p>
        ) : (
          <>
            <input
              type="search"
              placeholder="Filtrar por música ou artista…"
              value={usageQuery}
              onChange={(e) => setUsageQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600"
            />
            <div className="max-h-[min(420px,55vh)] overflow-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur">
                  <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-3 py-2 font-medium">Música</th>
                    <th className="hidden px-3 py-2 font-medium sm:table-cell">Artista</th>
                    <th className="w-16 px-3 py-2 text-right font-medium">Vezes</th>
                  </tr>
                </thead>
                <tbody>
                  {usageFiltered.map(({ song, count }) => (
                    <tr
                      key={song.id}
                      className="border-b border-zinc-800/80 hover:bg-zinc-900/50"
                    >
                      <td className="px-3 py-2.5">
                        <Link
                          to={`/biblioteca/${song.id}/editar`}
                          className="font-medium text-zinc-100 hover:text-violet-300"
                        >
                          {songPalcoLabel(song)}
                        </Link>
                        <span className="mt-0.5 block text-xs text-zinc-500 sm:hidden">
                          {song.artista}
                        </span>
                      </td>
                      <td className="hidden px-3 py-2.5 text-zinc-400 sm:table-cell">
                        {song.artista}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        <span
                          className={`inline-block min-w-[28px] rounded-md px-2 py-0.5 text-center font-medium ${
                            count === 0
                              ? 'bg-zinc-800 text-zinc-500'
                              : 'bg-violet-950/80 text-violet-200'
                          }`}
                        >
                          {count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usageQuery && usageFiltered.length === 0 ? (
              <p className="text-center text-sm text-zinc-500">Nenhuma música encontrada.</p>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}
