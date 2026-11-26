import { useNavigate } from 'react-router-dom';
import {
  Alert, Button, Col, Grid, Row, Skeleton, Table, Tabs, Typography, Progress,
} from 'antd';
import { ArrowRightOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { applyApi } from '../api/apply.api';
import { CONTRACT_TERM, ROOM_PRICES_2026 } from '../../../constants/statuses';
import { SUPPORT_CONTACT } from '../../../constants/app';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatter';
import StatusTag from '../../../components/StatusTag';
import PublicShell from '../components/PublicShell';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const PRICE_ROWS = [
  { key: 'hq3', tier: 'Chất lượng cao', note: 'Điều hòa, nóng lạnh, giường gỗ, đệm', cap: '3 người', prices: ROOM_PRICES_2026.high_quality[3] },
  { key: 'hq4', tier: 'Chất lượng cao', note: 'Điều hòa, nóng lạnh, đệm', cap: '4 người', prices: ROOM_PRICES_2026.high_quality[4] },
  { key: 'hq6', tier: 'Chất lượng cao', note: 'Điều hòa, nóng lạnh, đệm', cap: '6 người', prices: ROOM_PRICES_2026.high_quality[6] },
  { key: 'st4', tier: 'Tiêu chuẩn', note: 'Bình nóng lạnh, quạt trần, khép kín', cap: '4 người', prices: ROOM_PRICES_2026.standard[4] },
  { key: 'st6', tier: 'Tiêu chuẩn', note: 'Bình nóng lạnh, quạt trần, khép kín', cap: '6 người', prices: ROOM_PRICES_2026.standard[6] },
  { key: 'ba4', tier: 'Cơ bản', note: 'Quạt trần, tủ cá nhân, khép kín', cap: '4 người', prices: ROOM_PRICES_2026.basic[4] },
  { key: 'ba6', tier: 'Cơ bản', note: 'Quạt trần, tủ cá nhân, khép kín', cap: '6 người', prices: ROOM_PRICES_2026.basic[6] },
];

/**
 * Trang chủ KTX HaUI — Phân khối rõ ràng:
 *  - Khối Hero xanh nhạt (#F0F6FF) kèm thẻ số liệu trắng nổi bật
 *  - Vùng nội dung trên nền xám-xanh nhẹ (#F1F5F9) giúp các khối card trắng nổi rõ ràng
 */
export default function PublicHomePage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const { data: campusInfo, loading: campusLoading, error: campusError } = useApi(() => applyApi.getCampuses(), []);
  const { data: openPeriods, loading: periodsLoading } = useApi(() => applyApi.getOpenPeriods(), []);
  const { data: announcements, loading: annLoading } = useApi(() => applyApi.getAnnouncements({ limit: 8 }), []);

  const campuses = campusInfo?.campuses || [];
  const primaryCampus = campuses[0] || null;
  const buildings = primaryCampus?.buildings || [];
  const periods = Array.isArray(openPeriods) ? openPeriods : [];
  const news = Array.isArray(announcements) ? announcements : [];

  const totalRooms = campuses.reduce((s, c) => s + (c.stats?.totalRooms || 0), 0);
  const totalAvailable = campuses.reduce((s, c) => s + (c.stats?.availableSlots || 0), 0);
  const totalSlots = campuses.reduce((s, c) => s + (c.stats?.totalSlots || 0), 0);

  const priceColumns = [
    {
      title: 'Hạng phòng & Trang bị',
      key: 'tier',
      render: (_, r) => (
        <div>
          <Text strong>{r.tier}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{r.note}</Text>
        </div>
      ),
    },
    { title: 'Loại phòng', dataIndex: 'cap', key: 'cap', width: 120, align: 'center', render: (v) => <span className="haui-chip">{v}</span> },
    { title: 'Đơn giá Cơ sở 1 (VNĐ/SV/tháng)', key: 'cs1', width: 230, align: 'right', render: (_, r) => <Text strong className="mono" style={{ color: 'var(--brand-hover)' }}>{formatCurrency(r.prices.cs1)}</Text> },
    { title: 'Tiền cọc tài sản', key: 'dep', width: 150, align: 'right', render: () => <Text className="mono">{formatCurrency(500000)}</Text> },
  ];

  const tabItems = [
    {
      key: 'periods',
      label: isMobile ? `Đợt mở (${periods.length})` : `Đợt mở & Thông báo (${periods.length})`,
      children: (
        <Row gutter={[24, 24]} style={{ paddingTop: 6 }}>
          <Col xs={24} lg={15}>
            <div style={{ marginBottom: 14 }}>
              <Text strong style={{ fontSize: 15.5, color: 'var(--ink)' }}>Đợt đăng ký đang tiếp nhận</Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                Tự động phân loại Tân sinh viên / Năm 2+ theo 4 chữ số đầu MSSV và tự động duyệt xếp phòng ngay khi nộp đơn.
              </Text>
            </div>
            {periodsLoading && <Skeleton active paragraph={{ rows: 3 }} />}
            {!periodsLoading && periods.length === 0 && (
              <div style={{ padding: 24, background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 10 }}>
                <Text type="secondary">Hiện chưa có đợt đăng ký KTX nào đang mở tiếp nhận.</Text>
              </div>
            )}
            <Row gutter={[16, 16]}>
              {periods.map((p) => (
                <Col xs={24} md={12} key={p.id}>
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#FFFFFF',
                      border: '1px solid var(--line)',
                      borderTop: '3px solid var(--brand)',
                      borderRadius: 10,
                      padding: '18px 18px 16px',
                      boxShadow: 'var(--card-shadow)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <StatusTag type="campus" value={p.campus} />
                      <StatusTag type="cohort" value={p.targetCohort} />
                    </div>
                    <Text strong style={{ fontSize: 14.5, lineHeight: 1.45, color: 'var(--ink)', marginBottom: 10 }}>
                      {p.name}
                    </Text>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'grid', gap: 4, marginBottom: 14 }}>
                      <div>Thời gian: <span className="mono" style={{ fontWeight: 500, color: 'var(--ink)' }}>{formatDate(p.startDate)} → {formatDate(p.endDate)}</span></div>
                      <div>Gói thuê: {(p.allowedTerms || []).map((t) => CONTRACT_TERM[t]?.label || t).join(', ')}</div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                      <Button type="primary" block onClick={() => navigate(`/apply?periodId=${p.id}`)}>
                        Đăng ký đợt này <ArrowRightOutlined />
                      </Button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>

          <Col xs={24} lg={9}>
            <div style={{ marginBottom: 14 }}>
              <Text strong style={{ fontSize: 15.5, color: 'var(--ink)' }}>Thông báo từ Ban quản lý</Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                Tin mới nhất từ Trung tâm Hỗ trợ sinh viên.
              </Text>
            </div>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--line)',
              borderRadius: 10,
              padding: '4px 18px',
              boxShadow: 'var(--card-shadow)',
            }}>
              {annLoading && <div style={{ padding: '16px 0' }}><Skeleton active paragraph={{ rows: 4 }} /></div>}
              {!annLoading && news.length === 0 && (
                <div style={{ padding: '16px 0' }}><Text type="secondary">Chưa có thông báo công khai nào.</Text></div>
              )}
              {news.map((item, idx) => (
                <article
                  key={item.id}
                  style={{ padding: '14px 0', borderTop: idx > 0 ? '1px solid var(--line)' : 'none' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <StatusTag type="campus" value={item.campus} />
                    <Text type="secondary" className="mono" style={{ fontSize: 11 }}>{formatDateTime(item.createdAt)}</Text>
                  </div>
                  <Text strong style={{ display: 'block', fontSize: 13.5, lineHeight: 1.45, marginBottom: 4, color: 'var(--ink)' }}>
                    {item.title}
                  </Text>
                  <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ margin: 0, fontSize: 12.5 }}>
                    {item.content}
                  </Paragraph>
                </article>
              ))}
            </div>
          </Col>
        </Row>
      ),
    },
    {
      key: 'buildings',
      label: isMobile ? `${buildings.length || 2} Tòa nhà` : `Hệ thống ${buildings.length || 2} Tòa nhà`,
      children: (
        <div style={{ paddingTop: 6 }}>
          {campusLoading && <Skeleton active paragraph={{ rows: 3 }} />}
          {primaryCampus && (
            <div style={{
              marginBottom: 16,
              padding: '12px 16px',
              background: '#FFFFFF',
              border: '1px solid var(--line)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              boxShadow: 'var(--card-shadow)',
            }}>
              <div style={{ fontSize: 13.5 }}>
                <EnvironmentOutlined style={{ marginRight: 6, color: 'var(--brand)' }} />
                <Text strong>{primaryCampus.name}</Text>
                <Text type="secondary"> — {primaryCampus.address}</Text>
              </div>
              <span className="haui-chip mono">{buildings.length} tòa · {totalRooms} phòng</span>
            </div>
          )}
          <Row gutter={[16, 16]}>
            {buildings.map((b) => {
              const total = b.stats?.totalSlots || 0;
              const occ = b.stats?.occupiedSlots || 0;
              const avail = b.stats?.availableSlots ?? 0;
              const pct = total > 0 ? Math.round((occ / total) * 100) : 0;
              return (
                <Col xs={24} md={12} key={b.id}>
                  <div style={{
                    height: '100%',
                    background: '#FFFFFF',
                    border: '1px solid var(--line)',
                    borderTop: '3px solid var(--brand)',
                    borderRadius: 10,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--card-shadow)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 15.5, color: 'var(--ink)' }}>{b.name}</Text>
                      <span className="haui-chip mono">{b.code} · {b.totalFloors}T</span>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>
                      {b.description || 'Khu nhà nội trú sinh viên Cơ sở 1 — phòng khép kín, wifi miễn phí.'}
                    </Text>
                    <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <Text type="secondary">Chỗ còn trống</Text>
                        <Text strong className="mono" style={{ color: 'var(--success-text)' }}>{avail} / {total}</Text>
                      </div>
                      <Progress percent={pct} size="small" strokeColor="#2563EB" showInfo={false} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {b.stats?.totalRooms ?? 0} phòng vận hành · Lấp đầy {pct}%
                      </Text>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      ),
    },
    {
      key: 'prices',
      label: isMobile ? 'Bảng giá' : 'Bảng giá 2026–2027',
      children: (
        <div style={{ paddingTop: 6 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
            <Table
              rowKey="key"
              columns={priceColumns}
              dataSource={PRICE_ROWS}
              pagination={false}
              size="middle"
              scroll={{ x: 680 }}
            />
          </div>
          <Text type="secondary" style={{ display: 'block', marginTop: 10, fontSize: 12.5 }}>
            Đơn giá tính theo VNĐ/SV/tháng. Phòng tiêu chuẩn &gt;30m², khép kín, wifi miễn phí. Tiền điện nước tính riêng hàng tháng theo chỉ số công tơ thực tế của từng phòng.
          </Text>
        </div>
      ),
    },
  ];

  return (
    <PublicShell fullBleed>
      {/* Khối Hero xanh nhẹ hiện đại — tối ưu Mobile-first gọn gàng, chia khối rõ ràng */}
      <section style={{
        background: 'var(--surface-blue)',
        borderBottom: '1px solid #DBEAFE',
        padding: screens.md ? '36px 20px 32px' : '20px 14px 20px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[screens.md ? 32 : 16, 20]} align="middle">
            <Col xs={24} lg={15}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: 6,
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--brand-deep)',
                marginBottom: 12,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
                <span>Năm học {campusInfo?.academicYear || '2026–2027'} · Hỗ trợ sinh viên HaUI</span>
              </div>
              <Title level={1} style={{ margin: '0 0 10px', fontSize: screens.md ? 32 : 24, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25, color: 'var(--ink)' }}>
                Cổng Thông Tin &amp; Đăng Ký KTX Cơ Sở 1
              </Title>
              <Paragraph style={{ color: 'var(--text-secondary)', fontSize: screens.md ? 15 : 14, maxWidth: 620, marginBottom: 18, lineHeight: 1.6 }}>
                Tiếp nhận đăng ký nội trú tại 2 tòa nhà A14 &amp; A15 (Cầu Diễn, Hà Nội) — tự động duyệt &amp; xếp phòng ngay từ tầng thấp lên cao, thanh toán VietQR và nhận phòng bằng mã QR Check-in.
              </Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Button type="primary" size="large" block={isMobile} onClick={() => navigate('/apply')}>
                  Đăng ký ở KTX <ArrowRightOutlined />
                </Button>
                <Button size="large" block={isMobile} style={{ background: '#FFFFFF' }} onClick={() => navigate('/apply/status')}>
                  Tra cứu tiến độ đơn
                </Button>
              </div>
            </Col>

            <Col xs={24} lg={9}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #DCE7F7',
                borderRadius: 10,
                padding: '4px 18px',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.06)',
              }}>
                <FactRow label="Đợt đăng ký đang mở" value={`${periods.length} đợt`} accent />
                <FactRow label="Quy mô Cơ sở 1" value={`${totalRooms} phòng · ${buildings.length || 2} tòa`} />
                <FactRow label="Chỗ còn trống" value={`${totalAvailable} / ${totalSlots} chỗ`} success />
                <FactRow label="Hotline hỗ trợ" value={campusInfo?.hotline || SUPPORT_CONTACT.hotline} last />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Khối nội dung chính trên nền #F1F5F9 phân tách khối sắc nét */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: screens.md ? '22px 20px 48px' : '14px 14px 36px' }}>
        {campusError && <Alert type="error" showIcon title={`Không tải được dữ liệu máy chủ: ${campusError}`} style={{ marginBottom: 16 }} />}
        <Tabs defaultActiveKey="periods" items={tabItems} />
      </div>
    </PublicShell>
  );
}

function FactRow({ label, value, accent, success, last }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12,
      padding: '12px 0',
      borderBottom: last ? 'none' : '1px solid var(--line)',
    }}>
      <Text type="secondary" style={{ fontSize: 13 }}>{label}</Text>
      <Text
        strong
        className="mono"
        style={{
          fontSize: 14.5,
          color: accent ? 'var(--brand-hover)' : success ? 'var(--success-text)' : 'var(--ink)',
        }}
      >
        {value}
      </Text>
    </div>
  );
}
