import '../styles/screens.css'

export default function LandingScreen({ onPlay, onHallOfFame }) {
  return (
    <div className="screen landing-screen">
      <div className="landing-logo">
        <span role="img" aria-label="bubble">🫧</span>
      </div>
      <h1 className="landing-title">
        FigPals<br />Bubble Blast!
      </h1>
      <p className="landing-subtitle">
        Pump bubbles through the hoops!
      </p>
      <button className="btn-play" onClick={onPlay}>
        🎮 Play Now
      </button>
      <button className="btn-hof" onClick={onHallOfFame}>
        🏆 Hall of Fame
      </button>
    </div>
  )
}
