"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Users, MapPin, Clock, Plus, X, ChevronRight,
  Building2, Sparkles, TrendingUp, MessageCircle, Settings,
  ArrowLeft, Loader2, PartyPopper, AlertCircle, Lock, ShieldCheck,
  Send, CheckCircle
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const API = process.env.NEXT_PUBLIC_API_URL;

const CAMPUS_SPOTS = [
  'Food Court', 'Library', 'Gazebo', 'TT Court', 'Badminton Court',
  'Swimming Pool', 'SJT Rooftop', 'Anna Auditorium', 'Tech Tower Lobby',
  'Hostel Common Room', 'Cricket Ground', 'Basketball Court', 'Other'
];

// ── HELPERS ────────────────────────────────────────────────────────────────
function timeUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) return 'Passed';
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `in ${d}d ${h % 24}h`;
  if (h > 0) return `in ${h}h`;
  return 'Soon';
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function EventsPage() {
  const router = useRouter();
  const [tab, setTab] = useState('OFFICIAL'); // 'OFFICIAL' | 'CASUAL'
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [inquiryEvent, setInquiryEvent] = useState(null); // event to send inquiry about

  // ── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.onboarding_completed) { router.push('/onboarding'); return; }
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    setCurrentUser(user);
  }, [router]);

  // ── Fetch events by tab ─────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/events?type=${tab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Could not load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [tab, router]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return (
    <AppLayout activeTab="events">
      <div className="p-4 md:p-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[#8B949E] text-xs font-bold tracking-widest uppercase mb-2">Campus Life</p>
            <h1 className="text-4xl font-extrabold text-white mb-3">Events</h1>
            <p className="text-[#8B949E] text-sm max-w-xl">
              Big club fests and spontaneous student meetups — find your vybe.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#5B75FF] hover:bg-[#4a63ee] text-white font-bold px-5 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(91,117,255,0.3)] hover:shadow-[0_0_30px_rgba(91,117,255,0.5)] self-start shrink-0">
            <Plus size={18} /> Create Event
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
          <TabButton active={tab === 'OFFICIAL'} onClick={() => setTab('OFFICIAL')}
            icon={<Building2 size={16} />} label="🏢 Official Events"
            desc="Club fests, workshops, guest speakers" />
          <TabButton active={tab === 'CASUAL'} onClick={() => setTab('CASUAL')}
            icon={<PartyPopper size={16} />} label="🍕 Student Meetups"
            desc="Spontaneous hangouts, sports, study groups" />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={36} className="animate-spin text-[#5B75FF]" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-3 text-red-400">
            <AlertCircle size={20} /><p className="font-semibold">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <EmptyState tab={tab} onCreateClick={() => setShowCreate(true)} />
        ) : (
          <div className={`grid gap-5 ${tab === 'OFFICIAL' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {events.map(event => (
              tab === 'OFFICIAL'
                ? <OfficialCard key={event.id} event={event} currentUser={currentUser} onRefresh={fetchEvents} onSelect={setSelectedEvent} />
                : <CasualCard    key={event.id} event={event} currentUser={currentUser} onRefresh={fetchEvents} onSelect={setSelectedEvent} />
            ))}
          </div>
        )}
      </div>

      {/* ── CREATE EVENT MODAL ────────────────────────────────────────── */}
      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchEvents(); }}
          currentUser={currentUser}
        />
      )}

      {/* ── EVENT DETAIL DRAWER ───────────────────────────────────────── */}
      {selectedEvent && (
        <EventDetailDrawer
          event={selectedEvent}
          currentUser={currentUser}
          onClose={() => setSelectedEvent(null)}
          onRefresh={fetchEvents}
          onAskQuestion={(ev) => { setSelectedEvent(null); setInquiryEvent(ev); }}
        />
      )}

      {/* ── INQUIRY MODAL ─────────────────────────────────────────────── */}
      {inquiryEvent && (
        <InquiryModal
          event={inquiryEvent}
          onClose={() => setInquiryEvent(null)}
        />
      )}
    </AppLayout>
  );
}

// ── TAB BUTTON ─────────────────────────────────────────────────────────────
function TabButton({ active, onClick, label, desc }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-start px-5 py-3.5 rounded-2xl border transition-all text-left ${
        active
          ? 'bg-[#5B75FF]/10 border-[#5B75FF]/40 text-white shadow-[0_0_20px_rgba(91,117,255,0.15)]'
          : 'bg-[#11151C] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
      }`}>
      <span className="font-bold text-sm">{label}</span>
      <span className="text-xs text-gray-500 mt-0.5">{desc}</span>
    </button>
  );
}

// ── OFFICIAL EVENT CARD (large, banner-style) ──────────────────────────────
function OfficialCard({ event, currentUser, onRefresh, onSelect }) {
  const [joining, setJoining] = useState(false);
  const hasJoined = event.attendees?.some(a => a.userId === currentUser?.id);
  const attendeeCount = event.attendees?.length ?? 0;

  const gradients = [
    'from-[#4f86f7] to-[#6366f1]',
    'from-[#f7564f] to-[#f7944f]',
    'from-[#4ff7a3] to-[#4f86f7]',
    'from-[#b84ff7] to-[#4f86f7]',
  ];
  const grad = gradients[parseInt(event.id?.slice(-1), 16) % gradients.length] || gradients[0];

  const toggleJoin = async () => {
    const token = localStorage.getItem('token');
    setJoining(true);
    try {
      const method = hasJoined ? 'DELETE' : 'POST';
      const url = hasJoined
        ? `${API}/api/events/${event.id}/leave`
        : `${API}/api/events/${event.id}/join`;
      await fetch(url, { method, headers: { Authorization: `Bearer ${token}` } });
      onRefresh();
    } finally {
      setJoining(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(event)}
      className="bg-[#11151C] border border-gray-800/80 rounded-3xl overflow-hidden hover:border-gray-600 transition-all shadow-xl group cursor-pointer">
      {/* Banner */}
      <div className={`h-40 bg-gradient-to-br ${grad} relative flex items-end p-5`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            {event.organizingClub || 'Club Event'}
          </span>
          <h3 className="text-white text-xl font-extrabold mt-2 leading-tight line-clamp-2">{event.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {event.description && (
          <p className="text-[#8B949E] text-sm mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
        )}
        <div className="flex flex-col gap-2 mb-5 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-[#5B75FF]" />
            <span>{fmtDate(event.startTime)}</span>
            <span className="ml-auto text-[#4ade80] font-semibold">{timeUntil(event.startTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-[#5B75FF]" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={13} className="text-[#5B75FF]" />
            <span>{attendeeCount} attending</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#5B75FF] to-[#FF6B6B] flex items-center justify-center text-[10px] font-black">
              {event.creator?.displayName?.charAt(0) || 'C'}
            </div>
            <span className="text-xs text-gray-500">{event.creator?.displayName}</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); toggleJoin(); }}
            disabled={joining}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              hasJoined
                ? 'bg-white/5 border border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-red-400'
                : 'bg-[#5B75FF] text-white hover:bg-[#4a63ee] shadow-[0_0_12px_rgba(91,117,255,0.3)]'
            } disabled:opacity-50`}>
            {joining ? <Loader2 size={14} className="animate-spin" /> : hasJoined ? 'Leave' : 'RSVP →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CASUAL MEETUP CARD (compact, with capacity progress bar) ───────────────
function CasualCard({ event, currentUser, onRefresh, onSelect }) {
  const [joining, setJoining] = useState(false);
  const hasJoined = event.attendees?.some(a => a.userId === currentUser?.id);
  const attendeeCount = event.attendees?.length ?? 0;
  const cap = event.maxCapacity ?? null;        // null = unlimited
  const fillPct = cap ? Math.round((attendeeCount / cap) * 100) : 0;
  const isFull = cap !== null && attendeeCount >= cap;

  const toggleJoin = async () => {
    if (isFull && !hasJoined) return;
    const token = localStorage.getItem('token');
    setJoining(true);
    try {
      const method = hasJoined ? 'DELETE' : 'POST';
      const url = hasJoined
        ? `${API}/api/events/${event.id}/leave`
        : `${API}/api/events/${event.id}/join`;
      await fetch(url, { method, headers: { Authorization: `Bearer ${token}` } });
      onRefresh();
    } finally {
      setJoining(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(event)}
      className="bg-[#11151C] border border-gray-800/80 rounded-2xl p-5 hover:border-gray-600 transition-all shadow-xl flex flex-col gap-4 group cursor-pointer">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="text-white font-bold text-base leading-tight line-clamp-2">{event.title}</h3>
          <p className="text-gray-500 text-xs mt-0.5 uppercase tracking-wide font-semibold">
            by {event.creator?.displayName}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
          isFull ? 'bg-red-500/20 text-red-400' : 'bg-green-500/15 text-green-400'
        }`}>
          {isFull ? 'FULL' : cap !== null ? 'OPEN' : 'OPEN ∞'}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-[#5B75FF] flex-shrink-0" />
          <span>{fmtDate(event.startTime)}</span>
          <span className="ml-auto text-yellow-400 font-semibold">{timeUntil(event.startTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-[#5B75FF] flex-shrink-0" />
          <span>{event.location}</span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Slots filled</span>
          <span className="font-semibold text-gray-300">
            {cap !== null ? `${attendeeCount}/${cap} joined` : `${attendeeCount} joined · Unlimited`}
          </span>
        </div>
        {cap !== null && (
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fillPct >= 100 ? 'bg-red-500' : fillPct >= 70 ? 'bg-yellow-400' : 'bg-[#5B75FF]'
              }`}
              style={{ width: `${Math.min(fillPct, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Action */}
      <button onClick={e => { e.stopPropagation(); toggleJoin(); }} disabled={joining || (isFull && !hasJoined)}
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
          hasJoined
            ? 'bg-white/5 border border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-red-400'
            : isFull
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-[#5B75FF]/10 border border-[#5B75FF]/40 text-[#5B75FF] hover:bg-[#5B75FF] hover:text-white hover:shadow-[0_0_15px_rgba(91,117,255,0.4)]'
        } disabled:opacity-50`}>
        {joining
          ? <Loader2 size={14} className="animate-spin" />
          : hasJoined ? '✓ Leave Meetup' : isFull ? 'No Slots Left' : '+ Join Meetup'}
      </button>
    </div>
  );
}

// ── EMPTY STATE ────────────────────────────────────────────────────────────
function EmptyState({ tab, onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 rounded-full bg-[#11151C] border border-gray-800 flex items-center justify-center mb-4">
        {tab === 'OFFICIAL' ? <Building2 size={28} className="text-gray-600" /> : <PartyPopper size={28} className="text-gray-600" />}
      </div>
      <p className="text-gray-400 font-semibold mb-1">
        {tab === 'OFFICIAL' ? 'No official events yet.' : 'No meetups happening right now.'}
      </p>
      <p className="text-gray-600 text-sm mb-5">
        {tab === 'OFFICIAL' ? 'Club announcements will show up here.' : 'Be the first to kick one off!'}
      </p>
      {tab === 'CASUAL' && (
        <button onClick={onCreateClick}
          className="bg-[#b5c2ff] text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-white transition-all">
          ✦ Create a Meetup
        </button>
      )}
    </div>
  );
}

// ── EVENT DETAIL DRAWER ────────────────────────────────────────────────────
function EventDetailDrawer({ event, currentUser, onClose, onRefresh, onAskQuestion }) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const hasJoined = event.attendees?.some(a => a.userId === currentUser?.id);
  const attendeeCount = event.attendees?.length ?? 0;
  const cap = event.maxCapacity ?? null;
  const fillPct = cap ? Math.round((attendeeCount / cap) * 100) : 0;
  const isFull = cap !== null && attendeeCount >= cap;
  const isOwn = event.creator?.id === currentUser?.id;

  const toggleJoin = async () => {
    if (isFull && !hasJoined) return;
    const token = localStorage.getItem('token');
    setJoining(true);
    try {
      const method = hasJoined ? 'DELETE' : 'POST';
      const url = hasJoined
        ? `${API}/api/events/${event.id}/leave`
        : `${API}/api/events/${event.id}/join`;
      await fetch(url, { method, headers: { Authorization: `Bearer ${token}` } });
      onRefresh();
    } finally {
      setJoining(false);
    }
  };

  const gradients = [
    'from-[#4f86f7] to-[#6366f1]',
    'from-[#f7564f] to-[#f7944f]',
    'from-[#4ff7a3] to-[#4f86f7]',
    'from-[#b84ff7] to-[#4f86f7]',
  ];
  const grad = gradients[parseInt(event.id?.slice(-1), 16) % gradients.length] || gradients[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[#0D0F1A] border border-gray-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl max-h-[85vh] flex flex-col overflow-hidden pb-16 sm:pb-0"
      >
        {/* Colour banner */}
        <div className={`h-32 bg-gradient-to-br ${grad} relative flex-shrink-0`}>
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
          {event.type === 'OFFICIAL' && (
            <span className="absolute bottom-4 left-5 text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
              {event.organizingClub || 'Club Event'}
            </span>
          )}
          {event.type === 'CASUAL' && (
            <span className="absolute bottom-4 left-5 text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
              🍕 Student Meetup
            </span>
          )}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">
          {/* Title */}
          <div>
            <h2 className="text-white text-2xl font-extrabold leading-tight">{event.title}</h2>
            {event.description && (
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">{event.description}</p>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#11151C] rounded-2xl p-4 border border-gray-800/60">
              <div className="flex items-center gap-2 text-[#5B75FF] mb-1">
                <Clock size={13} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Date & Time</span>
              </div>
              <p className="text-white text-sm font-semibold">{fmtDate(event.startTime)}</p>
              <p className="text-yellow-400 text-xs font-bold mt-0.5">{timeUntil(event.startTime)}</p>
            </div>
            <div className="bg-[#11151C] rounded-2xl p-4 border border-gray-800/60">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={13} className="text-[#5B75FF]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Location</span>
              </div>
              <p className="text-white text-sm font-semibold">{event.location}</p>
            </div>
          </div>

          {/* Capacity */}
          {cap !== null && (
            <div className="bg-[#11151C] rounded-2xl p-4 border border-gray-800/60">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span className="font-bold uppercase tracking-widest">Capacity</span>
                <span className="font-semibold text-gray-300">{attendeeCount} / {cap} joined</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${fillPct >= 100 ? 'bg-red-500' : fillPct >= 70 ? 'bg-yellow-400' : 'bg-[#5B75FF]'}`}
                  style={{ width: `${Math.min(fillPct, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Organiser / Posted by */}
          <div className="bg-[#11151C] rounded-2xl p-4 border border-gray-800/60">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Posted by</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B75FF] to-[#FF6B6B] flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                  {event.creator?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{event.creator?.displayName || 'Unknown'}</p>
                  <p className="text-gray-500 text-xs">
                    {event.creator?.course ? `${event.creator.course}` : 'VIT Student'}
                    {event.creator?.yearOfStudy ? ` · Year ${event.creator.yearOfStudy}` : ''}
                  </p>
                </div>
              </div>
              {/* Ask a question button — hidden if it's the current user's own event */}
              {!isOwn && (
                <button
                  onClick={() => onAskQuestion(event)}
                  className="flex items-center gap-2 bg-[#5B75FF]/10 border border-[#5B75FF]/30 text-[#5B75FF] hover:bg-[#5B75FF] hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                >
                  <MessageCircle size={14} /> Ask Question
                </button>
              )}
            </div>
          </div>

          {/* Attendees list */}
          {attendeeCount > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                Who's going · {attendeeCount} {cap ? `/ ${cap}` : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {event.attendees.slice(0, 12).map(a => (
                  <div key={a.userId} title={a.user?.displayName}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-[11px] font-black text-white border-2 border-[#0D0F1A]">
                    {a.user?.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                ))}
                {attendeeCount > 12 && (
                  <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400 border-2 border-[#0D0F1A]">
                    +{attendeeCount - 12}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky action footer */}
        {!isOwn && (
          <div className="p-4 border-t border-gray-800/60 flex-shrink-0 flex gap-3">
            <button
              onClick={() => onAskQuestion(event)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#11151C] border border-gray-700 hover:border-[#5B75FF] text-gray-300 hover:text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              <MessageCircle size={15} /> Ask Host a Question
            </button>
            <button
              onClick={toggleJoin}
              disabled={joining || (isFull && !hasJoined)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                hasJoined
                  ? 'bg-white/5 border border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-red-400'
                  : isFull
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-[#5B75FF] text-white hover:bg-[#4a63ee] shadow-[0_0_15px_rgba(91,117,255,0.3)]'
              } disabled:opacity-50`}
            >
              {joining
                ? <Loader2 size={14} className="animate-spin" />
                : hasJoined
                  ? '✓ Leave'
                  : isFull
                    ? 'No Slots Left'
                    : event.type === 'OFFICIAL' ? 'RSVP →' : '+ Join'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CREATE EVENT MODAL ─────────────────────────────────────────────────────
function CreateEventModal({ onClose, onSuccess, currentUser }) {
  // Read role from localStorage on mount so it's always fresh,
  // falling back to the prop value passed from the parent.
  const [isClubAdmin, setIsClubAdmin] = useState(
    () => currentUser?.role === 'CLUB_ADMIN'
  );

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setIsClubAdmin(storedUser.role === 'CLUB_ADMIN');
  }, []);

  const [form, setForm] = useState({
    type: 'CASUAL',
    title: '',
    description: '',
    date: '',
    location: '',
    maxCapacity: '',
    organizingClub: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Max date for casual = now + 7 days
  const maxDateStr = (() => {
    const d = new Date(Date.now() + 7 * 86_400_000);
    return d.toISOString().slice(0, 16);
  })();
  const minDateStr = new Date(Date.now() + 60_000).toISOString().slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Validate capacity if provided
    if (form.maxCapacity !== '' && parseInt(form.maxCapacity, 10) < 2) {
      setApiError('Capacity must be at least 2, or leave it blank for unlimited.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/events/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          maxCapacity: form.maxCapacity !== '' ? parseInt(form.maxCapacity, 10) : null
        })
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || 'Something went wrong.'); return; }
      onSuccess();
    } catch (e) {
      setApiError('Network error. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 pb-24 sm:pb-4">
      <div className="bg-[#0D0F1A] border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-white font-extrabold text-xl">Create an Event</h2>
            <p className="text-gray-500 text-xs mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">

          {/* Type Toggle */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2 block">Event Type</label>
            <div className="grid grid-cols-2 gap-2">
              {/* Student Meetup — always unlocked */}
              <button type="button"
                onClick={() => set('type', 'CASUAL')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  form.type === 'CASUAL'
                    ? 'border-[#5B75FF] bg-[#5B75FF]/10 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}>
                <span className="font-bold text-sm">🍕 Student Meetup</span>
                <span className="text-[11px] text-gray-500">Spontaneous, ≤7 days</span>
              </button>

              {/* Official Event — locked unless CLUB_ADMIN */}
              <div className="relative group/lock">
                <button type="button"
                  onClick={() => isClubAdmin && set('type', 'OFFICIAL')}
                  disabled={!isClubAdmin}
                  className={`w-full flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    form.type === 'OFFICIAL'
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : isClubAdmin
                        ? 'border-gray-700 text-gray-400 hover:border-gray-500'
                        : 'border-gray-800/50 text-gray-600 opacity-50 cursor-not-allowed'
                  }`}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm">🏢 Official Event</span>
                    {!isClubAdmin && <Lock size={12} className="text-red-400 flex-shrink-0" />}
                    {isClubAdmin && <ShieldCheck size={12} className="text-purple-400 flex-shrink-0" />}
                  </div>
                  <span className="text-[11px] mt-0.5">
                    {isClubAdmin
                      ? <span className="text-purple-400 font-semibold">Club Admin ✓</span>
                      : <span className="text-red-400/70">Club admin only</span>}
                  </span>
                </button>

                {/* Tooltip shown on hover when locked */}
                {!isClubAdmin && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#1C212B] border border-gray-700 text-gray-300 text-[11px] px-3 py-2 rounded-xl shadow-xl opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                    <Lock size={12} className="inline text-red-400 mr-1 mb-0.5" />
                    Requires a verified <span className="text-white font-bold">Club Admin</span> account.
                    Contact the Vybe team to get promoted.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
                  </div>
                )}
              </div>
            </div>
            {!isClubAdmin && (
              <p className="text-[11px] text-gray-600 mt-1.5">
                Official events require a verified Club Admin account.
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2 block">
              Title <span className="text-gray-600 normal-case">({form.title.length}/50)</span>
            </label>
            <input value={form.title} onChange={e => set('title', e.target.value)} maxLength={50} required
              placeholder={form.type === 'CASUAL' ? 'e.g. Badminton at 6 PM' : 'e.g. CodeFest 2026 — Open Registrations'}
              className="w-full bg-[#11151C] text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5B75FF] transition-colors placeholder-gray-600" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2 block">Description (optional)</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              placeholder="What's the vibe? Any context?"
              className="w-full bg-[#11151C] text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5B75FF] transition-colors resize-none placeholder-gray-600" />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2 block">Date & Time</label>
            <input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)}
              min={minDateStr} max={form.type === 'CASUAL' ? maxDateStr : undefined} required
              className="w-full bg-[#11151C] text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5B75FF] transition-colors [color-scheme:dark]" />
            {form.type === 'CASUAL' && (
              <p className="text-[11px] text-gray-600 mt-1">Meetups must happen within the next 7 days.</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2 block">Location</label>
            {form.type === 'CASUAL' ? (
              <select value={form.location} onChange={e => set('location', e.target.value)} required
                className="w-full bg-[#11151C] text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5B75FF] transition-colors">
                <option value="">Pick a campus spot…</option>
                {CAMPUS_SPOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input value={form.location} onChange={e => set('location', e.target.value)} required
                placeholder="e.g. Anna Auditorium, Main Stage"
                className="w-full bg-[#11151C] text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5B75FF] transition-colors placeholder-gray-600" />
            )}
          </div>

          {/* Capacity (optional for all event types) */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2 block">
              Capacity <span className="text-gray-600 normal-case font-normal">(optional — leave blank for unlimited)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={2}
                value={form.maxCapacity}
                onChange={e => set('maxCapacity', e.target.value)}
                placeholder="Unlimited"
                className="w-full bg-[#11151C] text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5B75FF] transition-colors placeholder-gray-600"
              />
            </div>
            {form.maxCapacity !== '' && parseInt(form.maxCapacity, 10) < 2 && (
              <p className="text-xs text-red-400 mt-1.5">Minimum capacity is 2.</p>
            )}
          </div>

          {/* Organizing Club (Official only) */}
          {form.type === 'OFFICIAL' && (
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2 block">Organizing Club / Society</label>
              <input value={form.organizingClub} onChange={e => set('organizingClub', e.target.value)}
                placeholder="e.g. IEEE VIT, GDSC, Excalibur"
                className="w-full bg-[#11151C] text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5B75FF] transition-colors placeholder-gray-600" />
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={15} className="flex-shrink-0" />
              {apiError}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="w-full bg-[#5B75FF] hover:bg-[#4a63ee] text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(91,117,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : '✦ Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── INQUIRY MODAL ──────────────────────────────────────────────────────────
// Lets any student send a question to the event host without being connected.
function InquiryModal({ event, onClose }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const MAX = 500;

  const handleSend = async () => {
    if (!message.trim()) return;
    setError('');
    setSubmitting(true);
    const token = localStorage.getItem('token');
    // Use creator.id if available, fall back to top-level creatorId field
    const hostId = event.creator?.id || event.creatorId;
    const eventId = event.id;
    console.log('[InquiryModal] sending →', { eventId, hostId, message: message.trim() });
    if (!hostId || !eventId) {
      setError('Could not identify the event host. Please try again.');
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ eventId, hostId, message: message.trim() })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to send.'); return; }
      setSent(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[#0D0F1A] border border-gray-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl max-h-[80vh] flex flex-col overflow-hidden pb-16 sm:pb-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#5B75FF]/15 flex items-center justify-center">
              <MessageCircle size={17} className="text-[#5B75FF]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Ask the Host</p>
              <p className="text-gray-500 text-xs truncate max-w-[200px]">{event.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {sent ? (
            /* ── Success State ── */
            <div className="flex flex-col items-center py-6 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Inquiry Sent!</p>
                <p className="text-gray-400 text-sm mt-1">
                  <span className="text-white font-semibold">{event.creator?.displayName}</span> will see your question
                  in their messages inbox. If they accept, a chat will open automatically.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 bg-[#5B75FF] hover:bg-[#4a63ee] text-white font-bold px-8 py-2.5 rounded-xl transition-all text-sm"
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Compose State ── */
            <>
              {/* Host info */}
              <div className="flex items-center gap-3 mb-5 bg-[#11151C] rounded-2xl p-3 border border-gray-800/60">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5B75FF] to-[#FF6B6B] flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                  {event.creator?.displayName?.charAt(0)?.toUpperCase() || 'H'}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{event.creator?.displayName}</p>
                  <p className="text-gray-500 text-xs">
                    {event.creator?.course
                      ? `${event.creator.course}${event.creator.yearOfStudy ? ` · Year ${event.creator.yearOfStudy}` : ''}`
                      : 'Event Host'}
                  </p>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative mb-2">
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, MAX))}
                  rows={4}
                  placeholder="e.g. Is there any registration fee? What should I bring?"
                  className="w-full bg-[#11151C] text-white border border-gray-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#5B75FF] transition-colors resize-none placeholder-gray-600"
                  autoFocus
                />
                <span className={`absolute bottom-3 right-3 text-[10px] font-semibold ${message.length >= MAX ? 'text-red-400' : 'text-gray-600'}`}>
                  {message.length}/{MAX}
                </span>
              </div>

              {/* Hint */}
              <p className="text-[11px] text-gray-600 mb-4">
                💡 The host will get a notification. If they accept, a chat thread opens in your Messages.
              </p>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4">
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-sm font-bold border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || submitting}
                  className="flex-1 bg-[#5B75FF] hover:bg-[#4a63ee] text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(91,117,255,0.3)] disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
                >
                  {submitting
                    ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                    : <><Send size={14} /> Send Inquiry</>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
