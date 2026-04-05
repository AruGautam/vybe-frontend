"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AppLayout from '@/components/AppLayout';
import NotificationCenter from '@/components/NotificationCenter';
import VybeCard, { VybeCardGrid, NeonTag, LiveDot, MotionButton } from '@/components/VybeCard';
import { Search, Zap, Calendar, Users, Thermometer, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import api from '../../api';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <AppLayout activeTab="dashboard">
      <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
        <div className="flex justify-between items-center mb-10">
          <div className="h-10 bg-white/5 rounded-xl w-72 md:w-96" />
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-white/5 rounded-xl" />
            <div className="h-10 w-32 bg-white/5 rounded-full" />
          </div>
        </div>
        <div className="h-12 bg-white/5 rounded-2xl w-80 mb-3" />
        <div className="h-4 bg-white/5 rounded-xl w-48 mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`bg-white/5 rounded-[28px] h-36 ${i === 0 ? 'md:col-span-2' : ''}`} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-[28px] h-44" />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ weather: '--°C', totalEvents: 0, totalRegistered: 0, connections: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!storedUser?.onboarding_completed) { router.push('/onboarding'); return; }
        const token = localStorage.getItem('token');
        if (!token) { router.push('/signup'); return; }
        setUser(storedUser);

        const [eventsRes, statsRes] = await Promise.all([
          api.get('/events').catch(() => ({ data: [] })),
          fetch(`${API}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        ]);

        setEvents(eventsRes.data || []);
        if (statsRes?.ok) setStats(await statsRes.json());
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) return <Skeleton />;

  const firstName = user?.displayName?.split(' ')[0] || 'Student';
  const initial = user?.displayName?.charAt(0)?.toUpperCase() || 'U';

  // Search — filter events by title/description/location
  const filteredEvents = searchQuery.trim()
    ? events.filter((e) =>
        [e.title, e.description, e.location].some((f) =>
          f?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : events;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.trim().length > 0);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
    if (e.key === 'Escape') {
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  // Metric cards data
  const metrics = [
    {
      label: 'Campus Temp',
      value: statsLoading ? '—' : stats.weather,
      icon: <Thermometer size={18} />,
      iconBg: 'bg-orange-500/10 text-orange-400',
      accent: 'text-orange-400',
      tag: { text: 'LIVE', color: 'lime' },
      span: 'md:col-span-2',
    },
    {
      label: 'Upcoming Events',
      value: statsLoading ? '—' : stats.totalEvents,
      icon: <Calendar size={18} />,
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      accent: 'text-indigo-400',
      tag: { text: 'EVENTS', color: 'indigo' },
      span: '',
      onClick: () => router.push('/events'),
    },
    {
      label: 'Students on Vybe',
      value: statsLoading ? '—' : stats.totalRegistered,
      icon: <Users size={18} />,
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      accent: 'text-cyan-400',
      tag: { text: 'COMMUNITY', color: 'cyan' },
      span: '',
    },
    {
      label: 'My Connections',
      value: statsLoading ? '—' : stats.connections,
      icon: <Sparkles size={18} />,
      iconBg: 'bg-lime-500/10 text-lime-400',
      accent: 'text-lime-400',
      tag: { text: 'NETWORK', color: 'lime' },
      span: '',
      onClick: () => router.push('/connections'),
    },
  ];

  // Event type colours
  const eventAccent = (type) => type === 'OFFICIAL'
    ? { tag: 'purple', dot: 'bg-purple-400' }
    : { tag: 'cyan',   dot: 'bg-cyan-400' };

  return (
    <AppLayout activeTab="dashboard">
      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-28 md:pb-8">

        {/* ── TOP HEADER ─────────────────────────────────────────────── */}
        <motion.div
          className="flex justify-between items-center mb-10 gap-4"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl flex items-center px-4 py-2.5 gap-2 focus-within:border-indigo-500/50 transition-colors backdrop-blur-xl">
              <Search size={16} className="text-gray-600 shrink-0" />
              <input
                type="text"
                placeholder="Search events, people..."
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleSearchSubmit}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                className="bg-transparent text-sm text-white outline-none w-full placeholder-gray-600"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  className="text-gray-600 hover:text-white transition-colors shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Inline search results dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#11151C]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50">
                {filteredEvents.length === 0 ? (
                  <div className="px-4 py-5 text-center">
                    <p className="text-gray-500 text-sm">No events match "<span className="text-white">{searchQuery}</span>"</p>
                    <button
                      onClick={() => router.push(`/meet-people`)}
                      className="mt-2 text-indigo-400 text-xs font-semibold hover:text-indigo-300 transition-colors"
                    >
                      Search people instead →
                    </button>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {filteredEvents.slice(0, 5).map((event, idx) => (
                      <button
                        key={idx}
                        onClick={() => { router.push('/events'); setShowSearchResults(false); setSearchQuery(''); }}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 border-b border-white/[0.04] last:border-0 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Calendar size={14} className="text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{event.title}</p>
                          <p className="text-xs text-gray-500 truncate">{event.location || 'VIT Campus'}</p>
                        </div>
                        <span className={`font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full ${event.type === 'OFFICIAL' ? 'bg-purple-500/15 text-purple-400' : 'bg-cyan-500/15 text-cyan-400'}`}>
                          {event.type === 'OFFICIAL' ? 'Official' : 'Meetup'}
                        </span>
                      </button>
                    ))}
                    {filteredEvents.length > 5 && (
                      <button
                        onClick={() => { router.push(`/events?search=${encodeURIComponent(searchQuery)}`); setShowSearchResults(false); }}
                        className="w-full px-4 py-3 text-indigo-400 text-xs font-semibold hover:bg-white/5 transition-colors text-center"
                      >
                        View all {filteredEvents.length} results →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <MotionButton
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-full backdrop-blur-xl hover:border-indigo-500/40 transition-colors"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                {initial}
              </div>
              <span className="text-sm text-white font-semibold pr-1 hidden sm:block">{user?.displayName?.split(' ')[0] || 'You'}</span>
            </MotionButton>
          </div>
        </motion.div>

        {/* ── WELCOME ────────────────────────────────────────────────── */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <LiveDot color="lime" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">Campus Pulse · Live</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
            Catch the Vybe,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
              {firstName}.
            </span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Here's what's happening at VIT Chennai today.</p>
        </motion.div>

        {/* ── BENTO METRICS GRID ─────────────────────────────────────── */}
        <VybeCardGrid className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => (
            <VybeCard
              key={m.label}
              span={m.span}
              glow={!!m.onClick}
              onClick={m.onClick}
              className="group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.iconBg}`}>
                  {m.icon}
                </div>
                <NeonTag color={m.tag.color}>{m.tag.text}</NeonTag>
              </div>
              <div className={`text-4xl font-black tracking-tighter mb-1 ${m.accent}`}>
                {m.value}
              </div>
              <p className="text-gray-500 text-sm font-medium">{m.label}</p>
              {m.onClick && (
                <div className="mt-3 flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors">
                  View <ArrowRight size={10} />
                </div>
              )}
            </VybeCard>
          ))}
        </VybeCardGrid>

        {/* ── EVENTS SECTION ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2.5">
              <TrendingUp size={16} className="text-indigo-400" />
              <h2 className="text-lg font-black tracking-tight text-white">Happening Soon</h2>
            </div>
            <MotionButton
              onClick={() => router.push('/events')}
              className="font-mono text-[11px] uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </MotionButton>
          </div>

          {events.length === 0 ? (
            <VybeCard className="text-center py-12">
              <Zap size={32} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-500 font-semibold">No upcoming events right now.</p>
              <p className="text-gray-700 text-sm mt-1">Be the first to create one.</p>
              <MotionButton
                onClick={() => router.push('/events')}
                className="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Create Event
              </MotionButton>
            </VybeCard>
          ) : (
            <VybeCardGrid className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.slice(0, 3).map((event, idx) => {
                const { tag, dot } = eventAccent(event.type);
                return (
                  <VybeCard
                    key={idx}
                    glow
                    onClick={() => router.push('/events')}
                    className="group flex flex-col"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <NeonTag color={tag}>{event.type === 'OFFICIAL' ? 'Official' : 'Meetup'}</NeonTag>
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
                          {event.startTime
                            ? new Date(event.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            : 'Soon'}
                        </span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-black tracking-tight text-base leading-snug mb-2 flex-1">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {event.description || 'Join us for this campus event!'}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
                        {event.location || 'VIT Campus'}
                      </span>
                      <ArrowRight size={14} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </VybeCard>
                );
              })}
            </VybeCardGrid>
          )}
        </motion.div>

        {/* ── QUICK ACTIONS ROW ──────────────────────────────────────── */}
        <motion.div
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          {[
            { label: 'Meet People', path: '/meet-people', color: 'from-indigo-600/20 to-violet-600/20 border-indigo-500/20 hover:border-indigo-500/40', icon: '✦' },
            { label: 'My Events',   path: '/events',      color: 'from-cyan-600/20 to-blue-600/20 border-cyan-500/20 hover:border-cyan-500/40',         icon: '📅' },
            { label: 'Exchange',    path: '/exchange',    color: 'from-green-600/20 to-teal-600/20 border-green-500/20 hover:border-green-500/40',       icon: '🛒' },
            { label: 'Messages',   path: '/messages',    color: 'from-purple-600/20 to-pink-600/20 border-purple-500/20 hover:border-purple-500/40',    icon: '💬' },
          ].map((a) => (
            <MotionButton
              key={a.label}
              onClick={() => router.push(a.path)}
              className={`bg-gradient-to-br ${a.color} border rounded-2xl p-4 text-left transition-all`}
            >
              <div className="text-xl mb-2">{a.icon}</div>
              <p className="text-white font-bold text-sm">{a.label}</p>
            </MotionButton>
          ))}
        </motion.div>

      </div>
    </AppLayout>
  );
}
