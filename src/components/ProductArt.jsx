// Placeholder bottle art drawn from product.shape/color/cap.
// Replace with <img src={product.image}> once real product photos exist.
const COLORS = { lemon: 'var(--accent-lemon)', lime: 'var(--accent-lime)', cta: 'var(--cta)', sky: 'var(--sky)', brand: 'var(--brand)' };

export default function ProductArt({ product }) {
  if (product.image) return <img src={product.image} alt="" style={{ width: '70%', height: 'auto' }} />;
  const c = COLORS[product.color] || COLORS.cta;
  const k = COLORS[product.cap] || COLORS.brand;
  const lab = 'var(--surface-card)';
  if (product.shape === 'jug') return (
    <svg viewBox="0 0 100 140" aria-hidden="true"><rect x="40" y="8" width="20" height="14" rx="4" fill={k} /><path d="M60 28h14a8 8 0 0 1 8 8v20" stroke={c} strokeWidth="7" fill="none" /><rect x="16" y="22" width="62" height="112" rx="18" fill={c} /><rect x="25" y="62" width="44" height="44" rx="8" fill={lab} /><circle cx="47" cy="84" r="8" fill={k} /></svg>
  );
  if (product.shape === 'tub') return (
    <svg viewBox="0 0 100 140" aria-hidden="true"><rect x="14" y="36" width="72" height="16" rx="6" fill={k} /><rect x="18" y="48" width="64" height="84" rx="14" fill={c} /><rect x="28" y="70" width="44" height="40" rx="8" fill={lab} /><circle cx="50" cy="90" r="8" fill={k} /></svg>
  );
  if (product.shape === 'pump') return (
    <svg viewBox="0 0 100 140" aria-hidden="true"><rect x="44" y="10" width="30" height="8" rx="4" fill={k} /><rect x="46" y="14" width="8" height="18" fill={k} /><rect x="38" y="28" width="24" height="12" rx="4" fill={k} /><rect x="24" y="38" width="52" height="96" rx="18" fill={c} /><rect x="33" y="66" width="34" height="42" rx="7" fill={lab} /><circle cx="50" cy="87" r="7" fill={k} /></svg>
  );
  return (
    <svg viewBox="0 0 100 140" aria-hidden="true"><rect x="38" y="6" width="40" height="14" rx="4" fill={k} /><path d="M40 20h20v14H40z" fill={k} /><rect x="22" y="34" width="56" height="100" rx="16" fill={c} /><rect x="32" y="62" width="36" height="42" rx="6" fill={lab} /><circle cx="50" cy="83" r="8" fill={k} /></svg>
  );
}
