import type { Song } from '../types/models'

type Raw = {
  artista: string
  musica: string
  decada: string
  tipo: string
  voz: string
  violao: string
  guitarra: string
}

const dash = (s: string) => (s?.trim() ? s.trim() : '-')

/** Linhas na ordem do cadastro (artista, música, década, tipo, voz, violão, guitarra). */
const RAW: Raw[] = [
  { artista: 'Djavan', musica: 'Se', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: 'Abel', guitarra: '' },
  { artista: 'Titãs', musica: 'Para Dizer Adeus', decada: '90', tipo: 'Nacional', voz: 'Abel', violao: 'Abel', guitarra: '' },
  { artista: 'Legião Urbana', musica: 'Há Tempos', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: 'Abel', guitarra: '' },
  { artista: 'Roy Orbison', musica: 'You Got It', decada: '80', tipo: 'Internacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Roy Orbison', musica: 'Oh, Pretty Woman', decada: '60', tipo: 'Internacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Ritchie', musica: 'Menina Veneno', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'The Beatles', musica: 'Help!', decada: '60', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'Creedence Clearwater Revival', musica: 'Have You Ever Seen the Rain?', decada: '70', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'Creedence Clearwater Revival', musica: 'Proud Mary', decada: '60', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'Shocking Blue', musica: 'Venus', decada: '60', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'The Beatles', musica: 'All My Loving', decada: '60', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'Elvis Presley', musica: 'Suspicious Minds', decada: '60', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'U2', musica: 'Pride (In the Name of Love)', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: 'Pearl Jam', musica: 'Last Kiss', decada: '90', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: 'Pearl Jam', musica: 'Soldier of Love', decada: '90', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: 'Stone Temple Pilots', musica: 'Plush', decada: '90', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'R.E.M.', musica: 'Losing My Religion', decada: '90', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'Dire Straits', musica: 'Walk of Life', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'Santana', musica: 'Corazón Espinado', decada: '90', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'Kenny Loggins', musica: 'Footloose', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: 'Os Paralamas do Sucesso', musica: 'Meu Erro', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: 'Abel', guitarra: '' },
  { artista: 'Jota Quest', musica: 'Do Seu Lado', decada: '2000', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Tim Maia', musica: 'Não Quero Dinheiro (Só Quero Amar)', decada: '70', tipo: 'Nacional', voz: 'Abel', violao: 'Abel', guitarra: '' },
  { artista: 'Cazuza', musica: 'Exagerado', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Lulu Santos', musica: 'Toda Forma de Amor', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Legião Urbana', musica: 'Tempo Perdido', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Capital Inicial', musica: 'Primeiros Erros (Chove)', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: 'Abel', guitarra: '' },
  { artista: 'Ira!', musica: 'Envelheço na Cidade', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Roupa Nova', musica: 'Whisky a Go Go', decada: '80', tipo: 'Nacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: 'Los Hermanos', musica: 'Anna Júlia', decada: '2000', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'The Cure', musica: 'In Between Days', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'Midnight Oil', musica: 'Beds Are Burning', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'Morrissey', musica: 'Suedehead', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'Billy Idol', musica: 'Rebel Yell', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: "Guns N' Roses", musica: "Knockin' on Heaven's Door", decada: '90', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'Dire Straits', musica: 'Money for Nothing', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: 'Maskavo', musica: 'Anjo do Céu', decada: '2000', tipo: 'Nacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
  { artista: 'Raul Seixas', musica: 'Como Vovó Já Dizia', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Legião Urbana', musica: 'Será', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'RPM', musica: 'Rádio Pirata', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Ultraje a Rigor', musica: 'Ciúme', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Raimundos', musica: 'Mulher de Fases', decada: '90', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'Charlie Brown Jr.', musica: 'Proibida Pra Mim (Grazon)', decada: '2000', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: '' },
  { artista: 'CPM 22', musica: 'Dias Atrás', decada: '2000', tipo: 'Nacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'NX Zero', musica: 'Razões e Emoções', decada: '2000', tipo: 'Nacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'Plebe Rude', musica: 'Até Quando Esperar', decada: '80', tipo: 'Nacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'Billy Idol', musica: 'Dancing with Myself', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'Talking Heads', musica: 'Psycho Killer', decada: '70', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: 'The Clash', musica: 'Should I Stay or Should I Go', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: 'The Doors', musica: 'Roadhouse Blues', decada: '70', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: 'Pink Floyd', musica: 'Another Brick in the Wall, Part II', decada: '70', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'Steppenwolf', musica: 'Born to Be Wild', decada: '60', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: '' },
  { artista: 'Kid Abelha', musica: 'Pintura Íntima', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: '', guitarra: 'Marquinho' },
  { artista: 'Dire Straits', musica: 'Sultans of Swing', decada: '70', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'The Pretenders', musica: 'Back on the Chain Gang', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'Charlie Brown Jr.', musica: 'Zóio de Lula', decada: '2000', tipo: 'Nacional', voz: 'Abel', violao: 'Abel', guitarra: '' },
  { artista: 'Raul Seixas', musica: 'Cowboy Fora da Lei', decada: '80', tipo: 'Nacional', voz: 'Abel', violao: 'Abel', guitarra: '' },
  { artista: 'Erasure', musica: 'A Little Respect', decada: '80', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'Foo Fighters', musica: 'Times Like These', decada: '90', tipo: 'Internacional', voz: 'Marquinho', violao: '', guitarra: 'Marquinho' },
  { artista: 'Lynyrd Skynyrd', musica: 'Sweet Home Alabama', decada: '70', tipo: 'Internacional', voz: 'Marquinho', violao: 'Marquinho', guitarra: '' },
]

export function buildCatalogueSongs(now: () => string): Song[] {
  const t = now()
  return RAW.map((r, i) => ({
    id: `song-cat-${String(i + 1).padStart(3, '0')}`,
    artista: r.artista.trim(),
    musica: r.musica.trim(),
    apelido:
      r.artista === 'Lynyrd Skynyrd' && r.musica === 'Sweet Home Alabama'
        ? 'ALABAMA'
        : '',
    afinacao: 'Normal',
    estilo: `${r.decada} · ${r.tipo}`,
    baixo: '-',
    bateria: '-',
    guitarra1: dash(r.guitarra),
    guitarra2: '-',
    violao: dash(r.violao),
    voz: dash(r.voz),
    createdAt: t,
    updatedAt: t,
  }))
}
