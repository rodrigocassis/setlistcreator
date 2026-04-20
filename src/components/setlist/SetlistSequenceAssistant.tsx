import type { Song } from '../../types/models'
import { lastSongInColumn, rankFollowUpSongs } from '../../utils/setlistTransitions'
import { songPalcoLabel } from '../../utils/songDisplay'

type Col = 'bloco1' | 'bloco2' | 'bloco3'

type ItemsShape = {
  library?: string[]
  bloco1?: string[]
  bloco2?: string[]
  bloco3?: string[]
  backup?: string[]
}

type Props = {
  items: ItemsShape
  songsById: Record<string, Song | undefined>
  libraryIds: string[]
  nBlocos: 1 | 2 | 3
  onAddSuggested: (songId: string, column: Col) => void
}

const COL_LABEL: Record<Col, string> = {
  bloco1: 'Bloco 1',
  bloco2: 'Bloco 2',
  bloco3: 'Bloco 3',
}

export function SetlistSequenceAssistant({
  items,
  songsById,
  libraryIds,
  nBlocos,
  onAddSuggested,
}: Props) {
  const columns: Col[] = []
  columns.push('bloco1')
  if (nBlocos >= 2) columns.push('bloco2')
  if (nBlocos >= 3) columns.push('bloco3')

  return (
    <section
      className="rounded-2xl border border-violet-900/40 bg-violet-950/25 p-3"
      aria-label="Assistente de sequência"
    >
      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-semibold text-violet-200">Assistente de sequência</span>
        <span className="text-xs text-violet-400/90">
          Sugestões com menos troca de formação e estilo parecido (baseado na última música de cada
          bloco).
        </span>
      </div>
      <div className="space-y-3">
        {columns.map((col) => {
          const refSong = lastSongInColumn(col, items, songsById, nBlocos)
          const ranked = rankFollowUpSongs(refSong, libraryIds, songsById, 4)
          return (
            <div key={col}>
              <p className="mb-1.5 text-xs font-medium text-zinc-400">
                {COL_LABEL[col]}
                {refSong ? (
                  <>
                    {' '}
                    <span className="font-normal text-zinc-500">
                      (depois de «{songPalcoLabel(refSong)}»)
                    </span>
                  </>
                ) : (
                  <span className="font-normal text-zinc-500"> — adicione uma música para refinar</span>
                )}
              </p>
              {ranked.length === 0 ? (
                <p className="text-xs text-zinc-600">Nenhuma música disponível na biblioteca.</p>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {ranked.map(({ id, cost }) => {
                    const s = songsById[id]
                    if (!s) return null
                    return (
                      <li key={`${col}-${id}`}>
                        <button
                          type="button"
                          onClick={() => onAddSuggested(id, col)}
                          className="max-w-[220px] truncate rounded-lg border border-violet-700/50 bg-zinc-900/80 px-2.5 py-1 text-left text-xs text-zinc-100 hover:border-violet-500 hover:bg-zinc-800"
                          title={`Custo de transição: ${cost} (menor = menos trocas)`}
                        >
                          <span className="font-medium">{songPalcoLabel(s)}</span>
                          <span className="block truncate text-[10px] text-zinc-500">
                            {s.estilo?.trim() || '—'} · custo {cost}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
