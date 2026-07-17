// Лого-марка из макета: conic-градиент violet→mint→violet с тёмной сердцевиной.
export function LogoMark({ size = 26 }: { size?: number }) {
  const inset = Math.round(size * 0.23);
  return (
    <span
      className="relative inline-block shrink-0 rounded-lg"
      style={{
        width: size,
        height: size,
        background:
          'conic-gradient(from 210deg, hsl(var(--accent)), hsl(var(--mint)), hsl(var(--accent)))',
        boxShadow: '0 0 18px hsl(var(--glow))',
      }}
      aria-hidden
    >
      <span
        className="absolute rounded"
        style={{ inset, background: 'hsl(var(--ground))' }}
      />
    </span>
  );
}
