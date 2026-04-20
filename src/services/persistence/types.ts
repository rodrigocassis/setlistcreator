import type { Setlist, Song } from '../../types/models'

/**
 * Contrato para trocar implementação (localStorage → Firebase).
 * Implementações futuras: firebaseAdapter.ts
 */
export type PersistenceAdapter = {
  getSongs: () => Promise<Song[]>
  saveSongs: (songs: Song[]) => Promise<void>
  getSetlists: () => Promise<Setlist[]>
  saveSetlists: (setlists: Setlist[]) => Promise<void>
}
