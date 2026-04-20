import type { Setlist, Song } from '../../types/models'
import type { PersistenceAdapter } from './types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

function migrateSong(raw: Song): Song {
  return {
    ...raw,
    apelido: raw.apelido ?? '',
  }
}

async function getJsonArray<T>(path: string): Promise<T[]> {
  const response = await fetch(apiUrl(path))
  if (!response.ok) {
    throw new Error(`GET ${path} falhou: ${response.status}`)
  }
  const parsed = (await response.json()) as T[]
  return Array.isArray(parsed) ? parsed : []
}

async function putJsonArray<T>(path: string, payload: T[]): Promise<void> {
  const response = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`PUT ${path} falhou: ${response.status}`)
  }
}

export const apiAdapter: PersistenceAdapter = {
  async getSongs() {
    const songs = await getJsonArray<Song>('/api/songs')
    return songs.map(migrateSong)
  },
  async saveSongs(songs: Song[]) {
    await putJsonArray('/api/songs', songs)
  },
  async getSetlists() {
    return getJsonArray<Setlist>('/api/setlists')
  },
  async saveSetlists(setlists: Setlist[]) {
    await putJsonArray('/api/setlists', setlists)
  },
}
