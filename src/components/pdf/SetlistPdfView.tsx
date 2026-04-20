import type { PdfMode, Setlist, Song } from '../../types/models'
import bandLogoUrl from '../../assets/band-logo.png'
import { songPdfTitle } from '../../utils/songDisplay'

function formatPdfDate(iso: string | undefined): string {
  if (!iso?.trim()) return ''
  const d = new Date(`${iso.trim()}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso.trim()
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

type Props = {
  setlist: Setlist
  songsById: Record<string, Song | undefined>
  mode: PdfMode
  /** modo palco: tipografia maior no wrapper externo */
  stageMode?: boolean
}

function SongLine({
  song,
  mode,
  n,
}: {
  song: Song
  mode: PdfMode
  n: number
}) {
  const tituloPdf = songPdfTitle(song)

  if (mode === 'simples') {
    return (
      <div className="flex gap-2 border-b border-neutral-200 py-1 text-neutral-900">
        <span className="w-7 shrink-0 text-neutral-400 tabular-nums">{n}.</span>
        <span className="font-medium tracking-wide">{tituloPdf}</span>
      </div>
    )
  }
  return (
    <div className="border-b border-neutral-200 py-2 text-neutral-900">
      <div className="flex gap-2">
        <span className="w-7 shrink-0 text-neutral-400 tabular-nums">{n}.</span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold tracking-wide">
            {tituloPdf}{' '}
            <span className="font-normal tracking-normal text-neutral-600">
              — {song.artista}
            </span>
          </div>
          {song.apelido?.trim() ? (
            <p className="mb-1 text-xs text-neutral-500 normal-case">
              Obra: {song.musica}
            </p>
          ) : null}
          <div className="mt-1 grid gap-0.5 text-xs text-neutral-700 sm:grid-cols-2 normal-case">
            <span>Afinação: {song.afinacao}</span>
            <span>Estilo: {song.estilo}</span>
            <span>Baixo: {song.baixo}</span>
            <span>Bateria: {song.bateria}</span>
            <span>Gtr 1: {song.guitarra1}</span>
            <span>Gtr 2: {song.guitarra2}</span>
            <span>Violão: {song.violao}</span>
            <span>Voz: {song.voz}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlockColumn({
  title,
  ids,
  songsById,
  mode,
}: {
  title: string
  ids: string[]
  songsById: Record<string, Song | undefined>
  mode: PdfMode
}) {
  let num = 0
  return (
    <div className="min-w-0 flex-1">
      <h3 className="mb-2 border-b border-neutral-300 pb-1 text-center text-sm font-bold uppercase tracking-wide text-neutral-800">
        {title}
      </h3>
      <div className="space-y-0">
        {ids.map((id) => {
          const song = songsById[id]
          if (!song) return null
          num += 1
          return <SongLine key={id} song={song} mode={mode} n={num} />
        })}
      </div>
    </div>
  )
}

export function SetlistPdfView({ setlist, songsById, mode, stageMode }: Props) {
  const n = setlist.blocos
  const gridCols = n === 1 ? 'grid-cols-1' : n === 2 ? 'grid-cols-2' : 'grid-cols-3'

  let backupNum = 0

  const dataFmt = formatPdfDate(setlist.data)
  const localFmt = setlist.local?.trim() ?? ''
  const metaRight = [dataFmt, localFmt].filter(Boolean).join(' · ')

  return (
    <div
      className={`bg-white text-black ${stageMode ? 'text-lg' : 'text-sm'} print:bg-white`}
    >
      <header className="mb-3 flex items-center gap-2 border-b border-neutral-800 pb-1.5">
        <img
          src={bandLogoUrl}
          alt=""
          width={168}
          height={50}
          className={`shrink-0 object-contain object-left ${
            stageMode ? 'h-[62px] max-h-[62px]' : 'h-[50px] max-h-[50px]'
          } w-auto max-w-[36%]`}
        />
        <h1
          className={`min-w-0 flex-1 text-center font-bold leading-none tracking-tight text-neutral-900 ${
            stageMode ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
          }`}
        >
          <span className="block truncate">{setlist.nome}</span>
        </h1>
        <p
          className={`max-w-[30%] shrink-0 text-right font-medium leading-tight text-neutral-800 ${
            stageMode ? 'text-sm' : 'text-xs'
          }`}
        >
          <span className="block truncate">{metaRight || '\u00A0'}</span>
        </p>
      </header>

      <div className={`grid gap-4 ${gridCols}`}>
        <BlockColumn
          title="Bloco 1"
          ids={setlist.bloco1}
          songsById={songsById}
          mode={mode}
        />
        {n >= 2 ? (
          <BlockColumn
            title="Bloco 2"
            ids={setlist.bloco2}
            songsById={songsById}
            mode={mode}
          />
        ) : null}
        {n >= 3 ? (
          <BlockColumn
            title="Bloco 3"
            ids={setlist.bloco3}
            songsById={songsById}
            mode={mode}
          />
        ) : null}
      </div>

      {setlist.backup.length > 0 ? (
        <section className="mt-8 border-t-2 border-amber-700/40 pt-4">
          <h3 className="mb-2 text-center text-sm font-bold uppercase text-amber-900">
            Backup
          </h3>
          <div className="mx-auto max-w-3xl">
            {setlist.backup.map((id) => {
              const song = songsById[id]
              if (!song) return null
              backupNum += 1
              return <SongLine key={id} song={song} mode={mode} n={backupNum} />
            })}
          </div>
        </section>
      ) : null}

      {setlist.observacoes ? (
        <footer className="mt-8 border-t border-neutral-300 pt-3 text-xs text-neutral-700">
          <strong>Obs.:</strong> {setlist.observacoes}
        </footer>
      ) : null}
    </div>
  )
}
