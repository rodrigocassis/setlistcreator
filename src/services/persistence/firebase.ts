import { initializeApp } from 'firebase/app'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { SEED_SETLISTS, SEED_SONGS } from '../../data/seed'
import type { Setlist, Song } from '../../types/models'
import type { PersistenceAdapter } from './types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredConfigKeys = Object.entries(firebaseConfig)

export function isFirebaseConfigured(): boolean {
  return requiredConfigKeys.every(([, value]) => Boolean(value))
}

const app = isFirebaseConfigured() ? initializeApp(firebaseConfig) : null
const db = app ? getFirestore(app) : null

const songsDoc = db ? doc(db, 'setlistcreator', 'songs') : null
const setlistsDoc = db ? doc(db, 'setlistcreator', 'setlists') : null

function migrateSong(raw: Song): Song {
  return {
    ...raw,
    apelido: raw.apelido ?? '',
  }
}

function ensureFirebaseConfigured(): void {
  if (!db || !songsDoc || !setlistsDoc) {
    throw new Error(
      'Firebase nao configurado. Defina as variaveis VITE_FIREBASE_* no ambiente.',
    )
  }
}

function getRefs() {
  ensureFirebaseConfigured()
  return {
    songsDoc: songsDoc as NonNullable<typeof songsDoc>,
    setlistsDoc: setlistsDoc as NonNullable<typeof setlistsDoc>,
  }
}

async function readArrayDoc<T>(kind: 'songs' | 'setlists'): Promise<T[]> {
  const refs = getRefs()
  const ref = kind === 'songs' ? refs.songsDoc : refs.setlistsDoc
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return []
  const data = snapshot.data() as { items?: T[] }
  return Array.isArray(data.items) ? data.items : []
}

async function writeArrayDoc<T>(kind: 'songs' | 'setlists', items: T[]): Promise<void> {
  const refs = getRefs()
  const ref = kind === 'songs' ? refs.songsDoc : refs.setlistsDoc
  await setDoc(ref, { items, updatedAt: Date.now() }, { merge: true })
}

export const firebaseAdapter: PersistenceAdapter = {
  async getSongs() {
    const items = await readArrayDoc<Song>('songs')
    const data = items.length > 0 ? items : [...SEED_SONGS]
    return data.map(migrateSong)
  },
  async saveSongs(songs: Song[]) {
    await writeArrayDoc('songs', songs)
  },
  async getSetlists() {
    const items = await readArrayDoc<Setlist>('setlists')
    return items.length > 0 ? items : [...SEED_SETLISTS]
  },
  async saveSetlists(setlists: Setlist[]) {
    await writeArrayDoc('setlists', setlists)
  },
}
