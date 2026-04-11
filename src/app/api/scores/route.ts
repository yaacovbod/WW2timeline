import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface ScoreEntry {
  name: string
  school: string
  timeMs: number
  strikes: number
  date: string
}

const SCORES_FILE = path.join(process.cwd(), 'scores.json')
const TOP_N = 100

function readScores(): ScoreEntry[] {
  try {
    if (!fs.existsSync(SCORES_FILE)) return []
    return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeScores(scores: ScoreEntry[]) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2), 'utf-8')
}

export async function GET() {
  const scores = readScores()
  return NextResponse.json(scores.slice(0, TOP_N))
}

export async function POST(req: Request) {
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

  const scores = readScores()
  scores.push(entry)
  scores.sort((a, b) => a.timeMs - b.timeMs || a.strikes - b.strikes)
  const trimmed = scores.slice(0, TOP_N)
  writeScores(trimmed)

  const rank = trimmed.findIndex(s => s === entry) + 1
  return NextResponse.json({ rank, leaderboard: trimmed })
}
