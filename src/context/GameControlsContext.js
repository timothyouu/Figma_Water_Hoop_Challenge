import { createContext, useContext, useState, createElement } from 'react'

const GameControlsContext = createContext(null)
const SetGameControlsContext = createContext(null)

export function GameControlsProvider({ children }) {
  const [controls, setControls] = useState(null)
  return createElement(
    SetGameControlsContext.Provider,
    { value: setControls },
    createElement(
      GameControlsContext.Provider,
      { value: controls },
      children
    )
  )
}

// HandheldFrame calls this to read live controls (or null when not in game)
export const useGameControls = () => useContext(GameControlsContext)

// GameScreen calls this to publish its controls upward
export const useSetGameControls = () => useContext(SetGameControlsContext)
