import { useState } from 'react'
import { GameControlsProvider } from './context/GameControlsContext'
import HandheldFrame from './components/HandheldFrame'
import LandingScreen from './screens/LandingScreen'
import GameScreen from './screens/GameScreen'
import TimesUpScreen from './screens/TimesUpScreen'
import ScoreSubmittedScreen from './screens/ScoreSubmittedScreen'
import HallOfFameScreen from './screens/HallOfFameScreen'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [finalScore, setFinalScore] = useState(0)

  const handleTimeUp = (score) => {
    setFinalScore(score)
    setScreen('timesup')
  }

  const handlePlayAgain = () => {
    setFinalScore(0)
    setScreen('game')
  }

  const renderScreen = () => {
    switch (screen) {
      case 'landing':
        return (
          <LandingScreen
            onPlay={() => setScreen('game')}
            onHallOfFame={() => setScreen('halloffame')}
          />
        )
      case 'game':
        return <GameScreen onTimeUp={handleTimeUp} />
      case 'timesup':
        return (
          <TimesUpScreen
            score={finalScore}
            onSkip={handlePlayAgain}
          />
        )
      case 'submitted':
        return (
          <ScoreSubmittedScreen
            score={finalScore}
            onPlayAgain={handlePlayAgain}
            onHallOfFame={() => setScreen('halloffame')}
          />
        )
      case 'halloffame':
        return (
          <HallOfFameScreen
            onPlayAgain={handlePlayAgain}
            onBack={() => setScreen('landing')}
          />
        )
      default:
        return null
    }
  }

  return (
    <GameControlsProvider>
      <div className="page-wrapper">
        <div className="bg-decorations" aria-hidden="true">
          <img src="/illustrations/submarine.png"     className="bg-illo bg-illo--submarine"      alt="" />
          <img src="/illustrations/fish-school.png"   className="bg-illo bg-illo--fish-school"    alt="" />
          <img src="/illustrations/capybara-sushi.png" className="bg-illo bg-illo--capybara-sushi" alt="" />
          <img src="/illustrations/octopus-sushi.png" className="bg-illo bg-illo--octopus-sushi"  alt="" />

          {[
            { size: 48, left: '6%',  bottom: '12%', dur: '9s',  delay: '0s'   },
            { size: 22, left: '14%', bottom: '30%', dur: '6s',  delay: '1.2s' },
            { size: 64, left: '9%',  bottom: '4%',  dur: '12s', delay: '2s'   },
            { size: 18, left: '80%', bottom: '38%', dur: '7s',  delay: '0.5s' },
            { size: 38, left: '87%', bottom: '18%', dur: '10s', delay: '3s'   },
            { size: 56, left: '83%', bottom: '5%',  dur: '13s', delay: '1.5s' },
            { size: 26, left: '48%', bottom: '2%',  dur: '8s',  delay: '4s'   },
            { size: 16, left: '70%', bottom: '22%', dur: '7s',  delay: '2.8s' },
            { size: 30, left: '28%', bottom: '6%',  dur: '9s',  delay: '3.5s' },
          ].map((b, i) => (
            <div
              key={i}
              className="bg-bubble-float"
              style={{
                width: b.size,
                height: b.size,
                left: b.left,
                bottom: b.bottom,
                animationDuration: b.dur,
                animationDelay: b.delay,
              }}
            />
          ))}
        </div>

        <HandheldFrame>
          {renderScreen()}
        </HandheldFrame>
      </div>
    </GameControlsProvider>
  )
}
