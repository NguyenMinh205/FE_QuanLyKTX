/**
 * Logo chính thức Trường Đại học Công nghiệp Hà Nội (nguồn: ssc.haui.edu.vn/dnn/web/haui/assets/images/logo-ngang.svg).
 * @param height  chiều cao ảnh SVG (px)
 * @param onDark  true -> đặt trên nền thẻ trắng bo gọn để giữ nguyên bộ màu nhận diện chuẩn của logo trên nền tối
 */
export default function BrandLogo({ height = 34, onDark = false }) {
  const img = (
    <img
      src="/logo-haui-ngang.svg"
      alt="Đại học Công nghiệp Hà Nội — HaUI"
      style={{
        height,
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  );

  if (onDark) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#FFFFFF',
          padding: '7px 13px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.14)',
        }}
      >
        {img}
      </span>
    );
  }

  return img;
}
