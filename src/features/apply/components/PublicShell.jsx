import { Button, Grid, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../../../components/BrandLogo';

const { Text } = Typography;
const { useBreakpoint } = Grid;

/** Khung chung của các trang công khai (nộp đơn, tra cứu) — không cần đăng nhập */
export default function PublicShell({ children }) {
  const navigate = useNavigate();
  const screens = useBreakpoint();

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <header style={{
        background: '#fff', borderBottom: '1px solid #F0F0F0', height: 64, padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link to="/apply" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit', minWidth: 0 }}>
          <BrandLogo size={36} />
          <div style={{ lineHeight: 1.25, minWidth: 0 }}>
            <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>KÝ TÚC XÁ HaUI</div>
            {screens.sm && <Text type="secondary" style={{ fontSize: 12 }}>Cổng đăng ký ở ký túc xá</Text>}
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/apply/status">Tra cứu đơn</Link>
          <Button type="primary" onClick={() => navigate('/login')}>Đăng nhập</Button>
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: screens.md ? 24 : 12 }}>
        {children}
      </main>
    </div>
  );
}
