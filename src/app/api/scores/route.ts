import { NextResponse } from 'next/server'
import { put, list, get } from '@vercel/blob'

export interface ScoreEntry {
  name: string
  school: string
  timeMs: number
  strikes: number
  date: string
}

const BLOB_KEY = 'scores/data.json'
const TOP_N = 100

async function readScores(): Promise<ScoreEntry[]> {
  try {
    const { blobs } = await list({ prefix: 'scores/' })
    if (blobs.length === 0) return []
    const result = await get(blobs[0].url, { access: 'private' })
    if (!result?.stream) return []
    const reader = result.stream.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
    const text = Buffer.concat(chunks).toString('utf-8')
    return JSON.parse(text)
  } catch {
    return []
  }
}

async function writeScores(scores: ScoreEntry[]) {
  await put(BLOB_KEY, JSON.stringify(scores), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

export async function GET() {
  const scores = await readScores()
  return NextResponse.json(scores.slice(0, TOP_N), {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ScoreEntry
    if (!body.name || !body.school || typeof body.timeMs !== 'number') {
      return NextResponse.json({ error: 'נתונים חסרים' }, { status: 400 })
    }

    const entry: ScoreEntry = {
      name: String(body.name).slice(0, 40),
      school: String(body.school).slice(0, 80),
      timeMs: body.timeMs,
      strikes: body.strikes ?? 0,
      date: new Date().toISOString().slice(0, 10),
    }

    const scores = await readScores()
    scores.push(entry)
    scores.sort((a, b) => a.timeMs - b.timeMs || a.strikes - b.strikes)
    const trimmed = scores.slice(0, TOP_N)
    await writeScores(trimmed)

    const rank = trimmed.findIndex(
      s => s.name === entry.name && s.school === entry.school &&
           s.timeMs === entry.timeMs && s.date === entry.date
    ) + 1
    return NextResponse.json({ rank })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[scores POST]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
