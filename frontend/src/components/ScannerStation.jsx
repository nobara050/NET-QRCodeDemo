import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { ScanLine, Zap, CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react';

export const ScannerStation = ({ selectedAttendee, onCheckInSuccess }) => {
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  // Tự động focus ô input để nhận dữ liệu từ súng quét
  useEffect(() => {
    inputRef.current?.focus();
  }, [result]);

  // Trích xuất mã code sạch từ raw text hoặc URL
  const extractCode = (text) => {
    let clean = (text || '').trim();
    if (!clean) return '';
    if (clean.includes('code=')) {
      try {
        const url = new URL(clean, window.location.origin);
        return url.searchParams.get('code') || clean;
      } catch {
        const match = clean.match(/[?&]code=([^&]+)/);
        if (match) return decodeURIComponent(match[1]);
      }
    }
    return clean;
  };

  // Gọi API POST /api/checkin
  const executeCheckIn = async (codeToScan) => {
    const cleanCode = extractCode(codeToScan);
    if (!cleanCode || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: cleanCode }),
      });

      const data = await response.json();
      setResult(data);

      if (response.ok && (data.status === 'Complete' || data.status === 'AlreadyCheckedIn')) {
        onCheckInSuccess();
      }
    } catch (err) {
      setResult({
        success: false,
        status: 'Error',
        message: err.message || 'Lỗi kết nối Backend.',
      });
    } finally {
      setLoading(false);
      setInputCode('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Bắt phím Enter do súng quét gửi về sau khi quét mã
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCheckIn(inputCode);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <ScanLine className="icon text-primary" size={20} />
        <h2>Trạm quét (Scanner Station)</h2>
      </div>

      <div className="form-group">
        <label htmlFor="scanner-input">Ô nhận mã quét:</label>
        <div className="input-group">
          <input
            id="scanner-input"
            ref={inputRef}
            type="text"
            className="scanner-input"
            placeholder="Dùng súng quét mã hoặc gõ mã + Enter..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="off"
          />
          <button
            className="btn btn-primary"
            onClick={() => executeCheckIn(inputCode)}
            disabled={loading || !inputCode.trim()}
          >
            {loading ? <Loader2 className="spinner" size={16} /> : 'Enter'}
          </button>
        </div>
      </div>

      <div className="simulate-box">
        <button
          className="btn btn-simulate"
          onClick={() => selectedAttendee && executeCheckIn(selectedAttendee.qrCode)}
          disabled={loading || !selectedAttendee}
        >
          {loading ? <Loader2 className="spinner" size={16} /> : <Zap size={16} />}
          <span>Quét</span>
        </button>
      </div>

      <div className="result-container">
        {loading && (
          <div className="result-message loading">
            <Loader2 className="spinner" size={20} />
            <span>Đang kiểm tra với backend...</span>
          </div>
        )}

        {!loading && result && result.status === 'Complete' && (
          <div className="result-message success">
            <CheckCircle2 size={24} />
            <div>
              <strong>Complete:</strong> {result.message}
            </div>
          </div>
        )}

        {!loading && result && result.status === 'AlreadyCheckedIn' && (
          <div className="result-message warning">
            <AlertCircle size={24} />
            <div>
              <strong>Đã check-in:</strong> {result.message}
            </div>
          </div>
        )}

        {!loading && result && (result.status === 'NotFound' || result.status === 'Error' || result.status === 'InvalidCode') && (
          <div className="result-message error">
            <XCircle size={24} />
            <div>
              <strong>Lỗi:</strong> {result.message}
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="result-message idle">
            <span>Sẵn sàng quét mã QR bằng súng hoặc camera.</span>
          </div>
        )}
      </div>
    </div>
  );
};
