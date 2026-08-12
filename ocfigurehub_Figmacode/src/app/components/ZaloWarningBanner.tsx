import React, { useState, useEffect } from 'react';
import { ExternalLink, X, MoreVertical, Compass } from 'lucide-react';

export const isZaloBrowser = (): boolean => {
  if (typeof window === 'undefined' || !navigator) return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return /Zalo/i.test(ua) || /ZaloTheme/i.test(ua) || /ZaloIngame/i.test(ua);
};

export function ZaloWarningBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isZaloBrowser()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      className="w-full px-4 py-3 text-white text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg z-[9999] border-b"
      style={{
        backgroundColor: '#1e1b4b',
        borderColor: '#4338ca',
        color: '#e0e7ff',
      }}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 shrink-0">
          <Compass size={18} />
        </div>
        <div className="leading-snug">
          <p className="font-semibold text-white flex items-center gap-1">
            Bạn đang mở ứng dụng qua Zalo
          </p>
          <p className="text-[#a5b4fc] text-[11px] sm:text-xs">
            Để đăng nhập Google ổn định, vui lòng nhấn nút <MoreVertical size={13} className="inline mx-0.5 text-white" /> góc trên ➔ Chọn <strong>"Mở bằng trình duyệt"</strong> (Safari/Chrome).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            const currentUrl = window.location.href;
            if (navigator.clipboard) {
              navigator.clipboard.writeText(currentUrl);
            }
          }}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-xs"
        >
          <ExternalLink size={12} />
          Mở trình duyệt
        </button>
        <button
          onClick={() => setShow(false)}
          className="p-1 rounded-md hover:bg-indigo-800/50 text-indigo-300 hover:text-white transition-colors"
          title="Đóng thông báo"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
