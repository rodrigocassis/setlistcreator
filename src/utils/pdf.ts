import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'

/** A4 em pontos (pdf-lib) */
const A4_W = 595.28
const A4_H = 841.89

/** Evita canvas maior que ~8k px (limite comum do navegador) */
function pickHtml2CanvasScale(el: HTMLElement): number {
  const w = el.scrollWidth || el.offsetWidth || 1
  const h = el.scrollHeight || el.offsetHeight || 1
  const maxSide = 8192
  return Math.min(2, maxSide / Math.max(w, h))
}

function triggerPdfDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

async function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png')
  })
  if (!blob) throw new Error('Falha ao exportar PNG')
  return new Uint8Array(await blob.arrayBuffer())
}

/**
 * PDF sempre com **uma página**: o conteúdo é escalado para caber inteiro no A4
 * (mantém proporção; pode ficar menor se o setlist for longo).
 */
export async function downloadSetlistPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const blob = await buildSetlistPdfBlob(element)
  triggerPdfDownload(blob, filename)
}

export async function buildSetlistPdfBlob(
  element: HTMLElement,
): Promise<Blob> {
  element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })

  const scale = pickHtml2CanvasScale(element)

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    allowTaint: false,
  })

  const bytes = await canvasToPng(canvas)
  const pdf = await PDFDocument.create()
  const img = await pdf.embedPng(bytes)

  const ratio = canvas.width / canvas.height
  let drawW = A4_W
  let drawH = A4_W / ratio
  if (drawH > A4_H) {
    drawH = A4_H
    drawW = A4_H * ratio
  }

  const x = (A4_W - drawW) / 2
  const y = A4_H - drawH

  const page = pdf.addPage([A4_W, A4_H])
  page.drawImage(img, {
    x,
    y,
    width: drawW,
    height: drawH,
  })

  const out = await pdf.save()
  return new Blob([new Uint8Array(out)], { type: 'application/pdf' })
}
