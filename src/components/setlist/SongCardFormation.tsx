import type { ReactNode } from 'react'
import type { Song } from '../../types/models'
import { FORMATION_KEYS, type FormationKey } from '../../utils/setlistTransitions'

function partActive(s: string | undefined): boolean {
  const t = (s ?? '').trim()
  if (!t || t === '-' || t.toLowerCase() === 'n/a') return false
  return true
}

function playerInitials(name: string): string {
  const t = name.trim()
  if (!t) return '?'
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  }
  return t.length <= 2 ? t.toUpperCase() : t.slice(0, 2).toUpperCase()
}

function playerHue(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i += 1) h = (h * 33 + name.charCodeAt(i)) | 0
  return Math.abs(h) % 360
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

function IconViolao({ className }: { className?: string }) {
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
      <path d="M8 21h8M12 3v1M7 6h10l-1 7a4 4 0 0 1-8 0L7 6z" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconGuitarra({ className, suffix }: { className?: string; suffix: '1' | '2' }) {
  return (
    <span className="relative inline-flex" aria-hidden>
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 20h10M9 4l-2 2 2 10h6l2-10-2-2" />
        <path d="M9 6h6" />
        <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
      </svg>
      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 min-w-[10px] items-center justify-center rounded bg-zinc-900 px-0.5 text-[7px] font-bold leading-none text-violet-300">
        {suffix}
      </span>
    </span>
  )
}

function IconBaixo({ className }: { className?: string }) {
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
      <path d="M6 4h12v3H6z" />
      <path d="M8 7v12a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V7" />
      <path d="M9 10h6" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconBateria({ className }: { className?: string }) {
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
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <ellipse cx="12" cy="16" rx="4" ry="2.5" />
      <path d="M12 12v2" />
    </svg>
  )
}

function IconPessoa({ className, name }: { className?: string; name: string }) {
  const bg = `hsl(${playerHue(name)} 42% 36%)`
  return (
    <span
      className={`inline-flex h-4 min-w-[1rem] shrink-0 items-center justify-center rounded-full px-0.5 text-[8px] font-bold leading-none text-white ring-1 ring-zinc-600/60 ${className ?? ''}`}
      style={{ backgroundColor: bg }}
      title={name}
      aria-label={name}
    >
      {playerInitials(name)}
    </span>
  )
}

const SLOT: Record<
  FormationKey,
  { label: string; render: (cn: string) => ReactNode }
> = {
  voz: { label: 'Voz', render: (cn) => <IconMic className={cn} /> },
  violao: { label: 'Violão', render: (cn) => <IconViolao className={cn} /> },
  guitarra1: {
    label: 'Guitarra 1',
    render: (cn) => <IconGuitarra className={cn} suffix="1" />,
  },
  guitarra2: {
    label: 'Guitarra 2',
    render: (cn) => <IconGuitarra className={cn} suffix="2" />,
  },
  baixo: { label: 'Baixo', render: (cn) => <IconBaixo className={cn} /> },
  bateria: { label: 'Bateria', render: (cn) => <IconBateria className={cn} /> },
}

const iconCN = 'h-3.5 w-3.5 shrink-0 text-violet-300/95'

type Props = {
  song: Song
  /** Menos padding e texto em biblioteca compacta */
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
            className={`inline-flex max-w-full items-center gap-1 rounded-md border border-zinc-600/70 bg-zinc-950/50 ${dense ? 'px-1 py-0.5' : 'px-1.5 py-0.5'}`}
            title={`${label}: ${name}`}
          >
            <span className="text-zinc-500" title={label}>
              {render(iconCN)}
            </span>
            <IconPessoa name={name} />
            {!dense ? (
              <span className="max-w-[3.5rem] truncate text-[9px] font-medium text-zinc-400 sm:max-w-[5rem]">
                {name}
              </span>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
