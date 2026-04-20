import express from 'express'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const app = express()
app.use(express.json({ limit: '2mb' }))

const PORT = Number(process.env.PORT || 8787)
const DATA_DIR = path.resolve(process.env.SETLIST_DATA_DIR || './data')
const SONGS_FILE = path.join(DATA_DIR, 'musicas.json')
const SETLISTS_FILE = path.join(DATA_DIR, 'setlists.json')

const writeQueues = new Map()

async function ensureDataFiles() {
  await mkdir(DATA_DIR, { recursive: true })
  await ensureJsonFile(SONGS_FILE)
  await ensureJsonFile(SETLISTS_FILE)
}

async function ensureJsonFile(filePath) {
  try {
    await readFile(filePath, 'utf8')
  } catch {
    await writeFile(filePath, '[]\n', 'utf8')
  }
}

async function readJsonArray(filePath) {
  const raw = await readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : []
}

function queueWrite(filePath, payload) {
  const previous = writeQueues.get(filePath) || Promise.resolve()
  const current = previous.then(() =>
    writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8'),
  )
  writeQueues.set(filePath, current.catch(() => {}))
  return current
}

function validateArray(req, res, next) {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Body precisa ser um array JSON.' })
  }
  return next()
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    dataDir: DATA_DIR,
    files: {
      songs: SONGS_FILE,
      setlists: SETLISTS_FILE,
    },
  })
})

app.get('/api/songs', async (_req, res) => {
  try {
    const songs = await readJsonArray(SONGS_FILE)
    res.json(songs)
  } catch {
    res.status(500).json({ error: 'Falha ao ler musicas.json.' })
  }
})

app.put('/api/songs', validateArray, async (req, res) => {
  try {
    await queueWrite(SONGS_FILE, req.body)
    res.status(204).send()
  } catch {
    res.status(500).json({ error: 'Falha ao salvar musicas.json.' })
  }
})

app.get('/api/setlists', async (_req, res) => {
  try {
    const setlists = await readJsonArray(SETLISTS_FILE)
    res.json(setlists)
  } catch {
    res.status(500).json({ error: 'Falha ao ler setlists.json.' })
  }
})

app.put('/api/setlists', validateArray, async (req, res) => {
  try {
    await queueWrite(SETLISTS_FILE, req.body)
    res.status(204).send()
  } catch {
    res.status(500).json({ error: 'Falha ao salvar setlists.json.' })
  }
})

ensureDataFiles()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[api] running on http://localhost:${PORT}`)
      // eslint-disable-next-line no-console
      console.log(`[api] data dir: ${DATA_DIR}`)
    })
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('[api] failed to start:', error)
    process.exit(1)
  })
