import type { Setlist, Song } from '../../types/models'
import { SEED_SETLISTS, SEED_SONGS } from '../../data/seed'
import type { PersistenceAdapter } from './types'

const KEY_SONGS = 'setlistcreator:songs:v1'
const KEY_SETLISTS = 'setlistcreator:setlists:v1'

function migrateSong(raw: Song): Song {
  return {
    ...raw,
    apelido: raw.apelido ?? '',
  }
}

function readSongs(): Song[] {
  try {
    const raw = localStorage.getItem(KEY_SONGS)
    if (!raw) return [...SEED_SONGS]
    const parsed = JSON.parse(raw) as Song[]
    if (!Array.isArray(parsed) || parsed.length === 0) return [...SEED_SONGS]
    return parsed.map(migrateSong)
  } catch {
    return [...SEED_SONGS]
  }
}

function readSetlists(): Setlist[] {
  try {
    const raw = localStorage.getItem(KEY_SETLISTS)
    if (!raw) return [...SEED_SETLISTS]
    const parsed = JSON.parse(raw) as Setlist[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEED_SETLISTS]
  } catch {
    return [...SEED_SETLISTS]
  }
}

export const localStorageAdapter: PersistenceAdapter = {
  async getSongs() {
    return readSongs()
  },
  async saveSongs(songs: Song[]) {
    localStorage.setItem(KEY_SONGS, JSON.stringify(songs))
  },
  async getSetlists() {
    return readSetlists()
  },
  async saveSetlists(setlists: Setlist[]) {
    localStorage.setItem(KEY_SETLISTS, JSON.stringify(setlists))
  },
}
