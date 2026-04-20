import type { Setlist } from '../types/models'

/** Quantas vezes o id aparece em blocos/backup em todos os setlists (cada ocorrência conta). */
export function countSongOccurrencesInSetlists(
  songId: string,
  setlists: Setlist[],
): number {
  let n = 0
  for (const sl of setlists) {
    for (const id of [
      ...sl.bloco1,
      ...sl.bloco2,
      ...sl.bloco3,
      ...sl.backup,
    ]) {
      if (id === songId) n += 1
    }
  }
  return n
}
