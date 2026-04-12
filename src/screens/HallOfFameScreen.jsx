import useLeaderboard from '../hooks/useLeaderboard'
import '../styles/screens.css'

export default function HallOfFameScreen({ onPlayAgain, onBack }) {
  const { rows, loading, error } = useLeaderboard()

  return (
    <div className="screen hof-screen">
      <h2 className="hof-title">🏆 Hall of Fame</h2>

      <div className="hof-section">
        {loading ? (
          <p className="hof-empty">Loading...</p>
        ) : error ? (
          <p className="hof-empty">Error: {error}</p>
        ) : rows.length === 0 ? (
          <p className="hof-empty">No scores yet — be the first!</p>
        ) : (
          rows.map((row, i) => (
            <div className="hof-row" key={row.id}>
              <span className="hof-rank">{i + 1}</span>
              <div className="hof-avatar">
                {row.figpal_pfp && (
                  <img src={`/figpals/${row.figpal_pfp}.png`} alt="" />
                )}
              </div>
              <span className="hof-name">{row.player_name}</span>
              <span className="hof-score-val">{row.score}</span>
            </div>
          ))
        )}
      </div>

      <button className="btn-play" onClick={onPlayAgain}>
        🎮 Play Again
      </button>
      <button className="btn-back" onClick={onBack}>
        ← Back to Menu
      </button>
    </div>
  )
}
