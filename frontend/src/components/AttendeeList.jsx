import React, { useState } from 'react';
import { Users, RotateCcw, CheckCircle, Clock, Loader2 } from 'lucide-react';

export const AttendeeList = ({
  attendees,
  selectedAttendee,
  onSelectAttendee,
  onReset,
}) => {
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await onReset();
    } finally {
      setResetting(false);
    }
  };

  const checkedInCount = attendees.filter((a) => a.isCheckedIn).length;

  return (
    <div className="card">
      <div className="card-header space-between">
        <div className="header-title-group">
          <Users className="icon text-primary" size={20} />
          <h2>Danh sách ({checkedInCount}/{attendees.length} Đã Check-In)</h2>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleReset}
          disabled={resetting}
        >
          {resetting ? <Loader2 className="spinner" size={14} /> : <RotateCcw size={14} />}
          <span>Reset Demo</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Mã QR</th>
              <th>Họ và Tên</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((att) => {
              const isSelected = selectedAttendee?.qrCode === att.qrCode;
              return (
                <tr key={att.qrCode} className={isSelected ? 'selected-row' : ''}>
                  <td>
                    <code>{att.qrCode}</code>
                  </td>
                  <td>
                    <strong>{att.name}</strong>
                  </td>
                  <td>
                    {att.isCheckedIn ? (
                      <span className="status-pill status-complete">
                        <CheckCircle size={13} /> Complete
                      </span>
                    ) : (
                      <span className="status-pill status-pending">
                        <Clock size={13} /> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    {att.checkedInAt
                      ? new Date(att.checkedInAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td>
                    <button
                      className={`btn-select ${isSelected ? 'active' : ''}`}
                      onClick={() => onSelectAttendee(att)}
                    >
                      {isSelected ? 'Đang chọn' : 'Xem QR'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
