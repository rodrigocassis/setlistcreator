/** Modelo de música (cadastro completo) */
export type Song = {
  id: string
  artista: string
  musica: string
  /** Nome curto usado no palco / PDF (ex.: ALABAMA). Se vazio, usa-se "musica". */
  apelido: string
  afinacao: string
  estilo: string
  baixo: string
  bateria: string
  guitarra1: string
  guitarra2: string
  violao: string
  voz: string
  /** minutos — opcional, para estimativa do set */
  duracaoMinutos?: number
  favorita?: boolean
  createdAt: string
  updatedAt: string
}

/** Setlist persistido */
export type Setlist = {
  id: string
  nome: string
  data?: string
  local?: string
  blocos: 1 | 2 | 3
  bloco1: string[]
  bloco2: string[]
  bloco3: string[]
  backup: string[]
  observacoes?: string
  createdAt: string
  updatedAt: string
}

export type PdfMode = 'simples' | 'completo'
