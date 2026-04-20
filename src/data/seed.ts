import type { Setlist, Song } from '../types/models'
import { buildCatalogueSongs } from './buildCatalogue'

const now = () => new Date().toISOString()

/** Catálogo inicial: lista enviada (década + tipo em `estilo`, voz/violão/guitarra). */
export const SEED_SONGS: Song[] = buildCatalogueSongs(now)

export const SEED_SETLISTS: Setlist[] = [
  {
    id: 'sl-1',
    nome: 'Show Bar do Zé (exemplo)',
    data: '2026-04-20',
    local: 'São Paulo',
    blocos: 2,
    bloco1: ['song-cat-001', 'song-cat-002', 'song-cat-003'],
    bloco2: ['song-cat-010', 'song-cat-020'],
    bloco3: [],
    backup: ['song-cat-060'],
    observacoes: 'Levar violão afinado em D',
    createdAt: now(),
    updatedAt: now(),
  },
]
