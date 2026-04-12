import '../styles/screens.css'

export default function ScoreSubmittedScreen({ score, onPlayAgain, onHallOfFame }) {
  return (
    <div className="screen submitted-screen">
      <p className="timesup-title">⏰ Time's Up!</p>
      <p className="timesup-score-label">Final Score</p>
      <p className="timesup-score">{score}</p>

      <div className="submitted-badge">
        ✅ Score Saved!
      </div>

      <div className="timesup-section">
        <h3>🏆 Hall of Fame</h3>
        <button className="btn-hof" style={{ width: '100%' }} onClick={onHallOfFame}>
          View Leaderboard
        </button>
      </div>

      <button className="btn-skip" onClick={onPlayAgain}>
        🔁 Play Again
      </button>
    </div>
  )
}
