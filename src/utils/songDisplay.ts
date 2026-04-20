import type { Song } from '../types/models'

/** Rótulo usado no palco / listas (apelido ou título da obra). */
export function songPalcoLabel(song: Song): string {
  return (song.apelido?.trim() || song.musica || '').trim()
}

/** Texto do PDF: apelido (ou música) em caixa alta. */
export function songPdfTitle(song: Song): string {
  return songPalcoLabel(song).toUpperCase()
}
