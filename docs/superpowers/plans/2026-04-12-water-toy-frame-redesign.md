# Water Toy Frame Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current handheld phone frame with a nostalgic water ring toss toy aesthetic — orange body, golden dome bumps at top corners, transparent water chamber, and two red pump buttons embedded in the base.

**Architecture:** A new `GameControlsContext` (provided in `App.jsx`) lets `GameScreen` publish its live pump button state upward without prop-drilling through the component hierarchy. `HandheldFrame` consumes that context to wire its base buttons. When not on the game screen, controls are `null` and buttons render dimmed.

**Tech Stack:** React 19, CSS (no additional libraries)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/context/GameControlsContext.js` | **Create** | Context definition + provider + two consumer hooks |
| `src/App.jsx` | **Modify** | Wrap render tree in `GameControlsProvider` |
| `src/screens/GameScreen.jsx` | **Modify** | Publish controls to context; remove `game-controls` div |
| `src/styles/handheld.css` | **Modify** | Full restyle: dome bumps, water window margin, base, red buttons |
| `src/components/HandheldFrame.jsx` | **Modify** | New DOM structure consuming context; dome bumps + base buttons |

---

## Task 1: Create `GameControlsContext`

**Files:**
- Create: `src/context/GameControlsContext.js`

- [ ] **Step 1: Create the context file**

```js
// src/context/GameControlsContext.js
import { createContext, useContext, useState } from 'react'

const GameControlsContext = createContext(null)
const SetGameControlsContext = createContext(null)

export function GameControlsProvider({ children }) {
  const [controls, setControls] = useState(null)
  return (
    <SetGameControlsContext.Provider value={setControls}>
      <GameControlsContext.Provider value={controls}>
        {children}
      </GameControlsContext.Provider>
    </SetGameControlsContext.Provider>
  )
}

// HandheldFrame calls this to read live controls (or null when not in game)
export const useGameControls = () => useContext(GameControlsContext)

// GameScreen calls this to publish its controls upward
export const useSetGameControls = () => useContext(SetGameControlsContext)
```

- [ ] **Step 2: Verify the file exists**

Run: `ls src/context/`
Expected output: `GameControlsContext.js`

- [ ] **Step 3: Commit**

```bash
git add src/context/GameControlsContext.js
git commit -m "feat: add GameControlsContext for frame↔game communication"
```

---

## Task 2: Wrap App in `GameControlsProvider`

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add the provider import and wrap the return**

The full updated `src/App.jsx`:

```jsx
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
```

- [ ] **Step 2: Start dev server and verify app still renders**

Run: `npm run dev`
Open browser. Expected: landing screen displays inside the orange frame, no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wrap app in GameControlsProvider"
```

---

## Task 3: Update `GameScreen` — publish controls, remove button strip

**Files:**
- Modify: `src/screens/GameScreen.jsx`

- [ ] **Step 1: Replace the full file**

```jsx
import { useRef, useEffect, useCallback, useState } from 'react'
import useGameLoop from '../hooks/useGameLoop'
import GameCanvas from '../components/GameCanvas'
import { useSetGameControls } from '../context/GameControlsContext'
import '../styles/game.css'

export default function GameScreen({ onTimeUp }) {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const setControls = useSetGameControls()

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

  // Publish live controls to context so HandheldFrame can wire its buttons
  useEffect(() => {
    setControls({
      pressLeft,
      releaseLeft,
      pressRight,
      releaseRight,
      leftCoolingDown,
      rightCoolingDown,
      leftCharging,
      rightCharging,
    })
  }, [
    pressLeft, releaseLeft, pressRight, releaseRight,
    leftCoolingDown, rightCoolingDown, leftCharging, rightCharging,
    setControls,
  ])

  // Clear controls from frame when game screen unmounts
  useEffect(() => {
    return () => setControls(null)
  }, [setControls])

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
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

With dev server running: navigate to game screen. Expected:
- The bottom button strip inside the screen area is gone
- Game still starts and physics run normally
- No console errors

- [ ] **Step 3: Commit**

```bash
git add src/screens/GameScreen.jsx
git commit -m "feat: publish game controls to context, remove in-screen button strip"
```

---

## Task 4: Restyle `handheld.css`

**Files:**
- Modify: `src/styles/handheld.css`

- [ ] **Step 1: Replace the entire file**

```css
/* === Handheld Water Toy Frame === */

.handheld-frame {
  position: relative;
  width: clamp(300px, 88vw, 420px);
  aspect-ratio: 4 / 5;
  max-height: 95svh;
  background: linear-gradient(160deg, var(--frame-orange-light) 0%, var(--frame-orange) 40%, var(--frame-orange-dark) 100%);
  border-radius: 18px 18px 22px 22px;
  box-shadow:
    0 0 0 4px var(--frame-orange-dark),
    0 12px 40px rgba(0, 0, 0, 0.55),
    inset 0 2px 6px rgba(255, 255, 255, 0.25),
    inset 0 -3px 6px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Golden dome bumps at top corners */
.handheld-dome {
  position: absolute;
  top: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fce97a, #e8a820 50%, #9a6808);
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.45),
    inset 0 2px 5px rgba(255, 255, 255, 0.4),
    inset 0 -2px 4px rgba(0, 0, 0, 0.25);
  z-index: 2;
}

.handheld-dome--left  { left: 12px; }
.handheld-dome--right { right: 12px; }

/* Water window — inset frame around the clear play area */
.handheld-water-window {
  flex: 1;
  margin: 50px 14px 0;
  border-radius: 10px;
  padding: 4px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.25) 100%);
  box-shadow:
    inset 0 3px 8px rgba(0, 0, 0, 0.6),
    inset 0 0 0 1px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.handheld-screen {
  flex: 1;
  background: var(--screen-bg);
  border-radius: 7px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
}

/* Base strip — contains brand label + pump buttons */
.handheld-base {
  flex-shrink: 0;
  padding: 8px 20px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.handheld-brand {
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.handheld-base-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

/* Red pump buttons */
.handheld-pump-btn {
  position: relative;
  overflow: hidden;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 30%, #ff5040, #cc1a0a 60%, #8a0e06);
  box-shadow:
    0 5px 14px rgba(0, 0, 0, 0.45),
    0 0 0 3px rgba(0, 0, 0, 0.25),
    inset 0 2px 5px rgba(255, 255, 255, 0.3),
    inset 0 -3px 5px rgba(0, 0, 0, 0.3);
  border: none;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.08s, box-shadow 0.08s;
}

.handheld-pump-btn:active:not(.handheld-pump-btn--cooling):not(.handheld-pump-btn--inactive) {
  transform: scale(0.88);
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.5),
    0 0 0 3px rgba(0, 0, 0, 0.25),
    inset 0 3px 7px rgba(0, 0, 0, 0.35),
    inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

.handheld-pump-btn--inactive {
  opacity: 0.45;
  pointer-events: none;
}

.handheld-pump-btn--cooling {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Charge and cooldown overlays — mirrors game.css but with unique keyframe names */
.handheld-pump-charge {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: hpChargeSweep 0.7s linear forwards;
  pointer-events: none;
}

.handheld-pump-sweep {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: hpCooldownSweep 1.75s linear forwards;
  pointer-events: none;
}

@keyframes hpChargeSweep {
  from { background: conic-gradient(rgba(255, 220, 50, 0.38) 0deg,   transparent 0deg); }
  to   { background: conic-gradient(rgba(255, 220, 50, 0.38) 360deg, transparent 360deg); }
}

@keyframes hpCooldownSweep {
  from { background: conic-gradient(rgba(255, 255, 255, 0.22) 360deg, transparent 360deg); }
  to   { background: conic-gradient(rgba(255, 255, 255, 0.22) 0deg,   transparent 0deg);  }
}

@media (max-height: 580px) {
  .handheld-frame {
    border-radius: 14px 14px 16px 16px;
    max-height: 100svh;
  }

  .handheld-water-window {
    margin: 50px 10px 0;
  }

  .handheld-base {
    padding: 6px 16px 10px;
  }

  .handheld-pump-btn {
    width: 44px;
    height: 44px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/handheld.css
git commit -m "feat: restyle handheld frame to water toy aesthetic"
```

---

## Task 5: Rewrite `HandheldFrame.jsx`

**Files:**
- Modify: `src/components/HandheldFrame.jsx`

- [ ] **Step 1: Replace the full file**

```jsx
import { useGameControls } from '../context/GameControlsContext'
import '../styles/handheld.css'

export default function HandheldFrame({ children }) {
  const controls = useGameControls()

  return (
    <div className="handheld-frame">
      <div className="handheld-dome handheld-dome--left" />
      <div className="handheld-dome handheld-dome--right" />

      <div className="handheld-water-window">
        <div className="handheld-screen">
          {children}
        </div>
      </div>

      <div className="handheld-base">
        <div className="handheld-brand">FigPals</div>
        <div className="handheld-base-buttons">
          <button
            className={[
              'handheld-pump-btn',
              !controls              ? 'handheld-pump-btn--inactive' : '',
              controls?.leftCoolingDown ? 'handheld-pump-btn--cooling'  : '',
            ].join(' ').trim()}
            onPointerDown={(e) => { e.preventDefault(); controls?.pressLeft() }}
            onPointerUp={(e)   => { e.preventDefault(); controls?.releaseLeft() }}
            onPointerLeave={(e) => { e.preventDefault(); controls?.releaseLeft() }}
            onPointerCancel={(e) => { e.preventDefault(); controls?.releaseLeft() }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {controls?.leftCharging   && <span key="lc" className="handheld-pump-charge" />}
            {controls?.leftCoolingDown && <span key="ls" className="handheld-pump-sweep"  />}
          </button>

          <button
            className={[
              'handheld-pump-btn',
              !controls               ? 'handheld-pump-btn--inactive' : '',
              controls?.rightCoolingDown ? 'handheld-pump-btn--cooling'  : '',
            ].join(' ').trim()}
            onPointerDown={(e) => { e.preventDefault(); controls?.pressRight() }}
            onPointerUp={(e)   => { e.preventDefault(); controls?.releaseRight() }}
            onPointerLeave={(e) => { e.preventDefault(); controls?.releaseRight() }}
            onPointerCancel={(e) => { e.preventDefault(); controls?.releaseRight() }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {controls?.rightCharging   && <span key="rc" className="handheld-pump-charge" />}
            {controls?.rightCoolingDown && <span key="rs" className="handheld-pump-sweep"  />}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Full visual verification**

With dev server running, check all screens:

1. **Landing screen** — frame renders with dome bumps at top corners, "FigPals" label in base, two red buttons visible but dimmed (opacity ~0.45)
2. **Game screen** — red buttons are bright and interactive; pressing left button pushes bubbles right, pressing right button pushes bubbles left; cooldown sweep animation plays after each press; charge fill animation plays while held
3. **Times Up screen** — buttons return to dimmed state
4. **Hall of Fame screen** — buttons remain dimmed

- [ ] **Step 3: Commit**

```bash
git add src/components/HandheldFrame.jsx
git commit -m "feat: rewrite HandheldFrame as water toy with dome bumps and base buttons"
```
