# Water Toy Frame Redesign

**Date:** 2026-04-12  
**Status:** Approved

## Goal

Replace the current generic handheld phone frame with a nostalgic water ring toss toy aesthetic — matching the visual shape of the classic plastic water game toy (orange/amber body, transparent water chamber, dome bumps at top corners, two red pump buttons on the base).

## Visual Design

### Frame Shape
- **Overall:** Portrait-oriented toy body, orange/amber gradient, same responsive sizing as today (`clamp(300px, 88vw, 420px)`)
- **Top corners:** Two raised golden dome bumps — decorative circular elements at top-left and top-right, matching the toy's bubble/rivet details
- **Water chamber:** Large clear/blue-tinted inset rectangle (the `handheld-screen` area) with rounded corners and a deep glass-like inner shadow — this is where all screen content renders, unchanged
- **Base:** Taller, wider trapezoidal section below the chamber. Achieved with bottom border-radius wider than top, extra horizontal padding, and extra height. Contains the two red buttons and "FigPals" label
- **Two red buttons:** Symmetrically placed left and right inside the base — large circular red buttons with a glossy highlight, matching the toy's pump button aesthetic. They replace the current `game-controls` strip inside `GameScreen`

### Colors
- Frame body: existing `--frame-orange` / `--frame-orange-light` / `--frame-orange-dark` CSS variables (no color changes)
- Buttons: red (`#e32`) with radial highlight for depth, darkens on press
- Chamber: existing `--screen-bg` (light blue water color)

## Architecture

### New: `GameControlsContext`
A new context (`src/context/GameControlsContext.js`) solves the reactivity problem: handler functions are stable refs, but state values like `leftCoolingDown` change every render. Rather than a one-time callback (which would capture stale values), `GameScreen` publishes the full live controls object to context on every render, and `HandheldFrame` consumes it.

```js
// src/context/GameControlsContext.js
import { createContext, useContext } from 'react'
export const GameControlsContext = createContext(null)
export const useGameControls = () => useContext(GameControlsContext)
```

Context value shape:
```js
{
  pressLeft, releaseLeft, leftCoolingDown, leftCharging,
  pressRight, releaseRight, rightCoolingDown, rightCharging,
}
```
When not in game screen, context value is `null` — buttons render dimmed.

### Changes to `GameScreen.jsx`
- Wrap its return in `<GameControlsContext.Provider value={controls}>` where `controls` is the object of handlers + state from `useGameLoop`
- Remove the `<div className="game-controls">` block and its two `<PumpButton />` renders

### Changes to `App.jsx`
- No controls state needed — context handles it
- No other changes required

### Changes to `HandheldFrame.jsx`
- Call `useGameControls()` to get live controls (or `null`)
- Replace `handheld-top-bar` structure with two dome bumps (`.handheld-dome-left`, `.handheld-dome-right`)
- Add `.handheld-base` as a real styled element (currently just a height strip) containing:
  - `.handheld-brand` label ("FigPals")
  - Two `.handheld-pump-btn` elements wired to context handlers

### Changes to `handheld.css`
- Reshape `.handheld-frame` bottom to be wider (larger bottom border-radius, wider bottom padding via pseudo-element or wrapper trick)
- New `.handheld-dome-left` / `.handheld-dome-right` styles: absolute-positioned circles at top corners
- New `.handheld-base` styles: taller, trapezoidal feel, flex row with space-between for the two buttons
- New `.handheld-pump-btn` styles: large red circle, glossy radial highlight, press state (scale down + darken), disabled state (opacity 0.45)
- New `.handheld-pump-btn--cooling` and `.handheld-pump-btn--charging` modifier classes mirroring the existing `pump-cooldown` and `pump-charge-fill` visual states

### `PumpButton` component
- No changes — it stays used nowhere new (GameScreen stops using it, frame uses raw buttons styled via CSS)
- Can be deleted in a follow-up cleanup once confirmed unused

## Files Changed
| File | Change |
|------|--------|
| `src/context/GameControlsContext.js` | New — context definition |
| `src/components/HandheldFrame.jsx` | Consume context, dome bumps, base buttons |
| `src/styles/handheld.css` | Reshape frame, add dome/base/button styles |
| `src/screens/GameScreen.jsx` | Provide context, remove `game-controls` div |
| `src/App.jsx` | No changes needed |

## Out of Scope
- Any changes to game logic, physics, scoring, or other screens
- Deleting `PumpButton.jsx` (deferred cleanup)
- Changes to colors/theming beyond what's described
