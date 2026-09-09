import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  QrCode, 
  User, 
  Mail, 
  Clock, 
  ArrowLeft, 
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export function CheckInPage() {
  const [searchParams] = useSearchParams();
  const rawCode = searchParams.get('code') || '';
  
  const [inputCode, setInputCode] = useState(rawCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Dùng Ref để ngăn React StrictMode chạy 2 lần gửi 2 request liên tiếp gây lỗi chuyển sang "AlreadyCheckedIn"
  const processedCodeRef = useRef('');

  const performCheckIn = useCallback(async (codeToProcess) => {
    let cleanCode = (codeToProcess || '').trim();
    if (!cleanCode) return;

    // Handle case where cleanCode is a full URL
    if (cleanCode.includes('code=')) {
      try {
        const url = new URL(cleanCode, window.location.origin);
        cleanCode = url.searchParams.get('code') || cleanCode;
      } catch {
        const match = cleanCode.match(/[?&]code=([^&]+)/);
        if (match) cleanCode = decodeURIComponent(match[1]);
      }
    }

    setLoading(true);
    setResult(null);

    try {
      /* 
       * =========================================================================
       * [TODO: AUTHORIZATION / ADMIN CHECK - PRODUCTION READY LOGIC]
       * =========================================================================
       * Vấn đề: Nếu QR chỉ là URL công khai, khách tham dự có thể tự quét mã của mình trước giờ sự kiện.
       * Giải pháp cần implement khi lên Production:
       * 
       * 1. Kiểm tra phiên đăng nhập của Ban Tổ Chức (BTC):
       *    const organizerToken = localStorage.getItem('organizer_auth_token');
       *    if (!organizerToken) {
       *      // Chuyển hướng sang trang Đăng nhập BTC hoặc yêu cầu nhập mã PIN bảo mật
       *      navigate('/login?redirect=' + encodeURIComponent(location.pathname + location.search));
       *      return;
       *    }
       * 
       * 2. Gửi kèm Bearer Token hoặc Staff Secret Key trong Headers:
       *    headers: {
       *      'Content-Type': 'application/json',
       *      'Authorization': `Bearer ${organizerToken}`
       *    }
       * =========================================================================
       */

      const response = await fetch(`${API_BASE_URL}/api/checkin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${organizerToken}` // TODO: Bật khi có hệ thống Auth
        },
        body: JSON.stringify({ qrCode: cleanCode }),
      });

      const data = await response.json();
      setResult({
        ...data,
        httpStatus: response.status,
        code: cleanCode
      });
    } catch (err) {
      setResult({
        success: false,
        status: 'Error',
        message: err.message || 'Không thể kết nối đến máy chủ Check-In.',
        code: cleanCode
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động check-in khi mở trang có param ?code= (Chỉ chạy 1 lần duy nhất cho mỗi mã)
  useEffect(() => {
    if (rawCode && processedCodeRef.current !== rawCode) {
      processedCodeRef.current = rawCode;
      performCheckIn(rawCode);
    }
  }, [rawCode, performCheckIn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      performCheckIn(inputCode);
    }
  };

  return (
    <div className="mobile-checkin-wrapper">
      <div className="mobile-checkin-card">
        {/* Header */}
        <div className="mobile-header">
          <Link to="/" className="btn-back">
            <ArrowLeft size={18} />
            <span>Dashboard</span>
          </Link>
          <div className="mobile-badge">
            <ShieldCheck size={14} className="text-primary" />
            <span>BTC Scanner</span>
          </div>
        </div>

        {/* Title */}
        <div className="mobile-title-section">
          <div className="icon-pulse-wrapper">
            <QrCode className="icon-glow" size={32} />
          </div>
          <h2>Cổng Check-In Khách Hàng</h2>
          <p className="text-muted">Quét mã QR hoặc nhập mã khách tham dự</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="status-banner loading-banner">
            <Loader2 className="spinner" size={36} />
            <div className="banner-text">
              <h3>Đang xử lý Check-In...</h3>
              <p>Mã: <code>{inputCode || rawCode}</code></p>
            </div>
          </div>
        )}

        {/* Result State */}
        {!loading && result && (
          <div className={`status-banner ${
            result.status === 'Complete' ? 'success-banner' :
            result.status === 'AlreadyCheckedIn' ? 'warning-banner' : 'error-banner'
          }`}>
            <div className="status-icon-box">
              {result.status === 'Complete' && <CheckCircle2 size={44} className="icon-success" />}
              {result.status === 'AlreadyCheckedIn' && <AlertCircle size={44} className="icon-warning" />}
              {(result.status === 'NotFound' || result.status === 'Error' || result.status === 'InvalidCode') && (
                <XCircle size={44} className="icon-error" />
              )}
            </div>

            <div className="banner-text">
              <h3>
                {result.status === 'Complete' && 'Check-In Thành Công!'}
                {result.status === 'AlreadyCheckedIn' && 'Khách Đã Check-In Trước Đó'}
                {result.status === 'NotFound' && 'Không Tìm Thấy Mã Khách'}
                {result.status === 'Error' && 'Lỗi Hệ Thống'}
              </h3>
              <p className="banner-desc">{result.message}</p>
            </div>

            {/* Attendee Details Card */}
            {result.attendee && (
              <div className="attendee-info-box">
                <div className="attendee-info-header">
                  <Sparkles size={16} className="text-primary" />
                  <span>Thông tin người tham dự</span>
                </div>
                <div className="info-row">
                  <User size={16} className="info-icon" />
                  <span className="info-label">Họ tên:</span>
                  <strong className="info-val">{result.attendee.name}</strong>
                </div>
                <div className="info-row">
                  <Mail size={16} className="info-icon" />
                  <span className="info-label">Email:</span>
                  <span className="info-val">{result.attendee.email}</span>
                </div>
                <div className="info-row">
                  <Clock size={16} className="info-icon" />
                  <span className="info-label">Thời gian:</span>
                  <span className="info-val">
                    {result.attendee.checkedInAt 
                      ? new Date(result.attendee.checkedInAt).toLocaleTimeString('vi-VN') 
                      : new Date().toLocaleTimeString('vi-VN')}
                  </span>
                </div>
                <div className="info-row">
                  <QrCode size={16} className="info-icon" />
                  <span className="info-label">Mã Code:</span>
                  <code className="info-code">{result.attendee.qrCode}</code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Form for manual entry or next scan */}
        <form onSubmit={handleSubmit} className="mobile-form">
          <label htmlFor="mobile-code-input">Nhập hoặc quét mã khác:</label>
          <div className="input-group">
            <input
              id="mobile-code-input"
              type="text"
              className="scanner-input"
              placeholder="VD: USR-001 hoặc dán URL..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !inputCode.trim()}
            >
              {loading ? <Loader2 className="spinner" size={16} /> : 'Check-In'}
            </button>
          </div>
        </form>

        {/* Action Controls */}
        <div className="mobile-actions">
          {rawCode && (
            <button 
              type="button"
              className="btn btn-secondary btn-full"
              onClick={() => performCheckIn(rawCode)}
              disabled={loading}
            >
              <RefreshCw size={16} />
              <span>Quét lại mã ({rawCode})</span>
            </button>
          )}

          <Link to="/" className="btn btn-primary btn-full btn-outline">
            <span>Về Bảng Điều Khiển Tổng</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
