/**
 * Logo tòa nhà dùng chung cho header quản trị và trang đăng nhập.
 * @param size    cạnh khung vuông (px)
 * @param variant 'solid' nền xanh chữ trắng · 'glass' nền trắng mờ trên nền xanh
 */
export default function BrandLogo({ size = 40, variant = 'solid' }) {
  const box = variant === 'glass'
    ? { background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)' }
    : { background: '#1677FF' };

  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22, display: 'grid', placeItems: 'center', flexShrink: 0, ...box,
    }}>
      <svg width={size * 0.5} height={size * 0.56} viewBox="0 0 20 22" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="17" height="19" rx="1.5" stroke="#fff" strokeWidth="2.2" />
        {[5.5, 9, 12.5].map((y) => [6.5, 10, 13.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="#fff" />))}
        <path d="M7.5 20.5v-4h5v4" stroke="#fff" strokeWidth="2.2" />
      </svg>
    </div>
  );
}
