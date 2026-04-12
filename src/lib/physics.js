import Matter from 'matter-js'

const { Engine, World, Bodies, Body, Events, Composite } = Matter

// Create the physics engine with gravity
export function createEngine() {
  return Engine.create({
    gravity: { x: 0, y: 0.16 },  // moderate gravity → drifts downward at a comfortable pace
  })
}

// Create world boundaries (walls)
export function createWalls(width, height) {
  const wallThickness = 20
  const wallOpts = { isStatic: true, restitution: 0.9, friction: 0.0 }
  const walls = [
    // top
    Bodies.rectangle(width / 2, -wallThickness / 2, width + wallThickness * 2, wallThickness, { ...wallOpts, label: 'wall' }),
    // bottom
    Bodies.rectangle(width / 2, height + wallThickness / 2, width + wallThickness * 2, wallThickness, { ...wallOpts, label: 'wall-bottom' }),
    // left
    Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { ...wallOpts, label: 'wall' }),
    // right
    Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { ...wallOpts, label: 'wall' }),
  ]
  return walls
}

// Create a hoop target at (x, y) with a given gap width
export function createHoop(x, y, gapWidth, id) {
  const rimRadius = 6
  const halfGap = gapWidth / 2

  const leftRim = Bodies.circle(x - halfGap, y, rimRadius, {
    isStatic: true,
    label: 'hoop-rim',
    render: { fillStyle: '#ff6b35' },
  })

  const rightRim = Bodies.circle(x + halfGap, y, rimRadius, {
    isStatic: true,
    label: 'hoop-rim',
    render: { fillStyle: '#ff6b35' },
  })

  // Sensor sits just below the rim — only triggers on downward (top-to-bottom) passes
  const sensor = Bodies.rectangle(x, y + gapWidth * 0.45, gapWidth * 0.85, gapWidth * 0.55, {
    isStatic: true,
    isSensor: true,
    label: 'hoop-sensor',
    plugin: { hoopId: id },
    collisionFilter: { category: 0x0002, mask: 0x0001 },
  })

  return { leftRim, rightRim, sensor, id, x, y, gapWidth }
}

// Create a bubble body
export function createBubble(x, y, radius, figpalId) {
  const bubble = Bodies.circle(x, y, radius, {
    density: 0.0004,
    friction: 0.01,
    frictionAir: 0.022,   // moderate air drag → bubbles decelerate smoothly rather than coasting fast
    restitution: 0.75,    // good bounce off walls and rims
    label: 'bubble',
    plugin: { figpalId, scored: false },
    collisionFilter: { category: 0x0001, mask: 0x0003 },
  })
  return bubble
}

// Apply water current forces to bubbles.
// Physics model: each pump sits at the bottom-left or bottom-right of the world.
// Force direction is AWAY from the pump (air pushes bubble opposite the source).
// Force magnitude falls off with distance squared — closest bubbles feel it hardest.
export function applyWaterCurrent(bubbles, worldWidth, worldHeight, leftHeld, rightHeld) {
  // Pump nozzle positions match the visual button placement (15% / 85% from left, at the bottom)
  const LEFT_PUMP  = { x: worldWidth * 0.15, y: worldHeight }
  const RIGHT_PUMP = { x: worldWidth * 0.85, y: worldHeight }
  const MAX_FORCE    = 0.0024          // gentle but enough to clear the hoop
  const FALLOFF_SQ   = Math.pow(worldHeight * 0.35, 2) // vertical falloff
  // Tight horizontal falloff — each pump stays on its own side of the screen
  const H_FALLOFF_SQ = Math.pow(worldWidth * 0.25, 2)

  // Wall repulsion zone — pushes bubbles away from side walls so they don't get stuck
  const WALL_ZONE  = worldWidth * 0.12   // repulsion activates within 12% of each wall
  const WALL_FORCE = 0.00018             // gentle constant nudge toward center

  for (const bubble of bubbles) {
    if (leftHeld  > 0) applyPumpForce(bubble, LEFT_PUMP,  MAX_FORCE * leftHeld,  FALLOFF_SQ, H_FALLOFF_SQ)
    if (rightHeld > 0) applyPumpForce(bubble, RIGHT_PUMP, MAX_FORCE * rightHeld, FALLOFF_SQ, H_FALLOFF_SQ)

    // Gentle buoyancy — just barely overcomes gravity so bubbles hang in water-like suspension
    Body.applyForce(bubble, bubble.position, { x: 0, y: -0.000055 })

    // Wall repulsion — linearly stronger the closer the bubble is to a wall
    const bx = bubble.position.x
    if (bx < WALL_ZONE) {
      const t = 1 - bx / WALL_ZONE   // 0 at zone edge → 1 at wall
      Body.applyForce(bubble, bubble.position, { x: WALL_FORCE * t, y: 0 })
    } else if (bx > worldWidth - WALL_ZONE) {
      const t = 1 - (worldWidth - bx) / WALL_ZONE
      Body.applyForce(bubble, bubble.position, { x: -WALL_FORCE * t, y: 0 })
    }
  }
}

function applyPumpForce(bubble, pump, maxForce, falloffSq, hFalloffSq) {
  const dx = bubble.position.x - pump.x
  const dy = bubble.position.y - pump.y   // negative → bubble is above the pump
  const distSq = dx * dx + dy * dy
  const dist   = Math.sqrt(distSq) || 1

  // Vertical falloff: 1 at nozzle, 0.5 at falloff distance
  const falloff = falloffSq / (falloffSq + distSq)
  // Horizontal falloff: strongly attenuates force for bubbles on the opposite side
  const hFalloff = hFalloffSq / (hFalloffSq + dx * dx)
  const combined = falloff * hFalloff

  // Unit vector pointing AWAY from pump — that's the direction the air pushes the bubble
  const nx = dx / dist
  const ny = dy / dist   // will be negative (upward) for most bubbles

  // Always guarantee at least 40% of the force goes upward so bubbles can't be pushed into the floor
  const forceX = nx * maxForce * combined
  const forceY = Math.min(ny * maxForce * combined, -maxForce * combined * 0.4)

  Body.applyForce(bubble, bubble.position, { x: forceX, y: forceY })
}

// Set up collision detection for scoring
export function setupCollisionDetection(engine, onScore) {
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair
      let bubble = null
      let sensor = null

      if (bodyA.label === 'bubble' && bodyB.label === 'hoop-sensor') {
        bubble = bodyA
        sensor = bodyB
      } else if (bodyB.label === 'bubble' && bodyA.label === 'hoop-sensor') {
        bubble = bodyB
        sensor = bodyA
      }

      if (bubble && sensor && !bubble.plugin.scored) {
        // Only score when bubble is moving downward (top → bottom through the hoop)
        if (bubble.velocity.y > 0) {
          bubble.plugin.scored = true
          onScore(bubble, sensor.plugin.hoopId)
        }
      }
    }
  })
}

// Step the engine
export function stepEngine(engine, delta = 1000 / 60) {
  Engine.update(engine, delta)
}

// Clean up
export function destroyEngine(engine) {
  World.clear(engine.world, false)
  Engine.clear(engine)
}

export { Composite, Body, World }
