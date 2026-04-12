import { useState } from 'react'
import useSubmitScore from '../hooks/useSubmitScore'
import FigPalPicker from '../components/FigPalPicker'
import '../styles/screens.css'

export default function TimesUpScreen({ score, onSubmitted, onSkip }) {
  const [playerName, setPlayerName] = useState('')
  const [selectedPfp, setSelectedPfp] = useState('star')
  const { submit, status, errorMsg } = useSubmitScore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!playerName.trim()) return

    const success = await submit({
      playerName: playerName.trim(),
      score,
      figpalPfp: selectedPfp,
    })

    if (success) {
      onSubmitted(playerName.trim())
    }
  }

  return (
    <div className="screen timesup-screen">
      <p className="timesup-title">⏰ Time's Up!</p>
      <p className="timesup-score-label">Final Score</p>
      <p className="timesup-score">{score}</p>

      <div className="timesup-section">
        <h3>💾 Save Your Score</h3>
        <form onSubmit={handleSubmit}>
          <input
            className="timesup-input"
            type="text"
            placeholder="Enter your name..."
            maxLength={24}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={status === 'saving' || status === 'saved'}
          />
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '8px 0 4px' }}>
            Choose your avatar:
          </p>
          <FigPalPicker selected={selectedPfp} onSelect={setSelectedPfp} />
          <button
            type="submit"
            className="btn-submit"
            disabled={status === 'saving' || status === 'saved' || !playerName.trim()}
          >
            {status === 'saving' ? 'Saving...' : 'Submit Score ✓'}
          </button>
        </form>
        {status === 'error' && (
          <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: 6 }}>
            {errorMsg || 'Failed to save. Try again.'}
          </p>
        )}
      </div>

      <button className="btn-skip" onClick={onSkip}>
        🔁 Play Again
      </button>
    </div>
  )
}
