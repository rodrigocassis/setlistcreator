import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Setlist, Song } from '../../types/models'
import { songPalcoLabel } from '../../utils/songDisplay'
import {
  countFormationChanges,
  findPreviousSongInShow,
  transitionCost,
  transitionMessages,
} from '../../utils/setlistTransitions'

const LIBRARY_ID = 'library'

export type DndItems = Record<string, string[]>

/** Colunas que fazem parte do setlist (não inclui biblioteca). */
const SETLIST_KEYS = ['bloco1', 'bloco2', 'bloco3', 'backup'] as const
type SetlistKey = (typeof SETLIST_KEYS)[number]

function isSetlistColumn(id: string): id is SetlistKey {
  return (SETLIST_KEYS as readonly string[]).includes(id)
}

/** True se o id já está em algum bloco ou backup. */
export function isSongInSetlist(songId: string, items: DndItems): boolean {
  return SETLIST_KEYS.some((k) => items[k]?.includes(songId))
}

/** Remove da biblioteca ids que já estão no setlist; remove duplicatas nas colunas. */
export function sanitizeDndItems(prev: DndItems): DndItems {
  const inSet = new Set<string>()
  for (const k of SETLIST_KEYS) {
    for (const id of prev[k] ?? []) inSet.add(id)
  }
  const library = [...new Set((prev.library ?? []).filter((id) => !inSet.has(id)))]
  const uniq = (arr: string[] | undefined) => [...new Set(arr ?? [])]
  return {
    library,
    bloco1: uniq(prev.bloco1),
    bloco2: uniq(prev.bloco2),
    bloco3: uniq(prev.bloco3),
    backup: uniq(prev.backup),
  }
}

export function buildItemsFromSetlist(
  allSongIds: string[],
  setlist: Setlist,
): DndItems {
  const used = new Set([
    ...setlist.bloco1,
    ...setlist.bloco2,
    ...setlist.bloco3,
    ...setlist.backup,
  ])
  const raw: DndItems = {
    library: allSongIds.filter((id) => !used.has(id)),
    bloco1: [...setlist.bloco1],
    bloco2: [...setlist.bloco2],
    bloco3: [...setlist.bloco3],
    backup: [...setlist.backup],
  }
  return sanitizeDndItems(raw)
}

export function itemsToSetlistArrays(items: DndItems) {
  return {
    bloco1: items.bloco1 ?? [],
    bloco2: items.bloco2 ?? [],
    bloco3: items.bloco3 ?? [],
    backup: items.backup ?? [],
  }
}

function findContainer(id: UniqueIdentifier, data: DndItems): string | undefined {
  const sid = String(id)
  if (sid in data) return sid
  return Object.keys(data).find((key) => data[key].includes(sid))
}

function songMatchesLibraryQuery(song: Song, q: string): boolean {
  const qq = q.trim().toLowerCase()
  if (!qq) return true
  return (
    songPalcoLabel(song).toLowerCase().includes(qq) ||
    song.artista.toLowerCase().includes(qq) ||
    song.musica.toLowerCase().includes(qq) ||
    (song.apelido?.toLowerCase().includes(qq) ?? false)
  )
}

/** Cartão da biblioteca: arrastar para blocos (não depende de SortableContext — permite lista filtrada). */
function LibraryDraggableCard({
  id,
  song,
  compact,
}: {
  id: string
  song: Song
  compact?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.45 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none rounded-lg border border-zinc-700/80 bg-zinc-800/90 px-2.5 py-2 shadow-sm ${
        isDragging ? 'z-10 ring-2 ring-violet-500' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="min-w-0 text-left">
        <div className="text-sm font-medium leading-snug text-zinc-100">
          {songPalcoLabel(song)}
        </div>
        <div className="text-xs text-zinc-400">{song.artista}</div>
        {!compact ? (
          <div className="mt-0.5 text-[11px] text-zinc-500">
            {song.afinacao} · {song.estilo}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function SortableSongCard({
  id,
  song,
  index,
  compact,
}: {
  id: string
  song: Song
  index?: number
  compact?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none rounded-xl border border-zinc-700/80 bg-zinc-800/90 px-3 py-2.5 shadow-sm ${
        isDragging ? 'z-10 opacity-60 ring-2 ring-violet-500' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {index != null ? (
          <span className="mt-0.5 w-6 shrink-0 text-xs font-medium text-zinc-500 tabular-nums">
            {index + 1}.
          </span>
        ) : null}
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          {...attributes}
          {...listeners}
        >
          <div className="font-medium text-zinc-100">{songPalcoLabel(song)}</div>
          <div className="text-sm text-zinc-400">{song.artista}</div>
          {!compact ? (
            <div className="mt-0.5 text-xs text-zinc-500">
              {song.afinacao} · {song.estilo}
            </div>
          ) : null}
        </button>
      </div>
    </div>
  )
}

function DropColumn({
  id,
  title,
  subtitle,
  children,
  headerAction,
}: {
  id: string
  title: string
  subtitle?: string
  children: React.ReactNode
  headerAction?: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[100px] flex-col rounded-2xl border p-3 ${
        isOver
          ? 'border-violet-500 ring-2 ring-violet-500/30'
          : 'border-zinc-700 bg-zinc-900/50'
      }`}
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-1">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        <div className="flex items-center gap-2">
          {subtitle ? <span className="text-xs text-zinc-500">{subtitle}</span> : null}
          {headerAction}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </section>
  )
}

function LibraryDropSection({
  libraryIds,
  filteredIds,
  songsById,
  libraryQuery,
  onLibraryQueryChange,
  compactLibrary,
}: {
  libraryIds: string[]
  filteredIds: string[]
  songsById: Record<string, Song>
  libraryQuery: string
  onLibraryQueryChange: (v: string) => void
  compactLibrary: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: LIBRARY_ID })
  const hasQuery = libraryQuery.trim().length > 0
  const subtitle =
    libraryIds.length === 0
      ? 'nenhuma música livre'
      : hasQuery
        ? `${filteredIds.length} de ${libraryIds.length} · filtrado`
        : `${libraryIds.length} músicas`

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-0 flex-col rounded-2xl border p-3 ${
        isOver
          ? 'border-violet-500 ring-2 ring-violet-500/30'
          : 'border-zinc-700 bg-zinc-900/50'
      }`}
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-1">
        <h3 className="text-sm font-semibold text-zinc-100">Biblioteca</h3>
        <span className="text-xs text-zinc-500">{subtitle}</span>
      </div>
      <div className="mb-2 shrink-0">
        <input
          type="search"
          value={libraryQuery}
          onChange={(e) => onLibraryQueryChange(e.target.value)}
          placeholder="Buscar por música ou artista…"
          className="w-full rounded-lg border border-zinc-600 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          aria-label="Filtrar músicas da biblioteca"
        />
      </div>
      <div className="max-h-[min(154px,28vh)] min-h-[50px] overflow-y-auto overscroll-contain pr-1">
        <div className="flex flex-col gap-2 pb-0.5">
          {filteredIds.map((songId) => {
            const song = songsById[songId]
            if (!song) return null
            return (
              <LibraryDraggableCard
                key={songId}
                id={songId}
                song={song}
                compact={compactLibrary}
              />
            )
          })}
        </div>
        {libraryIds.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nenhuma música livre. Cadastre mais na biblioteca ou mova de volta dos
            blocos.
          </p>
        ) : null}
        {libraryIds.length > 0 && filteredIds.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma música corresponde à busca.</p>
        ) : null}
      </div>
    </section>
  )
}

type Props = {
  songs: Song[]
  setlist: Setlist
  items: DndItems
  onItemsChange: (fn: (prev: DndItems) => DndItems) => void
  compactLibrary?: boolean
}

export function SetlistDndEditor({
  songs,
  setlist,
  items,
  onItemsChange,
  compactLibrary = true,
}: Props) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [libraryQuery, setLibraryQuery] = useState('')
  const [sequenceWarning, setSequenceWarning] = useState<string | null>(null)
  const [collapsedBlocks, setCollapsedBlocks] = useState<
    Record<'bloco1' | 'bloco2' | 'bloco3', boolean>
  >({
    bloco1: false,
    bloco2: false,
    bloco3: false,
  })

  const dragStartContainer = useRef<string | null>(null)
  const pendingLibraryDropIds = useRef<string[]>([])
  const itemsRef = useRef(items)
  itemsRef.current = items

  const songsById = useMemo(
    () => Object.fromEntries(songs.map((s) => [s.id, s])),
    [songs],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  )

  const allIds = useMemo(() => songs.map((s) => s.id), [songs])

  const allIdsKey = allIds.join('|')
  useEffect(() => {
    onItemsChange((prev) => {
      const flat = new Set(Object.values(prev).flat())
      const toAdd = allIds.filter((id) => !flat.has(id))
      if (toAdd.length === 0) return sanitizeDndItems(prev)
      return sanitizeDndItems({
        ...prev,
        library: [...(prev.library ?? []), ...toAdd],
      })
    })
  }, [allIdsKey, onItemsChange])

  useLayoutEffect(() => {
    const queue = pendingLibraryDropIds.current
    if (queue.length === 0) return
    pendingLibraryDropIds.current = []
    const nBlocos = setlist.blocos

    for (const droppedId of queue) {
      const nextSong = songsById[droppedId]
      if (!nextSong) continue
      const prevSong = findPreviousSongInShow(
        droppedId,
        items,
        songsById,
        nBlocos,
      )
      const msgs = transitionMessages(prevSong, nextSong)
      if (msgs.length === 0) continue

      const cost = transitionCost(prevSong, nextSong)
      const fc = prevSong ? countFormationChanges(prevSong, nextSong) : 0

      setSequenceWarning(msgs.join(' '))

      if (cost >= 6 || fc >= 3) {
        window.alert(msgs.join('\n\n'))
      }
    }
  }, [items, songsById, setlist.blocos])

  const filteredLibraryIds = useMemo(() => {
    const lib = items.library ?? []
    const q = libraryQuery
    if (!q.trim()) return lib
    return lib.filter((id) => {
      const s = songsById[id]
      return s ? songMatchesLibraryQuery(s, q) : false
    })
  }, [items.library, libraryQuery, songsById])

  const handleDragStart = ({ active }: { active: { id: UniqueIdentifier } }) => {
    dragStartContainer.current = findContainer(active.id, itemsRef.current) ?? null
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (over == null) return

    onItemsChange((prev) => {
      const overId = over.id
      const overContainer = findContainer(overId, prev)
      const activeContainer = findContainer(active.id, prev)
      if (!overContainer || !activeContainer) return prev
      if (activeContainer === overContainer) return prev

      const activeItems = prev[activeContainer]
      const overItems = prev[overContainer]
      const activeIndex = activeItems.indexOf(active.id as string)
      if (activeIndex < 0) return prev

      const overSid = String(overId)
      const overIndexInList = overItems.indexOf(overSid)

      let newIndex: number
      if (overSid in prev) {
        newIndex = overItems.length
      } else if (overIndexInList >= 0) {
        const overRect = over.rect
        const translated = active.rect.current.translated
        const isBelow =
          translated && overRect
            ? translated.top > overRect.top + overRect.height / 2
            : false
        newIndex = overIndexInList + (isBelow ? 1 : 0)
      } else {
        newIndex = overItems.length
      }

      const moving = activeItems[activeIndex]

      // Da biblioteca: não inserir no setlist se a música já está em bloco/backup
      if (
        activeContainer === LIBRARY_ID &&
        isSetlistColumn(overContainer) &&
        isSongInSetlist(moving, prev)
      ) {
        return sanitizeDndItems(prev)
      }

      // Destino é coluna do setlist: não duplicar o mesmo id
      if (isSetlistColumn(overContainer) && overItems.includes(moving)) {
        return sanitizeDndItems(prev)
      }

      const nextActive = activeItems.filter((x) => x !== moving)
      const nextOver = [
        ...overItems.slice(0, newIndex),
        moving,
        ...overItems.slice(newIndex),
      ]

      return sanitizeDndItems({
        ...prev,
        [activeContainer]: nextActive,
        [overContainer]: nextOver,
      })
    })
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const fromLibrary = dragStartContainer.current === LIBRARY_ID
    dragStartContainer.current = null

    if (
      over != null &&
      fromLibrary &&
      isSetlistColumn(findContainer(over.id, itemsRef.current) ?? '')
    ) {
      pendingLibraryDropIds.current.push(String(active.id))
    }

    setActiveId(null)
    if (over == null) return

    onItemsChange((prev) => {
      const activeContainer = findContainer(active.id, prev)
      const overContainer = findContainer(over.id, prev)
      if (!activeContainer || !overContainer) return prev

      if (activeContainer === overContainer) {
        const list = prev[activeContainer]
        const oldIndex = list.indexOf(active.id as string)
        const newIndex = list.indexOf(over.id as string)
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          return sanitizeDndItems({
            ...prev,
            [activeContainer]: arrayMove(list, oldIndex, newIndex),
          })
        }
      }
      return sanitizeDndItems(prev)
    })
  }

  const activeSong = activeId ? songsById[String(activeId)] : null

  const nBlocos = setlist.blocos
  const show2 = nBlocos >= 2
  const show3 = nBlocos >= 3

  const blockSection = (
    key: 'bloco1' | 'bloco2' | 'bloco3',
    label: string,
  ) => (
    <SortableContext
      items={items[key] ?? []}
      strategy={verticalListSortingStrategy}
    >
      <DropColumn
        id={key}
        title={label}
        subtitle={`${items[key]?.length ?? 0} músicas`}
        headerAction={
          <button
            type="button"
            onClick={() =>
              setCollapsedBlocks((prev) => ({ ...prev, [key]: !prev[key] }))
            }
            className="rounded-md border border-zinc-600 px-2 py-0.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800"
            aria-expanded={!collapsedBlocks[key]}
            aria-label={`${collapsedBlocks[key] ? 'Expandir' : 'Recolher'} ${label}`}
          >
            {collapsedBlocks[key] ? 'Expandir' : 'Recolher'}
          </button>
        }
      >
        {collapsedBlocks[key] ? (
          <p className="rounded-lg border border-zinc-700/80 bg-zinc-900/70 px-2 py-2 text-center text-xs text-zinc-400">
            {`${label} recolhido · ${items[key]?.length ?? 0} música(s)`}
          </p>
        ) : (
          <>
            {(items[key] ?? []).map((songId, idx) => {
              const song = songsById[songId]
              if (!song) return null
              return (
                <SortableSongCard
                  key={songId}
                  id={songId}
                  song={song}
                  index={idx}
                  compact={false}
                />
              )
            })}
            {(items[key] ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-600 py-5 text-center text-sm text-zinc-500">
                Arraste músicas aqui
              </p>
            ) : null}
          </>
        )}
      </DropColumn>
    </SortableContext>
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => {
        setActiveId(active.id)
        handleDragStart({ active })
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null)
        dragStartContainer.current = null
      }}
    >
      <div className="space-y-4">
        <LibraryDropSection
          libraryIds={items.library ?? []}
          filteredIds={filteredLibraryIds}
          songsById={songsById}
          libraryQuery={libraryQuery}
          onLibraryQueryChange={setLibraryQuery}
          compactLibrary={compactLibrary}
        />

        {sequenceWarning ? (
          <div
            className="flex gap-3 rounded-xl border border-amber-700/50 bg-amber-950/40 px-3 py-2.5 text-sm text-amber-100"
            role="alert"
          >
            <span className="flex-1 leading-snug">{sequenceWarning}</span>
            <button
              type="button"
              onClick={() => setSequenceWarning(null)}
              className="shrink-0 text-amber-300/90 underline-offset-2 hover:text-white hover:underline"
            >
              Fechar
            </button>
          </div>
        ) : null}

        <div
          className={`grid gap-3 ${nBlocos === 1 ? 'md:grid-cols-1' : nBlocos === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}
        >
          {blockSection('bloco1', 'Bloco 1')}
          {show2 ? blockSection('bloco2', 'Bloco 2') : null}
          {show3 ? blockSection('bloco3', 'Bloco 3') : null}
        </div>

        <SortableContext
          items={items.backup ?? []}
          strategy={verticalListSortingStrategy}
        >
          <DropColumn
            id="backup"
            title="Backup"
            subtitle="reservas do show"
          >
            {(items.backup ?? []).map((songId, idx) => {
              const song = songsById[songId]
              if (!song) return null
              return (
                <SortableSongCard
                  key={songId}
                  id={songId}
                  song={song}
                  index={idx}
                  compact={false}
                />
              )
            })}
            {(items.backup ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-amber-900/50 py-5 text-center text-sm text-zinc-500">
                Músicas extras caso precisem trocar no palco
              </p>
            ) : null}
          </DropColumn>
        </SortableContext>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeSong ? (
          <div className="max-w-sm rounded-xl border-2 border-violet-500 bg-zinc-900 p-3 shadow-2xl">
            <div className="font-medium text-white">{songPalcoLabel(activeSong)}</div>
            <div className="text-sm text-zinc-400">{activeSong.artista}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
