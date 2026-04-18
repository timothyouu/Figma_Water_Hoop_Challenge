import { useMemo } from 'react'
import useLeaderboard from '../hooks/useLeaderboard'
import { getFigpalSrc } from '../data/figpals'
import '../styles/screens.css'

const PLAYER_KEY = 'figpals_player'

export default function HallOfFameScreen({ onBack }) {
  const { rows, loading, error } = useLeaderboard()

  const myRowId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(PLAYER_KEY))?.rowId ?? null
    } catch {
      return null
    }
  }, [])

  return (
    <div className="screen hof-screen">
      <h2 className="hof-title">Hall of Fame</h2>

      <div className="hof-section">
        {loading ? (
          <p className="hof-empty">Loading...</p>
        ) : error ? (
          <p className="hof-empty">Error: {error}</p>
        ) : rows.length === 0 ? (
          <p className="hof-empty">No scores yet — be the first!</p>
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

      <button className="btn-back" onClick={onBack}>
        Back to Menu
      </button>
    </div>
  )
}
