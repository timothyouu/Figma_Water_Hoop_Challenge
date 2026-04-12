import { pickerFigpals, getFigpalSrc } from '../data/figpals'

export default function FigPalPicker({ selected, onSelect }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 10,
      padding: 4,
    }}>
      {pickerFigpals.map((fp) => (
        <button
          key={fp.id}
          onClick={() => onSelect(fp.id)}
          title={fp.name}
          style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: 10,
            border: selected === fp.id
              ? '2px solid #ffd700'
              : '2px solid rgba(255,255,255,0.1)',
            background: selected === fp.id
              ? 'rgba(255,215,0,0.15)'
              : 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <img
            src={getFigpalSrc(fp.id)}
            alt={fp.name}
            style={{
              width: '80%',
              height: '80%',
              objectFit: 'contain',
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.textContent = fp.name[0]
            }}
          />
        </button>
      ))}
    </div>
  )
}
