'use client'

import { useState, useCallback } from 'react'
import type { ScoreEntry } from '@/app/api/scores/route'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [secret, setSecret] = useState<string | null>(null)
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchScores = useCallback(async (s: string) => {
    const res = await fetch('/api/scores', { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json() as ScoreEntry[]
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/scores?secret=${password}&index=9999`, { method: 'DELETE' })
    if (res.status === 401) {
      setError('סיסמה שגויה')
      setLoading(false)
      return
    }
    const data = await fetchScores(password)
    if (!data) { setError('שגיאה בטעינה'); setLoading(false); return }
    setSecret(password)
    setScores(data)
    setLoading(false)
  }

  const handleDelete = async (index: number, name: string) => {
    if (!confirm(`למחוק את "${name}"?`)) return
    setLoading(true)
    const res = await fetch(`/api/scores?secret=${secret}&index=${index}`, { method: 'DELETE' })
    if (!res.ok) { setError('שגיאה במחיקה'); setLoading(false); return }
    const fresh = await fetchScores(secret!)
    if (fresh) setScores(fresh)
    setLoading(false)
  }

  if (!secret) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f172a', fontFamily: 'sans-serif', direction: 'rtl'
      }}>
        <div style={{
          background: '#1e293b', borderRadius: 12, padding: '2.5rem 3rem',
          display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 320,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <h1 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.4rem', textAlign: 'center' }}>ניהול תוצאות</h1>
          <input
            type="password"
            placeholder="סיסמת אדמין"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid #334155',
              background: '#0f172a', color: '#f1f5f9', fontSize: '1rem', outline: 'none'
            }}
          />
          {error && <p style={{ color: '#f87171', margin: 0, textAlign: 'center' }}>{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading || !password}
            style={{
              padding: '0.6rem', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: loading ? '#475569' : '#3b82f6', color: '#fff', fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {loading ? 'טוען...' : 'כניסה'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a', padding: '2rem',
      fontFamily: 'sans-serif', direction: 'rtl', color: '#f1f5f9'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>ניהול תוצאות</h1>
      {loading && <p style={{ textAlign: 'center', color: '#94a3b8' }}>טוען...</p>}
      {error && <p style={{ textAlign: 'center', color: '#f87171' }}>{error}</p>}
      <table style={{ width: '100%', maxWidth: 700, margin: '0 auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '.85rem' }}>
            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>#</th>
            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>שם</th>
            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>בית ספר</th>
            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>זמן</th>
            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>תאריך</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => {
            const ms = s.timeMs
            const mins = Math.floor(ms / 60000)
            const secs = Math.floor((ms % 60000) / 1000)
            const ms2 = Math.floor((ms % 1000) / 10)
            return (
              <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{i + 1}</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>{s.name}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#94a3b8' }}>{s.school}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>
                  {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}.{String(ms2).padStart(2,'0')}
                </td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontSize: '.85rem' }}>{s.date}</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(i, s.name)}
                    disabled={loading}
                    style={{
                      background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
                      borderRadius: 6, padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    מחק
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {scores.length === 0 && !loading && (
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>אין תוצאות</p>
      )}
    </div>
  )
}
