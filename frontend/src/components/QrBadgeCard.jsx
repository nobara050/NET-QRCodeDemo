import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, CheckCircle, Clock, ExternalLink, Copy, Check, Smartphone } from 'lucide-react';
import { FRONTEND_BASE_URL } from '../config';

export const QrBadgeCard = ({
  attendees,
  selectedAttendee,
  onSelectAttendee,
}) => {
  const [copied, setCopied] = useState(false);

  if (!selectedAttendee) return null;

  // Lấy BASE URL từ config (Dev Tunnel Public URL) hoặc window.location.origin
  const baseOrigin = (FRONTEND_BASE_URL || window.location.origin).replace(/\/+$/, '');
  const checkInUrl = `${baseOrigin}/checkin?code=${selectedAttendee.qrCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkInUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="card-header space-between">
        <div className="header-title-group">
          <QrCode className="icon text-primary" size={20} />
          <h2>Mã QR của Khách (Smart QR Badge)</h2>
        </div>
      </div>

      <div className="qr-preview-box">
        <div className="qr-code-wrapper">
          <QRCodeSVG
            value={checkInUrl}
            size={160}
            level="H"
            includeMargin={true}
          />
          <div className="qr-code-text">
            <code>{selectedAttendee.qrCode}</code>
          </div>
        </div>

        <div className="user-summary">
          <h3>{selectedAttendee.name}</h3>
          <p className="text-muted">{selectedAttendee.email}</p>
          
          <div className="status-row">
            {selectedAttendee.isCheckedIn ? (
              <span className="status-pill status-complete">
                <CheckCircle size={14} /> Đã Check-In
              </span>
            ) : (
              <span className="status-pill status-pending">
                <Clock size={14} /> Chưa Check-In
              </span>
            )}
          </div>

          <div className="qr-url-box">
            <span className="qr-url-label">Link nhúng trong QR:</span>
            <div className="qr-url-content">
              <span className="qr-url-text" title={checkInUrl}>
                {checkInUrl}
              </span>
            </div>
            <div className="qr-url-actions">
              <button 
                className="btn btn-sm btn-secondary" 
                onClick={handleCopyLink}
                title="Sao chép liên kết"
              >
                {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                <span>{copied ? 'Đã chép' : 'Chép link'}</span>
              </button>
              
              <a 
                href={checkInUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-sm btn-secondary"
                title="Mở tab mới để test như khi quét bằng điện thoại"
              >
                <ExternalLink size={12} />
                <span>Test mở link</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
