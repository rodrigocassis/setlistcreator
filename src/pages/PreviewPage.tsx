import { useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { SetlistPdfView } from '../components/pdf/SetlistPdfView'
import { downloadSetlistPdf } from '../utils/pdf'
import type { PdfMode } from '../types/models'

export function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [search] = useSearchParams()
  const stage = search.get('stage') === '1' || search.get('palco') === '1'
  const mode = (search.get('mode') as PdfMode) || 'simples'
  const pdfMode: PdfMode = mode === 'completo' ? 'completo' : 'simples'

  const { getSetlist, songs } = useAppData()
  const setlist = id ? getSetlist(id) : undefined
  const pdfRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const songsById = useMemo(
    () => Object.fromEntries(songs.map((s) => [s.id, s])),
    [songs],
  )

  if (!setlist) {
    return (
      <div className="text-center">
        <p className="text-zinc-500">Setlist não encontrado.</p>
        <Link to="/setlists" className="mt-4 inline-block text-violet-400">
          Voltar
        </Link>
      </div>
    )
  }

  const exportPdf = async () => {
    const el = pdfRef.current
    if (!el) return
    setExporting(true)
    try {
      const safe = setlist.nome
        .trim()
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
        .slice(0, 72)
      await downloadSetlistPdf(el, `${safe || 'setlist'}.pdf`)
    } catch (e) {
      console.error(e)
      const detail = e instanceof Error ? e.message : String(e)
      alert(`Erro ao gerar PDF: ${detail}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={stage ? 'min-h-svh bg-black pb-8 pt-4' : 'space-y-4'}>
      {!stage ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            to={`/setlists/${id}/editar`}
            className="text-sm text-violet-400 hover:text-violet-300"
          >
            ← Editar setlist
          </Link>
          <div className="flex gap-2">
            <Link
              to={`/setlists/${id}/preview?stage=1&mode=${pdfMode}`}
              className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-300"
            >
              Modo palco
            </Link>
            <button
              type="button"
              onClick={exportPdf}
              disabled={exporting}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
            >
              {exporting ? '…' : 'PDF'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex justify-between px-2">
          <Link
            to={`/setlists/${id}/preview`}
            className="text-lg text-violet-400"
          >
            Sair do palco
          </Link>
          <button
            type="button"
            onClick={exportPdf}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-white"
          >
            PDF
          </button>
        </div>
      )}

      <div
        className={
          stage
            ? 'mx-auto max-w-4xl px-3'
            : 'overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'
        }
      >
        <div
          ref={pdfRef}
          className={`mx-auto max-w-full rounded-lg bg-white p-4 shadow-xl sm:p-8 ${
            stage ? 'min-h-[70vh] text-xl' : 'w-[210mm]'
          }`}
        >
          <SetlistPdfView
            setlist={setlist}
            songsById={songsById}
            mode={pdfMode}
            stageMode={stage}
          />
        </div>
      </div>
    </div>
  )
}
