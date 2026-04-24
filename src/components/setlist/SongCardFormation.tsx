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

type SlotKey = 'voz' | 'violao' | 'guitarra1' | 'guitarra2' | 'baixo' | 'bateria'

const SLOT_ORDER: SlotKey[] = ['voz', 'violao', 'guitarra1', 'guitarra2', 'baixo', 'bateria']

function hasPlayer(value: string | undefined): boolean {
  const t = (value ?? '').trim().toLowerCase()
  return Boolean(t && t !== '-' && t !== 'n/a')
}

function firstToken(name: string): string {
  return name.trim().toLowerCase().split(/\s+/)[0] ?? ''
}

function avatarForName(name: string): string | null {
  const t = firstToken(name)
  if (t === 'abel') return avatarAbel
  if (t === 'numa') return avatarNuma
  if (t === 'rodrigo') return avatarRodrigo
  if (t === 'marcos' || t === 'marquinho') return avatarMarquinho
  return null
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

function InstrumentIcon({ slot }: { slot: SlotKey }) {
  if (slot === 'voz') return <IconMic />
  if (slot === 'violao') return <img src={iconViolao} alt="" className="h-4 w-3.5 object-contain" />
  if (slot === 'guitarra1') return <img src={iconGuitarra1} alt="" className="h-4 w-3.5 object-contain" />
  if (slot === 'guitarra2') return <img src={iconGuitarra2} alt="" className="h-3.5 w-[1.4rem] object-contain" />
  if (slot === 'baixo') return <img src={iconBaixo} alt="" className="h-4 w-3.5 object-contain" />
  return <img src={iconBateria} alt="" className="h-3.5 w-[1.35rem] object-contain" />
}

function PersonIcon({ name }: { name: string }) {
  const avatar = avatarForName(name)
  if (avatar) {
    return (
      <span className="inline-block h-4 w-4 overflow-hidden rounded-full ring-1 ring-zinc-600/70" title={name}>
        <img src={avatar} alt="" className="h-full w-full object-cover object-top" />
      </span>
    )
  }
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700 ring-1 ring-zinc-600/70"
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
