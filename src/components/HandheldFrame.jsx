import '../styles/handheld.css'

export default function HandheldFrame({ children }) {
  return (
    <div className="handheld-frame">
      <div className="handheld-top-bar">
        <div className="handheld-brand">FigPals</div>
        <div className="handheld-corner-screw" />
        <div className="handheld-corner-screw handheld-corner-screw--right" />
      </div>
      <div className="handheld-water-window">
        <div className="handheld-screen">
          {children}
        </div>
      </div>
      <div className="handheld-base" />
    </div>
  )
}
