import type { Song } from '../../types/models'

type SlotKey = 'voz' | 'violao' | 'guitarra1' | 'guitarra2' | 'baixo' | 'bateria'

const SLOT_ORDER: SlotKey[] = ['voz', 'violao', 'guitarra1', 'guitarra2', 'baixo', 'bateria']

function hasPlayer(value: string | undefined): boolean {
  const t = (value ?? '').trim().toLowerCase()
  return Boolean(t && t !== '-' && t !== 'n/a')
}

function IconMic() {
  return (
    <svg
      className="h-3.5 w-3.5 text-violet-300"
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

function IconViolao() {
  return (
    <svg className="h-3.5 w-3.5 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 21h8M12 3v1M7 6h10l-1 7a4 4 0 0 1-8 0L7 6z" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconGuitarra({ suffix }: { suffix: '1' | '2' }) {
  return (
    <span className="relative inline-flex" aria-hidden>
      <svg
        className="h-3.5 w-3.5 text-violet-300"
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

function IconBaixo() {
  return (
    <svg className="h-3.5 w-3.5 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 4h12v3H6z" />
      <path d="M8 7v12a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V7" />
      <path d="M9 10h6" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconBateria() {
  return (
    <svg className="h-3.5 w-3.5 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <ellipse cx="12" cy="16" rx="4" ry="2.5" />
      <path d="M12 12v2" />
    </svg>
  )
}

function InstrumentIcon({ slot }: { slot: SlotKey }) {
  if (slot === 'voz') return <IconMic />
  if (slot === 'violao') return <IconViolao />
  if (slot === 'guitarra1') return <IconGuitarra suffix="1" />
  if (slot === 'guitarra2') return <IconGuitarra suffix="2" />
  if (slot === 'baixo') return <IconBaixo />
  return <IconBateria />
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function PersonIcon({ name }: { name: string }) {
  const t = name.trim()
  return (
    <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-zinc-700 px-0.5 text-[8px] font-bold text-white ring-1 ring-zinc-600/70" title={t}>
      {initials(t)}
    </span>
  )
}

export function SongCardFormation({ song }: { song: Song }) {
  const active = SLOT_ORDER.filter((slot) => hasPlayer(song[slot] as string))
  if (active.length === 0) return null

  return (
    <ul className="mt-1 flex flex-wrap items-center gap-1" aria-label="Formação da música">
      {active.map((slot) => {
        const name = String(song[slot] ?? '').trim()
        return (
          <li
            key={slot}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-600/70 bg-zinc-950/50 px-1 py-0.5"
            title={`${slot}: ${name}`}
          >
            <InstrumentIcon slot={slot} />
            <PersonIcon name={name} />
          </li>
        )
      })}
    </ul>
  )
}
