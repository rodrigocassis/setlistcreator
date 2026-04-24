import type { ReactNode } from 'react'
import type { Song } from '../../types/models'
import avatarAbel from '../../assets/avatar-abel.png'
import avatarMarquinho from '../../assets/avatar-marquinho.png'
import avatarNuma from '../../assets/avatar-numa.png'
import avatarRodrigo from '../../assets/avatar-rodrigo.png'
import iconBaixo from '../../assets/icon-baixo.png'
import iconBateria from '../../assets/icon-bateria.png'
import iconGuitarra1 from '../../assets/icon-guitarra.png'
import iconGuitarra2 from '../../assets/icon-guitarra-2.png'
import iconViolao from '../../assets/icon-violao.png'
import { FORMATION_KEYS, type FormationKey } from '../../utils/setlistTransitions'

function partActive(s: string | undefined): boolean {
  const t = (s ?? '').trim()
  if (!t || t === '-' || t.toLowerCase() === 'n/a') return false
  return true
}

function playerHue(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i += 1) h = (h * 33 + name.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}

function firstNameToken(name: string): string {
  return name.trim().toLowerCase().split(/\s+/)[0] ?? ''
}

/** Nome do músico no cadastro (voz, instrumento, etc.) — bate com primeiro token. */
function isAbelMention(name: string): boolean {
  const t = name.trim().toLowerCase()
  if (!t) return false
  if (t === 'abel') return true
  return firstNameToken(name) === 'abel'
}

function isNumaMention(name: string): boolean {
  const t = name.trim().toLowerCase()
  if (!t) return false
  if (t === 'numa') return true
  return firstNameToken(name) === 'numa'
}

function isRodrigoMention(name: string): boolean {
  const t = name.trim().toLowerCase()
  if (!t) return false
  if (t === 'rodrigo') return true
  return firstNameToken(name) === 'rodrigo'
}

function isMarquinhoMention(name: string): boolean {
  const t = name.trim().toLowerCase()
  if (!t) return false
  if (t === 'marquinho' || t === 'marcos') return true
  const first = firstNameToken(name)
  return first === 'marquinho' || first === 'marcos'
}

function avatarForPersonName(name: string): string | null {
  if (isAbelMention(name)) return avatarAbel
  if (isMarquinhoMention(name)) return avatarMarquinho
  if (isNumaMention(name)) return avatarNuma
  if (isRodrigoMention(name)) return avatarRodrigo
  return null
}

function IconMic({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

/** Imagem fornecida pelo usuário — violão (formato alongado, cabe no chip). */
function ImgViolao() {
  return (
    <img
      src={iconViolao}
      alt=""
      className="h-4 w-3.5 shrink-0 object-contain"
      width={14}
      height={16}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  )
}

/**
 * Guitarra 1: Strat; guitarra 2: ícone dedicado (teclado controlador no asset).
 * Sufixo 1/2 no canto.
 */
function ImgGuitarra({ suffix }: { suffix: '1' | '2' }) {
  const isG1 = suffix === '1'
  const src = isG1 ? iconGuitarra1 : iconGuitarra2
  return (
    <span className="relative inline-flex shrink-0" aria-hidden>
      <img
        src={src}
        alt=""
        className={
          isG1
            ? 'h-4 w-3.5 object-contain'
            : 'h-3.5 w-[1.4rem] object-contain'
        }
        width={isG1 ? 14 : 22}
        height={isG1 ? 16 : 14}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 min-w-[10px] items-center justify-center rounded bg-zinc-900 px-0.5 text-[7px] font-bold leading-none text-violet-300">
        {suffix}
      </span>
    </span>
  )
}

/** Imagem fornecida pelo usuário — baixo elétrico (sunburst). */
function ImgBaixo() {
  return (
    <img
      src={iconBaixo}
      alt=""
      className="h-4 w-3.5 shrink-0 object-contain"
      width={14}
      height={16}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  )
}

/** Imagem fornecida pelo usuário — bateria (formato largo). */
function ImgBateria() {
  return (
    <img
      src={iconBateria}
      alt=""
      className="h-3.5 w-[1.35rem] shrink-0 object-contain"
      width={22}
      height={14}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  )
}

function IconPessoa({ className, name }: { className?: string; name: string }) {
  const photo = avatarForPersonName(name)
  if (photo) {
    return (
      <span
        className={`inline-block h-4 w-4 shrink-0 overflow-hidden rounded-full ring-1 ring-zinc-600/60 ${className ?? ''}`}
        title={name}
      >
        <img
          src={photo}
          alt=""
          className="h-full w-full object-cover object-top"
          width={16}
          height={16}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </span>
    )
  }
  const bg = `hsl(${playerHue(name)} 38% 40%)`
  return (
    <span
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-1 ring-zinc-600/60 ${className ?? ''}`}
      style={{ backgroundColor: bg }}
      title={name}
    >
      <svg
        className="h-2.5 w-2.5 text-white/95"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </span>
  )
}

const SLOT: Record<
  FormationKey,
  { label: string; render: (cn: string) => ReactNode }
> = {
  voz: { label: 'Voz', render: (cn) => <IconMic className={cn} /> },
  violao: { label: 'Violão', render: () => <ImgViolao /> },
  guitarra1: {
    label: 'Guitarra 1',
    render: () => <ImgGuitarra suffix="1" />,
  },
  guitarra2: {
    label: 'Guitarra 2',
    render: () => <ImgGuitarra suffix="2" />,
  },
  baixo: { label: 'Baixo', render: () => <ImgBaixo /> },
  bateria: { label: 'Bateria', render: () => <ImgBateria /> },
}

const iconCN = 'h-3.5 w-3.5 shrink-0 text-violet-300/95'

type Props = {
  song: Song
  /** Menos padding em biblioteca compacta / overlay */
  dense?: boolean
  className?: string
}

export function SongCardFormation({ song, dense, className }: Props) {
  const active = FORMATION_KEYS.filter((k) => partActive(song[k] as string))
  if (active.length === 0) return null

  return (
    <ul
      className={`flex flex-wrap items-center gap-1 ${dense ? 'mt-1' : 'mt-1.5'} ${className ?? ''}`}
      role="list"
      aria-label="Formação no palco"
    >
      {active.map((k) => {
        const name = String(song[k as keyof Song] ?? '').trim()
        const { label, render } = SLOT[k]
        return (
          <li
            key={k}
            className={`inline-flex items-center gap-1 rounded-md border border-zinc-600/70 bg-zinc-950/50 ${dense ? 'px-1 py-0.5' : 'px-1.5 py-0.5'}`}
            title={`${label}: ${name}`}
          >
            <span className="text-zinc-500" aria-hidden>
              {render(iconCN)}
            </span>
            <span className="sr-only">
              {label}: {name}
            </span>
            <IconPessoa name={name} />
          </li>
        )
      })}
    </ul>
  )
}
