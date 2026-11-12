import { Component } from 'react';
import { Result, Button, Typography } from 'antd';

const { Paragraph, Text } = Typography;

/**
 * Bắt lỗi khi render để một component hỏng không làm trắng toàn bộ trang.
 * Hai lớp: quanh <App /> ở main.jsx (lớp cuối) và quanh <Outlet /> trong AdminLayout/PortalLayout, gắn key theo
 * đường dẫn — một màn hỏng thì menu vẫn còn, bấm sang màn khác là chạy lại.
 * ⚠️ Chỉ bọc ở main.jsx thì sau lần sập đầu, mọi màn đều hiện "Đã xảy ra lỗi" cho tới khi tải lại trang.
 *
 * React chưa có bản hook cho việc này nên bắt buộc phải dùng class component.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Ở dự án thật, đây là chỗ gửi lỗi về dịch vụ theo dõi.
    // v1 chỉ ghi ra console cho người phát triển đọc.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Result
        status="500"
        title="Đã xảy ra lỗi"
        subTitle="Giao diện gặp sự cố ngoài dự kiến. Vui lòng tải lại trang."
        extra={[
          <Button key="reload" type="primary" onClick={() => window.location.reload()}>Tải lại trang</Button>,
          <Button key="home" onClick={this.handleReload}>Về trang chủ</Button>,
        ]}
      >
        {import.meta.env.DEV && (
          <Paragraph>
            <Text type="danger" code style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error.message}
            </Text>
          </Paragraph>
        )}
      </Result>
    );
  }
}
