import { useState } from 'react'
import { GameControlsProvider } from './context/GameControlsContext.jsx'
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

  const handleSubmitted = () => {
    setScreen('submitted')
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
            onSubmitted={handleSubmitted}
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
      <HandheldFrame>
        {renderScreen()}
      </HandheldFrame>
    </GameControlsProvider>
  )
}
