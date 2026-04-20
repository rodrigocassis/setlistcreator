import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function Setlists() {
  const navigate = useNavigate()
  const {
    setlists,
    deleteSetlist,
    duplicateSetlist,
    replaceSetlists,
    exportSetlistsJson,
    loading,
  } = useAppData()

  const downloadSetlistsExport = () => {
    const blob = new Blob([exportSetlistsJson()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `setlists-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importSetlists = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        const arr = Array.isArray(data) ? data : data.setlists
        if (!Array.isArray(arr)) throw new Error('inválido')
        const t = new Date().toISOString()
        const merged = new Map(setlists.map((s) => [s.id, s]))
        for (const raw of arr) {
          const id = typeof raw.id === 'string' ? raw.id : crypto.randomUUID()
          merged.set(id, {
            id,
            nome: String(raw.nome ?? 'Sem nome'),
            data: raw.data ? String(raw.data) : undefined,
            local: raw.local ? String(raw.local) : undefined,
            blocos: ((): 1 | 2 | 3 => {
              const b = Number(raw.blocos)
              return b === 1 || b === 2 || b === 3 ? b : 2
            })(),
            bloco1: Array.isArray(raw.bloco1) ? raw.bloco1 : raw.setlist?.bloco1 ?? [],
            bloco2: Array.isArray(raw.bloco2) ? raw.bloco2 : raw.setlist?.bloco2 ?? [],
            bloco3: Array.isArray(raw.bloco3) ? raw.bloco3 : raw.setlist?.bloco3 ?? [],
            backup: Array.isArray(raw.backup) ? raw.backup : raw.setlist?.backup ?? [],
            observacoes: raw.observacoes ? String(raw.observacoes) : undefined,
            createdAt: String(raw.createdAt ?? t),
            updatedAt: t,
          })
        }
        replaceSetlists([...merged.values()])
      } catch {
        alert('JSON de setlists inválido')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (loading) return <p className="text-zinc-500">Carregando…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Setlists</h1>
          <p className="text-sm text-zinc-500">Abrir, duplicar, PDF ou excluir</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800">
            Importar JSON
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={importSetlists}
            />
          </label>
          <button
            type="button"
            onClick={downloadSetlistsExport}
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            Exportar JSON
          </button>
          <Link
            to="/setlists/novo"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-violet-600 px-4 font-medium text-white hover:bg-violet-500"
          >
            + Novo setlist
          </Link>
        </div>
      </div>

      <ul className="space-y-3">
        {setlists.map((sl) => (
          <li
            key={sl.id}
            className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-semibold text-white">{sl.nome}</p>
              <p className="text-sm text-zinc-500">
                {sl.blocos} bloco(s)
                {sl.data ? ` · ${sl.data}` : ''}
                {sl.local ? ` · ${sl.local}` : ''}
              </p>
            </div>
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
              <Link
                to={`/setlists/${sl.id}/editar`}
                title="Editar setlist"
                aria-label="Editar setlist"
                className="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg bg-zinc-800 px-2.5 py-1.5 text-sm font-medium text-white"
              >
                ✏️
              </Link>
              <button
                type="button"
                onClick={() => {
                  const copy = duplicateSetlist(sl.id)
                  if (copy) navigate(`/setlists/${copy.id}/editar`)
                }}
                title="Duplicar setlist"
                aria-label="Duplicar setlist"
                className="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg border border-zinc-600 px-2.5 py-1.5 text-sm text-zinc-300"
              >
                📄
              </button>
              <Link
                to={`/setlists/${sl.id}/preview`}
                title="Prévia / PDF"
                aria-label="Prévia e PDF"
                className="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg border border-violet-600/50 px-2.5 py-1.5 text-sm text-violet-300"
              >
                👁️
              </Link>
              <button
                type="button"
                onClick={() =>
                  confirm(`Excluir "${sl.nome}"?`) && deleteSetlist(sl.id)
                }
                title="Excluir setlist"
                aria-label="Excluir setlist"
                className="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg border border-red-900/50 px-2.5 py-1.5 text-sm text-red-400"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      {setlists.length === 0 ? (
        <p className="text-center text-zinc-500">
          Nenhum setlist ainda.{' '}
          <Link to="/setlists/novo" className="text-violet-400">
            Criar o primeiro
          </Link>
        </p>
      ) : null}
    </div>
  )
}
