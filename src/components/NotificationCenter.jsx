"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, MessageSquare, UserPlus, Zap, Calendar, CheckCheck } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ── Shared panel content (header + list) ─────────────────────────────────
function PanelContent({ notifications, unreadCount, markAllAsRead, markOneRead, closePanel, getIcon, formatType }) {
  return (
    <>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Activity</h2>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-blue-600 text-[10px] font-bold text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] font-bold text-blue-500 uppercase hover:text-blue-400 transition"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={closePanel}
            className="text-gray-500 hover:text-white transition ml-1 p-1"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto flex-1 p-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 opacity-30 text-white">
            <Bell size={36} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">All Caught Up</p>
          </div>
        ) : (
          notifications.map((n) => (
            <Link
              href={n.link || '#'}
              key={n.id}
              onClick={() => {
                markOneRead(n.id);
                closePanel();
              }}
              className={`flex gap-3 p-3 rounded-2xl mb-1.5 hover:bg-white/5 border transition-all ${
                n.isRead ? 'border-transparent' : 'bg-blue-500/5 border-blue-500/20'
              }`}
            >
              <div className="shrink-0 w-9 h-9 rounded-full bg-[#1C212B] border border-gray-700 flex items-center justify-center">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter mb-0.5">
                  {formatType(n.type)}
                </p>
                <p className="text-sm font-semibold text-white leading-tight truncate">{n.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-600 mt-1.5 font-mono uppercase tracking-widest">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!n.isRead && (
                <div className="shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
              )}
            </Link>
          ))
        )}
      </div>
    </>
  );
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotifications(await res.json());
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 60 seconds to catch new activity
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        closePanel();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Optimistically update local state so the red dot disappears immediately
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  // Close panel — also mark all read so dot clears on close
  const closePanel = () => {
    setIsOpen(false);
    if (unreadCount > 0) markAllAsRead();
  };

  const markOneRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'EVENT_INQUIRY':      return <Calendar  className="text-blue-400"   size={16} />;
      case 'INQUIRY_ACCEPTED':   return <CheckCheck className="text-green-400"  size={16} />;
      case 'CONNECTION_REQUEST': return <UserPlus   className="text-purple-400" size={16} />;
      case 'NEW_VIBE':           return <Zap        className="text-yellow-400" size={16} />;
      default:                   return <MessageSquare className="text-gray-400" size={16} />;
    }
  };

  const formatType = (type) => type.replace(/_/g, ' ');

  return (
    <div className="relative">
      {/* ── BELL BUTTON ─────────────────────────────────────────── */}
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPanelPos({
              top: rect.bottom + 10,
              right: window.innerWidth - rect.right,
            });
          }
          setIsOpen((v) => !v);
        }}
        className="relative p-2.5 bg-[#11151C] border border-gray-800 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-[#05060F]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── MOBILE BACKDROP ─────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[99] md:hidden"
          onClick={closePanel}
        />
      )}

      {/* ── PANEL ───────────────────────────────────────────────── */}
      {/* Mobile: slide-in from right edge (full height) */}
      <div
        className={`
          fixed top-0 right-0 bottom-0 w-80 z-[100] bg-[#11151C] border-l border-gray-800 shadow-2xl
          flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          md:hidden
        `}
        ref={panelRef}
      >
        <PanelContent
          notifications={notifications}
          unreadCount={unreadCount}
          markAllAsRead={markAllAsRead}
          markOneRead={markOneRead}
          closePanel={closePanel}
          getIcon={getIcon}
          formatType={formatType}
        />
      </div>

      {/* Desktop: fixed dropdown anchored to bell button position */}
      {isOpen && (
        <div
          ref={panelRef}
          className="hidden md:flex fixed flex-col z-[100] w-96 max-h-[520px] bg-[#11151C] border border-gray-800 rounded-[24px] shadow-2xl overflow-hidden"
          style={{ top: panelPos.top, right: panelPos.right }}
        >
          <PanelContent
            notifications={notifications}
            unreadCount={unreadCount}
            markAllAsRead={markAllAsRead}
            markOneRead={markOneRead}
            closePanel={closePanel}
            getIcon={getIcon}
            formatType={formatType}
          />
        </div>
      )}
    </div>
  );
}
