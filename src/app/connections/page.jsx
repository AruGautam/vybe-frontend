"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, MessageCircle, Search } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

export default function ConnectionsPage() {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Gatekeeper: must be onboarded
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.onboarding_completed) {
      router.push('/onboarding');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchFriends = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        const data = await res.json();
        setFriends(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load connections:", err);
        setError("Could not load your connections. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [router]);

  // Client-side search filter
  const filtered = friends.filter(f =>
    f.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout activeTab="connections">
      <div className="p-4 md:p-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#8B949E] text-xs font-bold tracking-widest uppercase mb-2">Inner Circle</p>
          <h1 className="text-4xl font-extrabold text-white mb-3">My Connections</h1>
          <p className="text-[#8B949E] text-sm max-w-xl">
            People you've connected with on Vybe. Start a conversation or ping them anytime.
          </p>
        </div>

        {/* Search + Count */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-grow max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#11151C] text-white border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#5B75FF] transition-colors"
            />
          </div>
          {!isLoading && (
            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">
              {filtered.length} {filtered.length === 1 ? 'connection' : 'connections'}
            </span>
          )}
        </div>

        {/* States */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5B75FF]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-400">
            <p className="font-semibold">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-[#11151C] border border-gray-800 flex items-center justify-center mb-4">
              <Users size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-semibold mb-1">
              {searchTerm ? 'No results match your search.' : 'No connections yet.'}
            </p>
            <p className="text-gray-600 text-sm mb-5">
              {!searchTerm && 'Head to Meet People and send some connection requests!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/meet-people')}
                className="bg-[#b5c2ff] text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-white transition-all"
              >
                ✦ Meet People
              </button>
            )}
          </div>
        ) : (
          /* Connections Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((friend) => (
              <ConnectionCard key={friend.id} friend={friend} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ── CONNECTION CARD ──
function ConnectionCard({ friend }) {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);

  const openChat = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsOpening(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/room`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ peerId: friend.id })
      });

      if (res.ok) {
        const { roomId } = await res.json();
        router.push(`/messages?room=${roomId}`);
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
    } finally {
      setIsOpening(false);
    }
  };

  return (    <div className="bg-[#11151C] border border-gray-800/80 rounded-3xl p-5 flex items-center gap-4 hover:border-gray-600 transition-all shadow-xl group">
      
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#5B75FF] to-[#FF6B6B]">
          <div className="w-full h-full rounded-full bg-[#11151C] p-0.5">
            <img
              src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.display_name}`}
              alt={friend.display_name}
              className="w-full h-full rounded-full object-cover bg-[#0A0D14]"
              onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'; }}
            />
          </div>
        </div>
        {/* Connected badge */}
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-[#11151C]" title="Connected" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold text-base truncate">{friend.display_name}</h3>
        <p className="text-[#8B949E] text-xs uppercase tracking-wider font-semibold truncate">
          {friend.course} {friend.year_of_study ? `· Year ${friend.year_of_study}` : ''}
        </p>
      </div>

      {/* Message Button */}
      <button
        onClick={openChat}
        disabled={isOpening}
        className="flex-shrink-0 bg-[#5B75FF] text-white p-2.5 rounded-xl hover:bg-[#4a63ee] transition-all shadow-[0_0_12px_rgba(91,117,255,0.3)] group-hover:shadow-[0_0_20px_rgba(91,117,255,0.5)] disabled:opacity-50"
        title={`Message ${friend.display_name}`}
      >
        <MessageCircle size={18} />
      </button>
    </div>
  );
}
