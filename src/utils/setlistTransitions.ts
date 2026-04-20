import type { Song } from '../types/models'

/** Papéis na formação (quem toca o quê) — usados para medir trocas entre músicas. */
export const FORMATION_KEYS = [
  'voz',
  'violao',
  'guitarra1',
  'guitarra2',
  'baixo',
  'bateria',
] as const

export type FormationKey = (typeof FORMATION_KEYS)[number]

const SLOT_LABEL_PT: Record<FormationKey, string> = {
  voz: 'voz',
  violao: 'violão',
  guitarra1: 'guitarra 1',
  guitarra2: 'guitarra 2',
  baixo: 'baixo',
  bateria: 'bateria',
}

/** Nome exibido na frase (cadastro); vazio vira “ninguém”. */
function quemNaLinha(s: string | undefined): string {
  const t = (s ?? '').trim()
  if (!t || t === '-') return 'ninguém'
  return t
}

export function normalizePart(s: string | undefined): string {
  const t = (s ?? '').trim().toLowerCase()
  if (!t || t === '-') return ''
  return t
}

/** Quantidade de linhas da formação em que o responsável muda (inclui vazio ↔ preenchido). */
export function countFormationChanges(a: Song, b: Song): number {
  let n = 0
  for (const k of FORMATION_KEYS) {
    const pa = normalizePart(a[k as keyof Song] as string)
    const pb = normalizePart(b[k as keyof Song] as string)
    if (pa !== pb) n += 1
  }
  return n
}

/** Mesmo estilo (normalizado); se ambos vazios, considera compatível. */
export function sameStyle(a: Song, b: Song): boolean {
  const ea = normalizePart(a.estilo)
  const eb = normalizePart(b.estilo)
  if (!ea && !eb) return true
  return ea === eb
}

/** Menor = transição mais suave (menos trocas + estilo alinhado). */
export function transitionCost(prev: Song | null, next: Song): number {
  if (!prev) return 0
  const fc = countFormationChanges(prev, next)
  const stylePenalty = sameStyle(prev, next) ? 0 : 4
  return fc * 2 + stylePenalty
}

/** Trecho curto por linha que mudou (ex.: “Marquinho → Abel no baixo”). */
function formationChangePhrases(prev: Song, next: Song): string[] {
  const out: string[] = []
  for (const k of FORMATION_KEYS) {
    const pa = normalizePart(prev[k as keyof Song] as string)
    const pb = normalizePart(next[k as keyof Song] as string)
    if (pa === pb) continue
    const slot = SLOT_LABEL_PT[k]
    const a = quemNaLinha(prev[k as keyof Song] as string)
    const b = quemNaLinha(next[k as keyof Song] as string)
    if (a === 'ninguém' && b !== 'ninguém') {
      out.push(`entra ${b} no ${slot} (ninguém antes)`)
    } else if (b === 'ninguém' && a !== 'ninguém') {
      out.push(`${a} sai do ${slot}`)
    } else {
      out.push(`${a} → ${b} no ${slot}`)
    }
  }
  return out
}

export function transitionMessages(prev: Song | null, next: Song): string[] {
  const msgs: string[] = []
  if (!prev) return msgs

  const phrases = formationChangePhrases(prev, next)
  const fc = phrases.length

  if (fc === 1) {
    msgs.push(`Formação: ${phrases[0]}.`)
  } else if (fc === 2) {
    msgs.push(
      `Formação: ${phrases[0]} e ${phrases[1]} — duas trocas seguidas; muita movimentação entre uma música e outra.`,
    )
  } else if (fc >= 3) {
    const resumo = phrases.slice(0, 3).join('; ')
    const extra = fc > 3 ? ` (+${fc - 3} outra(s))` : ''
    msgs.push(
      `Problema na formação: ${fc} mudanças${extra} (${resumo}). Muita ida e volta de microfone/instrumento na sequência.`,
    )
  }

  if (!sameStyle(prev, next)) {
    const ea = prev.estilo?.trim()
    const eb = next.estilo?.trim()
    if (ea || eb) {
      msgs.push(`Estilo muda de «${ea || '?'}» para «${eb || '?'}».`)
    }
  }

  return msgs
}

export type DndItemsShape = {
  library?: string[]
  bloco1?: string[]
  bloco2?: string[]
  bloco3?: string[]
  backup?: string[]
}

const ORDER_BLOCOS = ['bloco1', 'bloco2', 'bloco3'] as const

/** Música imediatamente antes de `songId` na ordem do show (mesmo bloco ou fim do bloco anterior). */
export function findPreviousSongInShow(
  songId: string,
  items: DndItemsShape,
  songsById: Record<string, Song | undefined>,
  nBlocos: 1 | 2 | 3,
): Song | null {
  for (let bi = 0; bi < ORDER_BLOCOS.length; bi++) {
    const key = ORDER_BLOCOS[bi]
    if (nBlocos === 1 && key !== 'bloco1') continue
    if (nBlocos === 2 && key === 'bloco3') continue

    const arr = items[key] ?? []
    const idx = arr.indexOf(songId)
    if (idx < 0) continue

    if (idx > 0) {
      const sid = arr[idx - 1]
      return songsById[sid] ?? null
    }

    if (key === 'bloco2') {
      const b1 = items.bloco1 ?? []
      if (b1.length) return songsById[b1[b1.length - 1]] ?? null
    }
    if (key === 'bloco3') {
      if (nBlocos >= 2) {
        const b2 = items.bloco2 ?? []
        if (b2.length) return songsById[b2[b2.length - 1]] ?? null
      }
      const b1 = items.bloco1 ?? []
      if (b1.length) return songsById[b1[b1.length - 1]] ?? null
    }
    return null
  }

  const backup = items.backup ?? []
  const idx = backup.indexOf(songId)
  if (idx < 0) return null
  if (idx > 0) return songsById[backup[idx - 1]] ?? null

  for (let bi = ORDER_BLOCOS.length - 1; bi >= 0; bi--) {
    const key = ORDER_BLOCOS[bi]
    if (nBlocos === 1 && key !== 'bloco1') continue
    if (nBlocos === 2 && key === 'bloco3') continue
    const arr = items[key] ?? []
    if (arr.length) return songsById[arr[arr.length - 1]] ?? null
  }
  return null
}

/** Última música de um bloco (referência para sugestões “a seguir”). */
export function lastSongInColumn(
  column: 'bloco1' | 'bloco2' | 'bloco3',
  items: DndItemsShape,
  songsById: Record<string, Song | undefined>,
  nBlocos: 1 | 2 | 3,
): Song | null {
  if (nBlocos === 1 && column !== 'bloco1') return null
  if (nBlocos === 2 && column === 'bloco3') return null

  const arr = items[column] ?? []
  if (arr.length === 0) {
    if (column === 'bloco2') return lastSongInColumn('bloco1', items, songsById, nBlocos)
    if (column === 'bloco3') {
      if (nBlocos >= 2) {
        const b2 = lastSongInColumn('bloco2', items, songsById, nBlocos)
        if (b2) return b2
      }
      return lastSongInColumn('bloco1', items, songsById, nBlocos)
    }
    return null
  }
  const sid = arr[arr.length - 1]
  return songsById[sid] ?? null
}

export function rankFollowUpSongs(
  reference: Song | null,
  libraryIds: string[],
  songsById: Record<string, Song | undefined>,
  limit: number,
): { id: string; cost: number }[] {
  const scored = libraryIds
    .map((id) => {
      const s = songsById[id]
      if (!s) return null
      return { id, cost: reference ? transitionCost(reference, s) : 0 }
    })
    .filter((x): x is { id: string; cost: number } => x != null)

  scored.sort((a, b) => a.cost - b.cost)
  return scored.slice(0, limit)
}
