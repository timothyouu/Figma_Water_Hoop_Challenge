import { useState, useEffect } from 'react'
import useSubmitScore from '../hooks/useSubmitScore'
import useLeaderboard from '../hooks/useLeaderboard'
import FigPalPicker from '../components/FigPalPicker'
import { getFigpalSrc } from '../data/figpals'
import '../styles/screens.css'

const PLAYER_KEY = 'figpals_player'

export default function TimesUpScreen({ score, onSkip }) {
  const [playerName, setPlayerName] = useState('')
  const [selectedPfp, setSelectedPfp] = useState(null)   // null = no avatar chosen yet
  const [myRowId, setMyRowId] = useState(null)
  const { submit, status, errorMsg } = useSubmitScore()
  const { rows, loading } = useLeaderboard()

  // Pre-fill name + avatar from a previous session on this device
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PLAYER_KEY))
      if (saved?.playerName) setPlayerName(saved.playerName)
      if (saved?.figpalPfp) setSelectedPfp(saved.figpalPfp)
    } catch {
      // ignore bad JSON
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!playerName.trim() || !selectedPfp) return

    let existingRowId = null
    try {
      const saved = JSON.parse(localStorage.getItem(PLAYER_KEY))
      existingRowId = saved?.rowId ?? null
    } catch { /* ignore */ }

    const result = await submit({
      playerName: playerName.trim(),
      score,
      figpalPfp: selectedPfp,
      existingRowId,
    })

    if (result?.rowId) {
      const { rowId, finalScore } = result
      setMyRowId(rowId)
      localStorage.setItem(PLAYER_KEY, JSON.stringify({
        rowId,
        playerName: playerName.trim(),
        figpalPfp: selectedPfp,
        score: finalScore,
      }))
    }
  }

  // ── Post-submit: score + leaderboard + play again ─────────────────────────
  if (status === 'saved') {
    return (
      <div className="screen timesup-screen">
        <p className="timesup-score-label">Your Score</p>
        <p className="timesup-score">{score}</p>

        <div className="timesup-leaderboard">
          <p className="timesup-lb-title">Leaderboard</p>
          {loading ? (
            <p className="hof-empty">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="hof-empty">No scores yet</p>
          ) : (
            rows.map((row, i) => (
              <div
                className={`hof-row${row.id === myRowId ? ' hof-row--me' : ''}`}
                key={row.id}
              >
                <span className="hof-rank">{i + 1}</span>
                <div className="hof-avatar">
                  {row.figpal_pfp && (
                    <img src={getFigpalSrc(row.figpal_pfp)} alt="" />
                  )}
                </div>
                <span className="hof-name">{row.player_name}</span>
                <span className="hof-score-val">{row.score}</span>
              </div>
            ))
          )}
        </div>

        <button className="btn-play" onClick={onSkip}>Play Again</button>
      </div>
    )
  }

  // ── Form: name + avatar picker + submit ───────────────────────────────────
  return (
    <div className="screen timesup-screen">
      <p className="timesup-title">Time's Up!</p>
      <p className="timesup-score">{score}</p>

      <div className="timesup-section">
        <form onSubmit={handleSubmit}>
          <input
            className="timesup-input"
            type="text"
            placeholder="Your name..."
            maxLength={24}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={status === 'saving'}
          />
          <p className="timesup-avatar-label">
            Choose your avatar{!selectedPfp && <span className="timesup-avatar-required"> (required)</span>}
          </p>
          <FigPalPicker selected={selectedPfp} onSelect={setSelectedPfp} />
          <button
            type="submit"
            className="btn-submit"
            disabled={status === 'saving' || !playerName.trim() || !selectedPfp}
          >
            {status === 'saving' ? 'Saving...' : 'Submit'}
          </button>
        </form>
        {status === 'error' && (
          <p className="timesup-error">{errorMsg || 'Failed to save. Try again.'}</p>
        )}
      </div>

    </div>
  )
}
