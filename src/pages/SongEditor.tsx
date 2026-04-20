import { useEffect, useState } from 'react'
import { Link, useMatch, useNavigate, useParams } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import type { Song } from '../types/models'

const empty: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> = {
  artista: '',
  musica: '',
  apelido: '',
  afinacao: '',
  estilo: '',
  baixo: '',
  bateria: '',
  guitarra1: '',
  guitarra2: '',
  violao: '',
  voz: '',
  duracaoMinutos: undefined,
  favorita: false,
}

const fields: { key: keyof typeof empty; label: string }[] = [
  { key: 'artista', label: 'Artista' },
  { key: 'musica', label: 'Música' },
  { key: 'apelido', label: 'Apelido (como chamamos no palco)' },
  { key: 'afinacao', label: 'Afinação' },
  { key: 'estilo', label: 'Estilo' },
  { key: 'baixo', label: 'Baixo' },
  { key: 'bateria', label: 'Bateria' },
  { key: 'guitarra1', label: 'Guitarra 1' },
  { key: 'guitarra2', label: 'Guitarra 2' },
  { key: 'violao', label: 'Violão' },
  { key: 'voz', label: 'Voz' },
]

export function SongEditor() {
  const isNew = useMatch({ path: '/biblioteca/nova', end: true }) != null
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getSong, addSong, updateSong } = useAppData()
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (isNew) {
      setForm(empty)
      return
    }
    if (!id) return
    const s = getSong(id)
    if (s) {
      setForm({
        artista: s.artista,
        musica: s.musica,
        apelido: s.apelido ?? '',
        afinacao: s.afinacao,
        estilo: s.estilo,
        baixo: s.baixo,
        bateria: s.bateria,
        guitarra1: s.guitarra1,
        guitarra2: s.guitarra2,
        violao: s.violao,
        voz: s.voz,
        duracaoMinutos: s.duracaoMinutos,
        favorita: s.favorita ?? false,
      })
    }
  }, [id, isNew, getSong])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.musica.trim()) {
      alert('Informe o nome da música.')
      return
    }
    if (isNew) {
      addSong(form)
    } else if (id) {
      updateSong(id, form)
    }
    navigate('/biblioteca')
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link to="/biblioteca" className="text-sm text-violet-400 hover:text-violet-300">
          ← Biblioteca
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {isNew ? 'Nova música' : 'Editar música'}
        </h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {fields.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {label}
            </span>
            <input
              type="text"
              value={String(form[key] ?? '')}
              onChange={(e) =>
                setForm((f) => ({ ...f, [key]: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white"
            />
          </label>
        ))}
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Duração estimada (min)
          </span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={form.duracaoMinutos ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                duracaoMinutos: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              }))
            }
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white"
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={form.favorita ?? false}
            onChange={(e) =>
              setForm((f) => ({ ...f, favorita: e.target.checked }))
            }
            className="h-5 w-5 rounded border-zinc-600"
          />
          <span className="text-sm text-zinc-300">Favorita</span>
        </label>

        <button
          type="submit"
          className="min-h-[48px] w-full rounded-xl bg-violet-600 py-3 font-medium text-white hover:bg-violet-500"
        >
          Salvar
        </button>
      </form>
    </div>
  )
}
