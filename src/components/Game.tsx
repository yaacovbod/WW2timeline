'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { ALL_EVENTS, MUTUAL_EXCLUSIONS, GameEvent, shuffle, formatTime } from '@/data/events'

const MAX_STRIKES = 3

function pickEvents(): GameEvent[] {
  const shuffled = shuffle(ALL_EVENTS)
  const selected = shuffled.slice(0, 8)
  MUTUAL_EXCLUSIONS.forEach(([idA, idB]) => {
    const posA = selected.findIndex(e => e.id === idA)
    const posB = selected.findIndex(e => e.id === idB)
    if (posA === -1 || posB === -1) return
    const removePos = Math.max(posA, posB)
    const replacement = shuffled.find(e => !selected.includes(e))
    if (replacement) selected.splice(removePos, 1, replacement)
  })
  return selected
}

type Phase = 'intro' | 'playing' | 'end'

export default function Game() {
  const [phase, setPhase]               = useState<Phase>('intro')
  const [gameEvents, setGameEvents]     = useState<GameEvent[]>([])
  const [placedEvents, setPlacedEvents] = useState<GameEvent[]>([])
  const [currentIdx, setCurrentIdx]     = useState(0)
  const [strikes, setStrikes]           = useState(0)
  const [stopwatchMs, setStopwatchMs]   = useState(0)
  const [won, setWon]                   = useState(false)
  const [shaking, setShaking]           = useState(false)
  const [flashRed, setFlashRed]         = useState(false)
  const [insertIdx, setInsertIdx]       = useState<number | null>(null)
  const [muted, setMuted]               = useState(false)

  const audioRef     = useRef<HTMLAudioElement | null>(null)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const timelineRef  = useRef<HTMLDivElement>(null)
  const cardRef      = useRef<HTMLDivElement>(null)
  const ghostRef     = useRef<HTMLDivElement>(null)
  const touchDragging = useRef(false)
  const strikesRef   = useRef(strikes)
  const placedRef    = useRef(placedEvents)
  const idxRef       = useRef(currentIdx)
  const gameEvRef    = useRef(gameEvents)
  strikesRef.current = strikes
  placedRef.current  = placedEvents
  idxRef.current     = currentIdx
  gameEvRef.current  = gameEvents

  // stopwatch
  useEffect(() => {
    if (phase !== 'playing') return
    timerRef.current = setInterval(() => setStopwatchMs(ms => ms + 100), 100)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  function startGame() {
    audioRef.current?.play().catch(() => {})
    const selected = pickEvents()
    const seed = { ...selected[0], isSeed: true }
    setGameEvents(selected.slice(1, 8))
    setPlacedEvents([seed])
    setCurrentIdx(0)
    setStrikes(0)
    setStopwatchMs(0)
    setWon(false)
    setPhase('playing')
  }

  const finishGame = useCallback((didWin: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setWon(didWin)
    setPhase('end')
  }, [])

  const placeCard = useCallback((dropIndex: number) => {
    const ev = gameEvRef.current[idxRef.current]
    if (!ev) return
    const placed = placedRef.current
    const beforeOk = dropIndex === 0 || placed[dropIndex - 1].sortKey <= ev.sortKey
    const afterOk  = dropIndex >= placed.length || placed[dropIndex].sortKey >= ev.sortKey
    const correct  = beforeOk && afterOk

    if (correct) {
      const newPlaced = [...placed]
      let pos = newPlaced.findIndex(e => e.sortKey > ev.sortKey)
      if (pos === -1) pos = newPlaced.length
      newPlaced.splice(pos, 0, { ...ev, isCorrect: true })
      setPlacedEvents(newPlaced)
      const nextIdx = idxRef.current + 1
      setCurrentIdx(nextIdx)
      if (nextIdx >= gameEvRef.current.length) finishGame(true)
    } else {
      const newStrikes = strikesRef.current + 1
      setStrikes(newStrikes)
      setShaking(true)
      setFlashRed(true)
      setTimeout(() => setShaking(false), 400)
      setTimeout(() => setFlashRed(false), 500)
      if (newStrikes >= MAX_STRIKES) {
        const newPlaced = [...placed]
        let pos = newPlaced.findIndex(e => e.sortKey > ev.sortKey)
        if (pos === -1) pos = newPlaced.length
        newPlaced.splice(pos, 0, { ...ev, isCorrect: false })
        setPlacedEvents(newPlaced)
        setTimeout(() => finishGame(false), 600)
      }
    }
  }, [finishGame])

  // insert index from Y position
  function getInsertIndex(clientY: number): number {
    if (!timelineRef.current) return 0
    const cards = timelineRef.current.querySelectorAll<HTMLElement>('.placed-card')
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect()
      if (clientY < r.top + r.height / 2) return i
    }
    return cards.length
  }

  // desktop drag
  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setInsertIdx(getInsertIndex(e.clientY))
  }
  function onDragLeave(e: React.DragEvent) {
    if (!timelineRef.current?.contains(e.relatedTarget as Node)) setInsertIdx(null)
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const idx = getInsertIndex(e.clientY)
    setInsertIdx(null)
    placeCard(idx)
  }

  // touch drag
  function onTouchStart(e: React.TouchEvent) {
    if (phase !== 'playing') return
    touchDragging.current = true
    const t = e.touches[0]
    if (ghostRef.current) {
      ghostRef.current.style.display = 'block'
      ghostRef.current.style.left = (t.clientX - 130) + 'px'
      ghostRef.current.style.top  = (t.clientY - 80)  + 'px'
    }
  }

  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      if (!touchDragging.current) return
      e.preventDefault()
      const t = e.touches[0]
      if (ghostRef.current) {
        ghostRef.current.style.left = (t.clientX - 130) + 'px'
        ghostRef.current.style.top  = (t.clientY - 80)  + 'px'
      }
      setInsertIdx(getInsertIndex(t.clientY))
      if (t.clientY > window.innerHeight - 90) window.scrollBy(0, 6)
      else if (t.clientY < 90) window.scrollBy(0, -6)
    }
    function onTouchEnd(e: TouchEvent) {
      if (!touchDragging.current) return
      touchDragging.current = false
      if (ghostRef.current) ghostRef.current.style.display = 'none'
      const t = e.changedTouches[0]
      const idx = getInsertIndex(t.clientY)
      setInsertIdx(null)
      placeCard(idx)
    }
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [placeCard])

  // floating elements
  useEffect(() => {
    const layer = document.getElementById('float-layer')
    if (!layer || layer.childElementCount > 0) return
    type SymItem = { kind: 'sym'; t: string; size: number; op: number; left: number }
    type TxtItem = { kind: 'txt'; t: string; size: number; color: string; left: number }

    const SYMBOLS: Omit<SymItem, 'kind' | 'left'>[] = [
      { t: '✡', size: 1.4, op: .13 }, { t: '🕯️', size: 1.3, op: .18 },
      { t: '🕊️', size: 1.3, op: .16 }, { t: '🌹', size: 1.2, op: .15 },
      { t: '✡', size: 1.6, op: .10 }, { t: '🕯️', size: 1.1, op: .17 },
      { t: '🕊️', size: 1.5, op: .13 }, { t: '✡', size: 1.2, op: .12 },
      { t: '🌹', size: 1.4, op: .14 }, { t: '🕯️', size: 1.6, op: .11 },
    ]
    const TEXTS: Omit<TxtItem, 'kind' | 'left'>[] = [
      { t: 'יזכור', color: '#c0a0ff', size: .85 }, { t: '1933', color: '#8888cc', size: .78 },
      { t: '1939', color: '#8888cc', size: .78 },   { t: '1945', color: '#8888cc', size: .78 },
      { t: 'שואה', color: '#c0a0ff', size: .82 },   { t: '1942', color: '#8888cc', size: .78 },
      { t: 'יזכור', color: '#c0a0ff', size: .75 },  { t: '1944', color: '#8888cc', size: .72 },
    ]
    const all: (SymItem | TxtItem)[] = [
      ...SYMBOLS.map((s, i): SymItem => ({ kind: 'sym', ...s, left: 2 + i * (96 / SYMBOLS.length) + (Math.random() * 4 - 2) })),
      ...TEXTS.map((s, i): TxtItem => ({ kind: 'txt', ...s, left: 5 + i * (90 / TEXTS.length) + (Math.random() * 4 - 2) })),
    ]
    all.forEach(item => {
      const el = document.createElement('span')
      const dur = 18 + Math.random() * 20
      const delay = -(Math.random() * dur)
      if (item.kind === 'sym') {
        el.textContent = item.t
        el.style.cssText = `position:absolute;bottom:-60px;left:${item.left.toFixed(1)}%;font-size:${item.size}rem;opacity:${item.op};animation:floatUp ${dur.toFixed(1)}s ${delay.toFixed(1)}s linear infinite;pointer-events:none;user-select:none;filter:saturate(.4) brightness(.7)`
      } else {
        el.textContent = item.t
        el.style.cssText = `position:absolute;bottom:-60px;left:${item.left.toFixed(1)}%;font-family:var(--font-cinzel),serif;font-size:${item.size}rem;color:${item.color};opacity:.18;animation:floatUp ${dur.toFixed(1)}s ${delay.toFixed(1)}s linear infinite;pointer-events:none;user-select:none;letter-spacing:2px`
      }
      layer.appendChild(el)
    })
  }, [])

  const currentEvent = phase === 'playing' ? gameEvents[currentIdx] : null
  const hearts = '♥'.repeat(MAX_STRIKES - strikes) + '♡'.repeat(strikes)

  return (
    <>
      {/* Float layer */}
      <div id="float-layer" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} />

      {/* Audio */}
      <audio ref={audioRef} loop src="/271339__foolboymedia__melancholic-haze.wav" />

      {/* Mute button */}
      <button
        onClick={() => { setMuted(m => !m); if (audioRef.current) audioRef.current.muted = !muted }}
        style={{ position: 'fixed', bottom: 18, left: 16, zIndex: 100, background: 'rgba(16,16,46,.85)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '50%', width: 36, height: 36, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
      >{muted ? '🔇' : '🔊'}</button>

      {/* Touch ghost */}
      <div ref={ghostRef} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 999, opacity: .85, borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,.6)', display: 'none', background: 'var(--surface2)', border: '1px solid var(--accent)', width: 260 }}>
        <img src={currentEvent?.image ?? ''} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
        <div style={{ padding: '8px 10px', fontFamily: 'var(--font-cinzel)', fontSize: '.85rem', color: 'var(--gold)' }}>{currentEvent?.title}</div>
      </div>

      {/* Intro modal */}
      {phase === 'intro' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,10,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
          <div style={{ background: 'var(--surface1)', border: '1px solid var(--border)', borderRadius: 18, padding: '32px 28px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.7)' }}>
            <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: 6 }}>איך משחקים?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: 18 }}>השואה ומלחמת העולם השנייה</p>
            <ul style={{ textAlign: 'right', margin: '14px 0', display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none' }}>
              <li style={{ fontSize: '.9rem', lineHeight: 1.5 }}>1. בציר הזמן יופיע אירוע עוגן ⚓ אחד עם תאריך.</li>
              <li style={{ fontSize: '.9rem', lineHeight: 1.5 }}>2. תוצג כרטיסייה עם תיאור אירוע ללא תאריך.</li>
              <li style={{ fontSize: '.9rem', lineHeight: 1.5 }}>3. גרור אותה לציר הזמן למקום הנכון.</li>
              <li style={{ fontSize: '.9rem', lineHeight: 1.5 }}>4. טעות = פסילה ♥. לאחר 3 פסילות המשחק נגמר.</li>
              <li style={{ fontSize: '.9rem', lineHeight: 1.5 }}>5. הצלחת? תראה את הזמן שלך!</li>
            </ul>
            <button onClick={startGame} style={{ background: 'linear-gradient(135deg,var(--accent),#4a2fb0)', color: '#fff', border: 'none', padding: '12px 36px', borderRadius: 30, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: 14 }}>
              בואו נתחיל!
            </button>
          </div>
        </div>
      )}

      {/* End modal */}
      {phase === 'end' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,10,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
          <div style={{ background: 'var(--surface1)', border: '1px solid var(--border)', borderRadius: 18, padding: '32px 28px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.7)' }}>
            <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: 6 }}>{won ? 'כל הכבוד!' : 'נגמרו הסיבובים!'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: 18 }}>{won ? 'סידרת את כל האירועים בזמן:' : '3 פסילות – המשחק הסתיים.'}</p>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '3rem', fontWeight: 800, color: 'var(--gold)', margin: '14px 0' }}>{formatTime(stopwatchMs)}</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: '.95rem' }}>
              {won ? (strikes === 0 ? 'מושלם! ללא אף פסילה!' : `עם ${strikes} פסיל${strikes === 1 ? 'ה' : 'ות'} בלבד.`) : 'כדאי לחזור על החומר ולנסות שוב.'}
            </p>
            <button onClick={() => { setPhase('intro'); startGame() }} style={{ background: 'linear-gradient(135deg,var(--accent),#4a2fb0)', color: '#fff', border: 'none', padding: '12px 36px', borderRadius: 30, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: 14 }}>
              משחק חדש
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: 'rgba(8,8,26,.92)', backdropFilter: 'blur(8px)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(90deg,var(--text),var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>אירוע בזמן</h1>
          <p style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginTop: 2, letterSpacing: '.5px' }}>השואה ומלחמת העולם השנייה</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: '1.2rem', letterSpacing: 2 }}>{hearts}</div>
          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)', minWidth: 70, textAlign: 'center' }}>{formatTime(stopwatchMs)}</div>
        </div>
      </header>

      {/* Game area */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px 16px 40px', position: 'relative', zIndex: 1 }}>

        {/* Current card */}
        {currentEvent && (
          <div
            ref={cardRef}
            draggable
            onDragStart={e => { e.dataTransfer.effectAllowed = 'move' }}
            onDragEnd={() => {}}
            onTouchStart={onTouchStart}
            style={{
              background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)',
              borderRadius: 14, overflow: 'hidden', boxShadow: '0 6px 30px rgba(0,0,0,.5)',
              cursor: 'grab', position: 'relative', marginBottom: 12,
              animation: shaking ? 'shake .4s ease' : undefined,
            }}
          >
            {flashRed && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,82,82,.18)', borderRadius: 14, pointerEvents: 'none', animation: 'fadeFlash .5s ease forwards' }} />}
            <img src={currentEvent.image} alt={currentEvent.title} style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block', pointerEvents: 'none' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div style={{ padding: '12px 16px 4px', pointerEvents: 'none' }}>
              <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', fontWeight: 700, color: 'var(--gold)', marginBottom: 5 }}>{currentEvent.title}</div>
              <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{currentEvent.description}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0 10px', fontSize: '.78rem', color: 'var(--text-muted)', animation: 'pulse-hint 1.8s ease-in-out infinite' }}>
              ↕ גרור לציר הזמן
            </div>
          </div>
        )}

        {/* Timeline */}
        <div
          ref={timelineRef}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          style={{ position: 'relative', padding: '0 8px' }}
        >
          {/* vertical line */}
          <div style={{ position: 'absolute', right: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom,transparent,var(--accent),var(--accent2),transparent)', transform: 'translateX(50%)', pointerEvents: 'none' }} />

          {placedEvents.map((ev, i) => (
            <div key={ev.id}>
              {/* insert line above */}
              {phase === 'playing' && (
                <div style={{ height: 5, margin: '1px 4px', borderRadius: 2, background: 'linear-gradient(90deg,transparent,var(--accent),var(--accent2),transparent)', boxShadow: '0 0 10px var(--accent)', opacity: insertIdx === i ? 1 : 0, transition: 'opacity .15s', pointerEvents: 'none' }} />
              )}
              {/* placed card */}
              <div
                className="placed-card"
                style={{
                  background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)',
                  borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.4)',
                  margin: '2px 8px', display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 5,
                  borderRight: ev.isSeed ? '5px solid var(--gold)' : ev.isCorrect ? '5px solid var(--ok)' : '5px solid var(--bad)',
                }}
              >
                <img src={ev.image} alt={ev.title} style={{ width: 75, minHeight: 65, objectFit: 'cover', flexShrink: 0, background: 'var(--surface3)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div style={{ padding: '8px 12px', flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--accent2)', marginBottom: 3, letterSpacing: '.3px' }}>{ev.displayDate}</div>
                  <div style={{ fontSize: '.87rem', fontWeight: 600, lineHeight: 1.3 }}>{ev.title}</div>
                </div>
                <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700, background: ev.isSeed ? 'var(--gold)' : ev.isCorrect ? 'var(--ok)' : 'var(--bad)', color: ev.isSeed || ev.isCorrect ? '#000' : '#fff' }}>
                  {ev.isSeed ? '⚓' : ev.isCorrect ? '✓' : '✗'}
                </div>
              </div>
            </div>
          ))}

          {/* insert line at bottom */}
          {phase === 'playing' && (
            <div style={{ height: 5, margin: '1px 4px', borderRadius: 2, background: 'linear-gradient(90deg,transparent,var(--accent),var(--accent2),transparent)', boxShadow: '0 0 10px var(--accent)', opacity: insertIdx === placedEvents.length ? 1 : 0, transition: 'opacity .15s', pointerEvents: 'none' }} />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: 18, fontSize: '.72rem', color: '#4a4870', fontFamily: 'var(--font-raleway)', position: 'relative', zIndex: 1 }}>
        כל הזכויות שמורות © יעקב קדם &nbsp;|&nbsp;
        <a href="mailto:yaacovbod@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>yaacovbod@gmail.com</a>
      </footer>
    </>
  )
}
