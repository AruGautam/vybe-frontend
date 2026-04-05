"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function MeetPeoplePage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const router = useRouter();

  // Load users with filters applied
  const loadUsers = async (search = '', course = '', year = '') => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construct URL with query parameters
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/users?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (course) url += `course=${encodeURIComponent(course)}&`;
      if (year) url += `year=${encodeURIComponent(year)}&`;

      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      
      if (!res.ok) {
        throw new Error(`Failed to load users. Status: ${res.status}`);
      }
      
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setIsLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to connect. Please try again later.");
      setIsLoading(false);
    }
  };

  // Initial load and auth check
  useEffect(() => {
    let isMounted = true;
    
    // THE GATEKEEPER: Check if user has completed onboarding
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user?.onboarding_completed) {
      console.warn("Onboarding not completed. Redirecting to onboarding page.");
      router.push('/onboarding');
      return;
    }
    
    // Production Security: Check if user is authenticated
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn("Unauthorized access - no token found. Redirecting to login.");
      router.push('/login');
      return;
    }

    if (isMounted) {
      loadUsers();
    }

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Debounced search and filter effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers(searchTerm, selectedCourse, selectedYear);
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCourse, selectedYear]);

  // Heartbeat setup and cleanup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // HEARTBEAT: Keep user marked as "Online"
    const sendHeartbeat = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/heartbeat`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({})
        });
        
        if (!response.ok) {
          console.error("Heartbeat failed with status:", response.status);
        } else {
          console.log("✓ Heartbeat sent successfully");
        }
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    };

    // Send heartbeat immediately on component mount
    sendHeartbeat();

    // Then send every 60 seconds
    const heartbeatInterval = setInterval(sendHeartbeat, 60000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, []);

  return (
    <AppLayout activeTab="meet-people">
      <div className="p-8 md:p-10">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[#8B949E] text-xs font-bold tracking-widest uppercase mb-2">Community Hub</p>
          <h1 className="text-4xl font-extrabold text-white mb-3">Meet People</h1>
          <p className="text-[#8B949E] text-sm max-w-xl">
            Discover peers across departments. Connect for projects, research, or just a coffee at the Gazebo.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-[#11151C] border border-gray-800/60 p-4 rounded-2xl flex flex-col md:flex-row gap-4 mb-10 shadow-lg">
        <div className="relative flex-grow">
          <input 
            type="text"
            placeholder="Search by name, interest, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A0D14] text-white border border-gray-800 rounded-xl pl-4 pr-4 py-3 focus:outline-none focus:border-[#5B75FF] transition-colors"
          />
        </div>
        <select 
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full md:w-auto bg-[#0A0D14] text-white border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#5B75FF] transition-colors"
        >
          <option value="">All Courses</option>
          <option value="BBA">BBA</option>
          <option value="MBA">MBA</option>
          <option value="BCOM">BCOM</option>
          <option value="MTECH">MTECH</option>
          <option value="BTECH">BTECH</option>
        </select>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full md:w-auto bg-[#0A0D14] text-white border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#5B75FF] transition-colors"
        >
          <option value="">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>
      </div>

      {/* CONDITIONAL RENDERING FOR PRODUCTION STATES */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5B75FF]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center text-red-400">
          <p className="font-semibold">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p>No peers found matching your criteria.</p>
        </div>
      ) : (
        /* USER GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onAccepted={(userId) => {
              setUsers(prev => prev.map(u => u.id === userId ? { ...u, connection_status: 'ACCEPTED' } : u));
            }} />
          ))}
        </div>
      )}
      </div>
    </AppLayout>
  );
}

// --- CARD COMPONENT ---
function UserCard({ user, onAccepted }) {
  const router = useRouter();
  // Map backend directional status → local UI state
  const getInitialStatus = () => {
    if (user.connection_status === 'SENT_PENDING') return 'SENT_PENDING';
    if (user.connection_status === 'RECEIVED_PENDING') return 'RECEIVED_PENDING';
    if (user.connection_status === 'ACCEPTED') return 'ACCEPTED';
    return 'NONE';
  };

  const [requestStatus, setRequestStatus] = useState(getInitialStatus());
  const [isAccepting, setIsAccepting] = useState(false);
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const interests = user.interests || [];

  // Send a new connection request
  const handleConnect = async (targetId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setRequestStatus('LOADING');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections/request`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ receiverId: targetId })
      });

      if (res.ok) {
        setRequestStatus('SENT_PENDING');
      } else {
        const error = await res.json();
        console.error("Connection error:", error);
        setRequestStatus('NONE');
      }
    } catch (err) {
      console.error("Connection request failed:", err);
      setRequestStatus('NONE');
    }
  };

  // Accept an incoming connection request
  const handleAccept = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user.connection_id) return;

    setIsAccepting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections/accept`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ connectionId: user.connection_id })
      });

      if (res.ok) {
        setRequestStatus('ACCEPTED');
        onAccepted(user.id); // Update parent state so it persists on next render
      } else {
        const err = await res.json();
        console.error("Accept error:", err);
      }
    } catch (err) {
      console.error("Accept failed:", err);
    } finally {
      setIsAccepting(false);
    }
  };

  // Open or create a DM room and navigate to chat
  const openChat = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsOpeningChat(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/room`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId: user.id })
      });
      if (res.ok) {
        const { roomId } = await res.json();
        router.push(`/messages?room=${roomId}`);
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
    } finally {
      setIsOpeningChat(false);
    }
  };

  return (
    <div className="bg-[#11151C] border border-gray-800/80 rounded-3xl p-6 flex flex-col items-center text-center hover:border-gray-600 transition-all shadow-xl relative group">
      
      {/* Status Pill */}
      <div className="absolute top-6 right-6 z-10">
        {user.is_online ? (
          <span className="bg-[#0A0D14] text-green-400 text-[10px] font-bold px-2 py-1 rounded-full border border-green-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> ONLINE
          </span>
        ) : (
          <span className="bg-[#0A0D14] text-gray-400 text-[10px] font-bold px-2 py-1 rounded-full border border-gray-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span> OFFLINE
          </span>
        )}
      </div>

      {/* Avatar with Gradient Ring */}
      <div className="mb-4 mt-2">
        <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#FF6B6B] to-[#5B75FF]">
          <div className="w-full h-full rounded-full bg-[#11151C] p-1">
            <img 
              src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.display_name}`} 
              alt={user.display_name || "User Avatar"} 
              className="w-full h-full object-cover rounded-full bg-[#0A0D14]"
              onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'; }}
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <h3 className="text-white font-bold text-xl mb-1">{user.display_name || "Unknown User"}</h3>
      <p className="text-[#8B949E] text-xs mb-5 uppercase tracking-widest font-semibold">
        {user.course || "N/A"} • {user.year_of_study ? `${user.year_of_study} YEAR` : "N/A"}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 h-[50px] overflow-hidden">
        {interests.slice(0, 3).map((tag, index) => (
          <span key={index} className="text-[10px] font-medium bg-[#1C212B] text-gray-300 px-3 py-1.5 rounded-md">
            {tag}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full mt-auto">
        <button className="flex-1 bg-[#1C212B] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors">
          Ping
        </button>

        {/* NONE → show Connect */}
        {requestStatus === 'NONE' && (
          <button
            onClick={() => handleConnect(user.id)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#b5c2ff] text-black hover:bg-white transition-all shadow-[0_0_15px_rgba(181,194,255,0.2)]"
          >
            Connect
          </button>
        )}

        {/* LOADING → spinner state */}
        {requestStatus === 'LOADING' && (
          <button disabled className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-900 text-blue-300 cursor-wait">
            Connecting...
          </button>
        )}

        {/* SENT_PENDING → I sent the request, waiting */}
        {requestStatus === 'SENT_PENDING' && (
          <button disabled className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700">
            ✓ Requested
          </button>
        )}

        {/* RECEIVED_PENDING → they sent it to me, I can accept */}
        {requestStatus === 'RECEIVED_PENDING' && (
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-500 transition-all shadow-[0_0_15px_rgba(22,163,74,0.4)] disabled:opacity-60 disabled:cursor-wait"
          >
            {isAccepting ? 'Accepting...' : '✓ Accept'}
          </button>
        )}

        {/* ACCEPTED → connected, show Message */}
        {requestStatus === 'ACCEPTED' && (
          <button
            onClick={openChat}
            disabled={isOpeningChat}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#5B75FF] text-white hover:bg-[#4a63ee] transition-all disabled:opacity-60"
          >
            {isOpeningChat ? '...' : '💬 Message'}
          </button>
        )}
      </div>
    </div>
  );
}