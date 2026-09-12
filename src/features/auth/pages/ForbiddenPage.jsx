import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../constants/roles';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const home = user?.role === ROLES.STUDENT ? '/portal/home' : '/admin/dashboard';

  return (
    <Result
      status="403"
      title="403"
      subTitle="Bạn không có quyền truy cập trang này."
      extra={<Button type="primary" onClick={() => navigate(home, { replace: true })}>Về trang chủ</Button>}
    />
  );
}
