import { getFigpalSrc } from '../data/figpals'
import '../styles/game.css'

// Rising air-bubble jet rendered over the canvas when a pump is held
function PumpJet({ side }) {
  const particles = [
    { delay: '0s',    x: 0  },
    { delay: '0.1s',  x: -6 },
    { delay: '0.2s',  x: 5  },
    { delay: '0.3s',  x: -3 },
    { delay: '0.4s',  x: 7  },
    { delay: '0.15s', x: 2  },
  ]
  return (
    <div className={`pump-jet pump-jet-${side}`}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="pump-jet-particle"
          style={{ animationDelay: p.delay, left: `calc(50% + ${p.x}px)` }}
        />
      ))}
    </div>
  )
}

function BasketballHoop({ hoop }) {
  const w = hoop.gapWidth + 20  // total width of the hoop visual
  return (
    <div
      className="hoop"
      style={{
        left: hoop.x - w / 2,
        top: hoop.y - 10,
        width: w,
      }}
    >
      {/* Rim */}
      <div className="hoop-rim-front" />
      {/* Net */}
      <svg
        className="hoop-net"
        viewBox="0 0 90 52"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Side borders of the net */}
        <line x1="5"  y1="1" x2="2"  y2="52" stroke="rgba(255,210,170,0.6)" strokeWidth="1.5"/>
        <line x1="85" y1="1" x2="88" y2="52" stroke="rgba(255,210,170,0.6)" strokeWidth="1.5"/>
        {/* Inner vertical strings — fan out slightly toward bottom */}
        <line x1="22" y1="1" x2="19" y2="52" stroke="rgba(255,210,170,0.45)" strokeWidth="1"/>
        <line x1="38" y1="1" x2="36" y2="52" stroke="rgba(255,210,170,0.45)" strokeWidth="1"/>
        <line x1="52" y1="1" x2="52" y2="52" stroke="rgba(255,210,170,0.45)" strokeWidth="1"/>
        <line x1="67" y1="1" x2="69" y2="52" stroke="rgba(255,210,170,0.45)" strokeWidth="1"/>
        <line x1="78" y1="1" x2="81" y2="52" stroke="rgba(255,210,170,0.45)" strokeWidth="1"/>
        {/* Horizontal mesh bands */}
        <line x1="4"  y1="17" x2="86" y2="17" stroke="rgba(255,210,170,0.4)" strokeWidth="1"/>
        <line x1="3"  y1="35" x2="87" y2="35" stroke="rgba(255,210,170,0.4)" strokeWidth="1"/>
        {/* Bottom edge */}
        <path d="M 2 52 Q 45 46 88 52" fill="none" stroke="rgba(255,210,170,0.6)" strokeWidth="1.5"/>
      </svg>
    </div>
  )
}

export default function GameCanvas({ bubbles, hoops, leftHeld, rightHeld }) {
  return (
    <div className="game-canvas-area">
      {/* Water background particles (decorative) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`particle-${i}`}
          className="water-particle"
          style={{
            left: `${10 + (i * 11) % 80}%`,
            top: `${10 + (i * 13) % 80}%`,
            opacity: 0.15 + (i % 3) * 0.08,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
          }}
        />
      ))}

      {/* Basketball hoops */}
      {hoops.map((hoop) => (
        <BasketballHoop key={hoop.id} hoop={hoop} />
      ))}

      {/* Bubbles with FigPal images */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`bubble${bubble.scored ? ' scored' : ''}`}
          style={{
            left: bubble.x - bubble.radius,
            top: bubble.y - bubble.radius,
            width: bubble.radius * 2,
            height: bubble.radius * 2,
          }}
        >
          <img
            src={getFigpalSrc(bubble.figpalId)}
            alt=""
            style={{
              width: '70%',
              height: '70%',
              objectFit: 'contain',
              borderRadius: '50%',
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML += '<span style="font-size:16px">🫧</span>'
            }}
          />
        </div>
      ))}

      {/* Pump jet effects */}
      {leftHeld  && <PumpJet side="left"  />}
      {rightHeld && <PumpJet side="right" />}
    </div>
  )
}
