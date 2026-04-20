import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useMatch, useNavigate, useParams } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import {
  SetlistDndEditor,
  buildItemsFromSetlist,
  itemsToSetlistArrays,
  type DndItems,
} from '../components/setlist/SetlistDndEditor'
import { SetlistPdfView } from '../components/pdf/SetlistPdfView'
import { buildSetlistPdfBlob, downloadSetlistPdf } from '../utils/pdf'
import { adjustSetlistBlocos } from '../utils/setlistBlocks'
import { estimateSetlistMinutes } from '../utils/setlistDuration'
import type { Setlist } from '../types/models'

export function SetlistEditorPage() {
  const isNew = useMatch({ path: '/setlists/novo', end: true }) != null
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { songs, getSetlist, addSetlist, updateSetlist } = useAppData()

  const [nome, setNome] = useState('')
  const [data, setData] = useState('')
  const [local, setLocal] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [blocos, setBlocos] = useState<1 | 2 | 3>(2)
  const [items, setItems] = useState<DndItems>({
    library: [],
    bloco1: [],
    bloco2: [],
    bloco3: [],
    backup: [],
  })
  const [exporting, setExporting] = useState(false)
  const [saveHint, setSaveHint] = useState<string | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)

  const allSongIds = useMemo(() => songs.map((s) => s.id), [songs])

  const onItemsChange = useCallback((fn: (prev: DndItems) => DndItems) => {
    setItems(fn)
  }, [])

  useEffect(() => {
    if (isNew) {
      setNome('Novo setlist')
      setData('')
      setLocal('')
      setObservacoes('')
      setBlocos(2)
      setItems(
        buildItemsFromSetlist(allSongIds, {
          id: 'temp',
          nome: '',
          blocos: 2,
          bloco1: [],
          bloco2: [],
          bloco3: [],
          backup: [],
          createdAt: '',
          updatedAt: '',
        }),
      )
      return
    }
    if (!id) return
    const sl = getSetlist(id)
    if (!sl) {
      navigate('/setlists')
      return
    }
    setNome(sl.nome)
    setData(sl.data ?? '')
    setLocal(sl.local ?? '')
    setObservacoes(sl.observacoes ?? '')
    setBlocos(sl.blocos)
    setItems(buildItemsFromSetlist(allSongIds, sl))
  }, [isNew, id, allSongIds, getSetlist, navigate])

  const songsById = useMemo(
    () => Object.fromEntries(songs.map((s) => [s.id, s])),
    [songs],
  )

  const syntheticSetlist = useMemo((): Setlist => {
    const arrays = itemsToSetlistArrays(items)
    return {
      id: id ?? 'new',
      nome: nome || 'Setlist',
      data: data || undefined,
      local: local || undefined,
      blocos,
      ...arrays,
      observacoes: observacoes || undefined,
      createdAt: '',
      updatedAt: '',
    }
  }, [id, nome, data, local, observacoes, blocos, items])

  const estimated = useMemo(
    () => estimateSetlistMinutes(syntheticSetlist, songsById),
    [syntheticSetlist, songsById],
  )

  const handleBlocosChange = (next: 1 | 2 | 3) => {
    const base: Setlist = {
      ...syntheticSetlist,
      ...itemsToSetlistArrays(items),
      blocos,
    }
    const adj = adjustSetlistBlocos(base, next)
    setBlocos(next)
    setItems(buildItemsFromSetlist(allSongIds, adj))
  }

  const save = () => {
    try {
      const arrays = itemsToSetlistArrays(items)
      const payload = {
        nome: nome.trim() || 'Sem nome',
        data: data.trim() || undefined,
        local: local.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        blocos,
        ...arrays,
      }
      if (isNew) {
        const created = addSetlist(payload)
        navigate(`/setlists/${created.id}/editar`, { replace: true })
      } else if (id) {
        updateSetlist(id, payload)
      }
      setSaveHint('Salvo')
      window.setTimeout(() => setSaveHint(null), 2500)
    } catch (e) {
      console.error(e)
      alert(
        e instanceof Error
          ? `Não foi possível salvar: ${e.message}`
          : 'Não foi possível salvar.',
      )
    }
  }

  const safePdfName = () =>
    nome.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 72) || 'setlist'

  const exportPdf = async () => {
    const el = pdfRef.current
    if (!el) return
    setExporting(true)
    try {
      const safe = safePdfName()
      await downloadSetlistPdf(el, `${safe}.pdf`)
    } catch (e) {
      console.error(e)
      const detail = e instanceof Error ? e.message : String(e)
      alert(`Falha ao gerar PDF: ${detail}`)
    } finally {
      setExporting(false)
    }
  }

  const getPdfFile = async (): Promise<File> => {
    const el = pdfRef.current
    if (!el) throw new Error('Pré-visualização do PDF não encontrada.')
    const safe = safePdfName()
    const blob = await buildSetlistPdfBlob(el)
    return new File([blob], `${safe}.pdf`, { type: 'application/pdf' })
  }

  const shareByEmail = async () => {
    setExporting(true)
    try {
      const file = await getPdfFile()
      if (
        typeof navigator.share === 'function' &&
        (typeof navigator.canShare !== 'function' ||
          navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          files: [file],
          title: `Setlist ${nome.trim() || ''}`.trim(),
          text: 'Segue o setlist em PDF.',
        })
        return
      }

      const subject = encodeURIComponent(`Setlist ${nome.trim() || ''}`.trim())
      const body = encodeURIComponent(
        'Segue o setlist em PDF. O arquivo foi baixado para anexar no seu app de e-mail.',
      )
      const el = pdfRef.current
      if (el) await downloadSetlistPdf(el, file.name)
      window.location.href = `mailto:?subject=${subject}&body=${body}`
    } catch (e) {
      console.error(e)
      const detail = e instanceof Error ? e.message : String(e)
      alert(`Falha ao compartilhar por e-mail: ${detail}`)
    } finally {
      setExporting(false)
    }
  }

  const shareByWhatsApp = async () => {
    setExporting(true)
    try {
      const file = await getPdfFile()
      if (
        typeof navigator.share === 'function' &&
        (typeof navigator.canShare !== 'function' ||
          navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          files: [file],
          title: `Setlist ${nome.trim() || ''}`.trim(),
          text: 'Setlist em PDF para compartilhar no WhatsApp.',
        })
        return
      }

      const msg = encodeURIComponent(
        `Setlist ${nome.trim() || ''}`.trim() +
          '\nPDF baixado no dispositivo para anexar no WhatsApp.',
      )
      const el = pdfRef.current
      if (el) await downloadSetlistPdf(el, file.name)
      window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer')
    } catch (e) {
      console.error(e)
      const detail = e instanceof Error ? e.message : String(e)
      alert(`Falha ao compartilhar no WhatsApp: ${detail}`)
    } finally {
      setExporting(false)
    }
  }

  const copyPdfToClipboard = async () => {
    setExporting(true)
    try {
      const file = await getPdfFile()
      if (
        typeof ClipboardItem !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.write === 'function'
      ) {
        const item = new ClipboardItem({
          'application/pdf': file,
        })
        await navigator.clipboard.write([item])
        alert('PDF copiado para a área de transferência.')
        return
      }
      alert(
        'Seu navegador não permite copiar PDF diretamente. Use “Baixar PDF” e anexe no aplicativo desejado.',
      )
    } catch (e) {
      console.error(e)
      const detail = e instanceof Error ? e.message : String(e)
      alert(`Falha ao copiar PDF: ${detail}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/setlists" className="text-sm text-violet-400 hover:text-violet-300">
            ← Setlists
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {isNew ? 'Novo setlist' : 'Editar setlist'}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && id ? (
            <Link
              to={`/setlists/${id}/preview`}
              className="rounded-xl border border-zinc-600 px-3 py-2 text-sm text-zinc-300"
            >
              Prévia / palco
            </Link>
          ) : null}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              Salvar
            </button>
            {saveHint ? (
              <span className="text-sm text-emerald-400" role="status">
                {saveHint}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium uppercase text-zinc-500">Nome do show</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase text-zinc-500">Data (opcional)</span>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase text-zinc-500">Local (opcional)</span>
          <input
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium uppercase text-zinc-500">Observações</span>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white"
          />
        </label>
        <div className="sm:col-span-2">
          <span className="text-xs font-medium uppercase text-zinc-500">Blocos no show</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleBlocosChange(n)}
                className={`min-h-[44px] min-w-[44px] rounded-xl px-4 font-medium ${
                  blocos === n
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {estimated != null ? (
        <p className="text-sm text-zinc-400">
          Duração estimada (só músicas com tempo): ~{estimated} min
        </p>
      ) : null}

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl border border-zinc-800 p-3">
        <button
          type="button"
          onClick={exportPdf}
          disabled={exporting}
          title="Baixar PDF"
          aria-label="Baixar PDF"
          className="inline-flex min-h-[34px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
        >
          {exporting ? 'Gerando…' : 'Baixar PDF'}
        </button>
        <button
          type="button"
          onClick={shareByEmail}
          disabled={exporting}
          title="Enviar por e-mail"
          aria-label="Enviar por e-mail"
          className="inline-flex min-h-[34px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-zinc-600 px-2.5 py-1.5 text-[11px] text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          E-mail
        </button>
        <button
          type="button"
          onClick={shareByWhatsApp}
          disabled={exporting}
          title="Enviar por WhatsApp"
          aria-label="Enviar por WhatsApp"
          className="inline-flex min-h-[34px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-emerald-700/60 px-2.5 py-1.5 text-[11px] text-emerald-300 hover:bg-emerald-900/30 disabled:opacity-50"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={copyPdfToClipboard}
          disabled={exporting}
          title="Copiar PDF"
          aria-label="Copiar PDF"
          className="inline-flex min-h-[34px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-zinc-600 px-2.5 py-1.5 text-[11px] text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          Copiar PDF
        </button>
      </div>

      <SetlistDndEditor
        songs={songs}
        setlist={syntheticSetlist}
        items={items}
        onItemsChange={onItemsChange}
      />

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-500">Pré-visualização A4</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div
            ref={pdfRef}
            className="pdf-capture mx-auto w-[210mm] max-w-full rounded-lg bg-white p-6 shadow-lg"
          >
            <SetlistPdfView
              setlist={syntheticSetlist}
              songsById={songsById}
              mode="simples"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
