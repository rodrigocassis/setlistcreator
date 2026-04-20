import type { Setlist, Song } from '../types/models'

export function estimateSetlistMinutes(
  setlist: Setlist,
  songsById: Record<string, Song | undefined>,
): number | null {
  const ids = [
    ...setlist.bloco1,
    ...setlist.bloco2,
    ...setlist.bloco3,
    ...setlist.backup,
  ]
  let total = 0
  let any = false
  for (const id of ids) {
    const m = songsById[id]?.duracaoMinutos
    if (typeof m === 'number' && !Number.isNaN(m)) {
      total += m
      any = true
    }
  }
  if (!any) return null
  return Math.round(total * 10) / 10
}
