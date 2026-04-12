import '../styles/game.css'

export default function PumpButton({ direction, onPressDown, onPressUp, isCoolingDown, isCharging }) {
  const down = (e) => { e.preventDefault(); onPressDown() }
  const up   = (e) => { e.preventDefault(); onPressUp()   }

  return (
    <button
      className={`pump-btn${isCoolingDown ? ' pump-cooldown' : ''}`}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="pump-btn-label">
        {direction === 'left' ? '← AIR' : 'AIR →'}
      </span>
      {isCharging   && <span key="charge"   className="pump-charge-fill"   />}
      {isCoolingDown && <span key="cooldown" className="pump-cooldown-sweep" />}
    </button>
  )
}
