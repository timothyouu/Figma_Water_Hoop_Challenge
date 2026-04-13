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
            type="button"
            aria-label="Left pump"
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
            type="button"
            aria-label="Right pump"
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
