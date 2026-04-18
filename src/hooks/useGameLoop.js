import { useState, useRef, useCallback, useEffect } from 'react'
import {
  createEngine,
  createWalls,
  createHoop,
  createBubble,
  applyWaterCurrent,
  setupCollisionDetection,
  stepEngine,
  destroyEngine,
  Composite,
} from '../lib/physics'
import { getRandomFigpal } from '../data/figpals'

const GAME_DURATION    = 60    // seconds
const BUBBLE_RADIUS    = 22
const MAX_BUBBLES      = 8
const SPAWN_INTERVAL   = 1800  // ms
const HOOP_GAP         = 70

// Hold mechanic: force fires immediately on press and ramps from MIN_POWER → 1.0
// over MAX_HOLD_MS. On release the force stops and cooldown ticks down.
const COOLDOWN_DURATION = 1750  // ms total cooldown measured from press start
const MAX_HOLD_MS       = 700   // ms of hold to reach full power
const MIN_POWER         = 0.25  // power at the moment of press (instant tap)

export default function useGameLoop({ worldWidth, worldHeight, onTimeUp }) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [bubbles, setBubbles] = useState([])
  const [hoops, setHoops] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  // Burst active — used for physics tick and jet visual
  const [leftBurstActive, setLeftBurstActive]   = useState(false)
  const [rightBurstActive, setRightBurstActive] = useState(false)
  // Cooldown active — used for button UI
  const [leftCoolingDown, setLeftCoolingDown]   = useState(false)
  const [rightCoolingDown, setRightCoolingDown] = useState(false)
  // Charging state — button is being held before release
  const [leftCharging, setLeftCharging]   = useState(false)
  const [rightCharging, setRightCharging] = useState(false)

  const engineRef        = useRef(null)
  const rafRef           = useRef(null)
  const timerRef         = useRef(null)
  const spawnRef         = useRef(null)
  const leftHeldRef      = useRef(0)      // 0 or power 0.25–1.0; read every tick by physics
  const rightHeldRef     = useRef(0)
  const leftChargingRef       = useRef(false)  // prevents double-fire on release
  const rightChargingRef      = useRef(false)
  const leftAutoReleaseRef    = useRef(null)   // auto-release timer
  const rightAutoReleaseRef   = useRef(null)
  const bubblesRef       = useRef([])
  const scoreRef         = useRef(0)
  const lastTimeRef      = useRef(0)
  const leftLastPress    = useRef(0)      // timestamp of last accepted left press
  const rightLastPress   = useRef(0)

  const randomFigpalId = () => getRandomFigpal().id

  // ── Left press ────────────────────────────────────────────────────────────
  const pressLeft = useCallback(() => {
    const now = performance.now()
    if (leftChargingRef.current) return                          // already held
    if (now - leftLastPress.current < COOLDOWN_DURATION) return  // on cooldown
    leftLastPress.current = now
    leftChargingRef.current = true
    leftHeldRef.current = MIN_POWER   // fire immediately at minimum power
    setLeftCharging(true)
    setLeftBurstActive(true)
    setLeftCoolingDown(true)
    // Auto-release at MAX_HOLD_MS so the button never stays locked forever
    leftAutoReleaseRef.current = setTimeout(() => releaseLeft(), MAX_HOLD_MS)
  }, [])

  const releaseLeft = useCallback(() => {
    clearTimeout(leftAutoReleaseRef.current)
    if (!leftChargingRef.current) return
    leftChargingRef.current = false
    leftHeldRef.current = 0           // stop force immediately
    setLeftCharging(false)
    setLeftBurstActive(false)

    const elapsed   = performance.now() - leftLastPress.current
    const remaining = Math.max(COOLDOWN_DURATION - elapsed, 200)
    setTimeout(() => setLeftCoolingDown(false), remaining)
  }, [])

  // ── Right press ───────────────────────────────────────────────────────────
  const pressRight = useCallback(() => {
    const now = performance.now()
    if (rightChargingRef.current) return
    if (now - rightLastPress.current < COOLDOWN_DURATION) return
    rightLastPress.current = now
    rightChargingRef.current = true
    rightHeldRef.current = MIN_POWER
    setRightCharging(true)
    setRightBurstActive(true)
    setRightCoolingDown(true)
    rightAutoReleaseRef.current = setTimeout(() => releaseRight(), MAX_HOLD_MS)
  }, [])

  const releaseRight = useCallback(() => {
    clearTimeout(rightAutoReleaseRef.current)
    if (!rightChargingRef.current) return
    rightChargingRef.current = false
    rightHeldRef.current = 0
    setRightCharging(false)
    setRightBurstActive(false)

    const elapsed   = performance.now() - rightLastPress.current
    const remaining = Math.max(COOLDOWN_DURATION - elapsed, 200)
    setTimeout(() => setRightCoolingDown(false), remaining)
  }, [])

  const spawnBubble = useCallback(() => {
    if (!engineRef.current || !worldWidth) return

    // Wait until a bubble is scored/removed before adding more — don't forcibly evict
    if (bubblesRef.current.length >= MAX_BUBBLES) return

    const x = worldWidth * 0.2 + Math.random() * worldWidth * 0.6
    const y = worldHeight - BUBBLE_RADIUS * 2
    const bubble = createBubble(x, y, BUBBLE_RADIUS, randomFigpalId())
    Composite.add(engineRef.current.world, bubble)
    bubblesRef.current = [...bubblesRef.current, bubble]
  }, [worldWidth, worldHeight])

  const start = useCallback(() => {
    if (!worldWidth || !worldHeight) return

    const engine = createEngine()
    engineRef.current = engine
    scoreRef.current = 0
    setScore(0)
    setTimeLeft(GAME_DURATION)
    bubblesRef.current = []
    leftLastPress.current  = 0
    rightLastPress.current = 0

    const walls = createWalls(worldWidth, worldHeight)
    Composite.add(engine.world, walls)

    const hoopConfigs = [
      { x: worldWidth * 0.32, y: worldHeight * 0.62, id: 'hoop-1' }, // left, lower
      { x: worldWidth * 0.68, y: worldHeight * 0.32, id: 'hoop-2' }, // right, higher
    ]

    const createdHoops = hoopConfigs.map((cfg) => {
      const hoop = createHoop(cfg.x, cfg.y, HOOP_GAP, cfg.id)
      Composite.add(engine.world, [hoop.leftRim, hoop.rightRim, hoop.sensor])
      return hoop
    })
    setHoops(createdHoops)

    setupCollisionDetection(engine, (bubble) => {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setTimeout(() => {
        if (engineRef.current) {
          Composite.remove(engineRef.current.world, bubble)
          bubblesRef.current = bubblesRef.current.filter((b) => b !== bubble)
        }
      }, 300)
    })

    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnBubble(), i * 400)
    }

    spawnRef.current = setInterval(spawnBubble, SPAWN_INTERVAL)

    let remaining = GAME_DURATION
    timerRef.current = setInterval(() => {
      remaining -= 1
      setTimeLeft(remaining)
      if (remaining <= 0) {
        stop()
        onTimeUp(scoreRef.current)
      }
    }, 1000)

    lastTimeRef.current = performance.now()
    setIsRunning(true)

    const tick = (timestamp) => {
      if (!engineRef.current) return

      const delta = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Ramp power up each frame while button is held
      if (leftChargingRef.current) {
        const holdMs = Math.min(performance.now() - leftLastPress.current, MAX_HOLD_MS)
        leftHeldRef.current = MIN_POWER + (1 - MIN_POWER) * (holdMs / MAX_HOLD_MS)
      }
      if (rightChargingRef.current) {
        const holdMs = Math.min(performance.now() - rightLastPress.current, MAX_HOLD_MS)
        rightHeldRef.current = MIN_POWER + (1 - MIN_POWER) * (holdMs / MAX_HOLD_MS)
      }

      applyWaterCurrent(
        bubblesRef.current,
        worldWidth,
        worldHeight,
        leftHeldRef.current,
        rightHeldRef.current
      )

      stepEngine(engineRef.current, Math.min(delta, 32))

      bubblesRef.current = bubblesRef.current.filter((b) => {
        if (b.position.y > worldHeight + 50) {
          Composite.remove(engineRef.current.world, b)
          return false
        }
        return true
      })

      setBubbles(
        bubblesRef.current.map((b) => ({
          id: b.id,
          x: b.position.x,
          y: b.position.y,
          angle: b.angle,
          figpalId: b.plugin.figpalId,
          scored: b.plugin.scored,
          radius: BUBBLE_RADIUS,
        }))
      )

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [worldWidth, worldHeight, onTimeUp, spawnBubble])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    if (spawnRef.current) clearInterval(spawnRef.current)
    rafRef.current  = null
    timerRef.current = null
    spawnRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      stop()
      if (engineRef.current) {
        destroyEngine(engineRef.current)
        engineRef.current = null
      }
    }
  }, [stop])

  return {
    score,
    timeLeft,
    bubbles,
    hoops,
    isRunning,
    start,
    stop,
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
  }
}
