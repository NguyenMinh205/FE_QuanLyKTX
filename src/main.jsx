import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

import { AuthProvider } from './context/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App.jsx';
import './index.css';
import { antdTheme } from './theme/tokens';

dayjs.locale('vi');

/** Dấu * bắt buộc đặt SAU nhãn, đúng bản thiết kế — áp dụng cho mọi Form */
const requiredMarkAfter = (label, { required }) => (
  <>
    {label}
    {required && <span style={{ color: 'var(--danger-text)', marginInlineStart: 4 }}>*</span>}
  </>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ConfigProvider locale={viVN} theme={antdTheme} form={{ requiredMark: requiredMarkAfter }}>
        {/* <AntApp> bắt buộc để message/modal nhận được theme + locale (docs/14 mục 3.1.1) */}
        <AntApp>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  </StrictMode>,
);
