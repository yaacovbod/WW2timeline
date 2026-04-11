import { NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'

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
    const res = await fetch(blobs[0].url, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
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

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const index = Number(searchParams.get('index'))

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'אין הרשאה' }, { status: 401 })
  }
  if (isNaN(index) || index < 0) {
    return NextResponse.json({ error: 'אינדקס לא תקין' }, { status: 400 })
  }

  const scores = await readScores()
  if (index >= scores.length) {
    return NextResponse.json({ error: 'אינדקס מחוץ לטווח' }, { status: 404 })
  }
  scores.splice(index, 1)
  await writeScores(scores)
  return NextResponse.json({ ok: true, remaining: scores.length })
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
