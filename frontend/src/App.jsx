import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { API_BASE_URL } from './config';
import { QrBadgeCard } from './components/QrBadgeCard';
import { ScannerStation } from './components/ScannerStation';
import { AttendeeList } from './components/AttendeeList';
import { CheckInPage } from './pages/CheckInPage';
import { QrCode, RefreshCw, Smartphone, LayoutDashboard } from 'lucide-react';

function Dashboard() {
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendees = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/checkin/attendees`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAttendees(data);

      setSelectedAttendee((prev) => {
        if (!prev) return data[0] || null;
        return data.find((a) => a.qrCode === prev.qrCode) || data[0] || null;
      });
    } catch (err) {
      setError(err.message || 'Không thể kết nối Backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const handleReset = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/checkin/reset`, { method: 'POST' });
      await fetchAttendees();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <header className="header space-between">
        <div className="brand">
          <QrCode className="text-primary" size={26} />
          <div>
            <h1>Hệ Thống QR Code Check-In Sự Kiện</h1>
            <p className="subtitle">Hỗ trợ quét qua Súng Barcode & Camera Điện Thoại</p>
          </div>
        </div>

      </header>

      {error && (
        <div className="error-bar">
          <span>Lỗi kết nối Backend ({API_BASE_URL}): {error}</span>
          <button className="btn btn-sm btn-secondary" onClick={fetchAttendees}>
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Đang tải danh sách...</div>
      ) : (
        <main className="content">
          <div className="grid">
            <QrBadgeCard
              attendees={attendees}
              selectedAttendee={selectedAttendee}
              onSelectAttendee={setSelectedAttendee}
            />

            <ScannerStation
              selectedAttendee={selectedAttendee}
              onCheckInSuccess={fetchAttendees}
            />
          </div>

          <AttendeeList
            attendees={attendees}
            selectedAttendee={selectedAttendee}
            onSelectAttendee={setSelectedAttendee}
            onReset={handleReset}
          />
        </main>
      )}
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/checkin" element={<CheckInPage />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
