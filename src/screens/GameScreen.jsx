import { useRef, useEffect, useCallback } from 'react'
import { useState } from 'react'
import useGameLoop from '../hooks/useGameLoop'
import GameCanvas from '../components/GameCanvas'
import PumpButton from '../components/PumpButton'
import '../styles/game.css'

export default function GameScreen({ onTimeUp }) {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const handleTimeUp = useCallback((finalScore) => {
    onTimeUp(finalScore)
  }, [onTimeUp])

  const {
    score,
    timeLeft,
    bubbles,
    hoops,
    start,
    pressLeft,
    releaseLeft,
    pressRight,
    releaseRight,
    leftBurstActive,
    rightBurstActive,
    leftCoolingDown,
    rightCoolingDown,
    leftCharging,
    rightCharging,
  } = useGameLoop({
    worldWidth: dimensions.width,
    worldHeight: dimensions.height,
    onTimeUp: handleTimeUp,
  })

  const startedRef = useRef(false)
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && !startedRef.current) {
      startedRef.current = true
      start()
    }
  }, [dimensions, start])

  return (
    <div className="game-screen">
      <div className="game-hud">
        <div className={`game-timer${timeLeft <= 10 ? ' warning' : ''}`}>
          {timeLeft}s
        </div>
        <div className="game-score">{score}</div>
      </div>
      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {dimensions.width > 0 && (
          <GameCanvas
            bubbles={bubbles}
            hoops={hoops}
            leftHeld={leftBurstActive}
            rightHeld={rightBurstActive}
          />
        )}
      </div>
      <div className="game-controls">
        <PumpButton
          direction="left"
          onPressDown={pressLeft}
          onPressUp={releaseLeft}
          isCoolingDown={leftCoolingDown}
          isCharging={leftCharging}
        />
        <PumpButton
          direction="right"
          onPressDown={pressRight}
          onPressUp={releaseRight}
          isCoolingDown={rightCoolingDown}
          isCharging={rightCharging}
        />
      </div>
    </div>
  )
}
