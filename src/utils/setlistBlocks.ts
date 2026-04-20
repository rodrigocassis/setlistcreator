import type { Setlist } from '../types/models'

const iso = () => new Date().toISOString()

/** Ao mudar quantidade de blocos, reorganiza arrays (reduz: funde blocos inferiores no superior). */
export function adjustSetlistBlocos(setlist: Setlist, next: 1 | 2 | 3): Setlist {
  if (setlist.blocos === next) {
    return { ...setlist, updatedAt: iso() }
  }

  let b1 = [...setlist.bloco1]
  let b2 = [...setlist.bloco2]
  let b3 = [...setlist.bloco3]

  if (next < setlist.blocos) {
    if (next === 1) {
      b1 = [...b1, ...b2, ...b3]
      b2 = []
      b3 = []
    } else if (next === 2 && setlist.blocos === 3) {
      b2 = [...b2, ...b3]
      b3 = []
    }
  }

  return {
    ...setlist,
    blocos: next,
    bloco1: b1,
    bloco2: b2,
    bloco3: b3,
    updatedAt: iso(),
  }
}
