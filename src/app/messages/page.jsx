"use client";
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { ArrowLeft, Send, Users, MessageCircle, Search, Check, X, Calendar, Bell } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const BACKEND = process.env.NEXT_PUBLIC_API_URL;

// useSearchParams must be inside a Suspense boundary in Next.js app router
function MessagesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPeer = searchParams.get('peer');   // peerId passed from connections page
  const initialRoom = searchParams.get('room');   // roomId if already known

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]); // list of accepted connections
  const [activeFriend, setActiveFriend] = useState(null); // currently selected friend object
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leftTab, setLeftTab] = useState('messages'); // 'messages' | 'inquiries'
  const [inquiries, setInquiries] = useState([]);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [respondingId, setRespondingId] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── BOOTSTRAP: Auth + load conversation list ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user?.onboarding_completed) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    // Load accepted connections as the conversation list
    const loadConversations = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/connections`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(Array.isArray(data) ? data : []);

          // Auto-open conversation if peerId was passed in URL
          if (initialPeer && Array.isArray(data)) {
            const friend = data.find(f => f.id === initialPeer);
            if (friend) {
              openConversation(friend, token);
            } else {
              // Peer is not in connections — fetch their profile and open DM anyway
              fetchAndOpenPeer(initialPeer, token);
            }
          }
          // Auto-open if roomId was passed
          if (initialRoom && !initialPeer && Array.isArray(data)) {
            // Try to find the friend whose room this is
            openRoomById(initialRoom, token, data);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };

    loadConversations();

    // ── Load Inquiry inbox count for badge ──
    const loadInquiryCount = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/inquiries/inbox/count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setInquiryCount(data.count || 0);
        }
      } catch {}
    };
    loadInquiryCount();

    // ── Connect Socket.io ──
    const socket = io(BACKEND, {
      auth: { token },
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, []);  // eslint-disable-line

  // ── Fetch a non-connection user by ID and open a DM with them ──
  const fetchAndOpenPeer = async (peerId, tokenOverride) => {
    const token = tokenOverride || localStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND}/api/users/${peerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const user = await res.json();
      // Normalise field names to match the connection list shape
      const peer = {
        id: user.id,
        display_name: user.displayName,
        course: user.course,
        avatar_url: user.avatarUrl || null,
      };
      openConversation(peer, token);
    } catch (err) {
      console.error('Failed to fetch peer profile:', err);
    }
  };

  // ── Load full inquiries list (called when switching to Inquiries tab) ──
  const loadInquiries = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND}/api/inquiries/inbox`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setInquiries(await res.json());
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    }
  };

  // ── Respond to an inquiry (Accept or Reject) ──
  const handleRespond = async (id, action) => {
    const token = localStorage.getItem('token');
    setRespondingId(id);
    try {
      const res = await fetch(`${BACKEND}/api/inquiries/${id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const data = await res.json();
        setInquiries(prev => prev.filter(q => q.id !== id));
        setInquiryCount(prev => Math.max(0, prev - 1));
        // If accepted, open the chat room that was just created
        if (action === 'ACCEPT' && data.roomId) {
          openRoomById(data.roomId, token, conversations);
          setLeftTab('messages');
        }
      }
    } catch (err) {
      console.error('Failed to respond to inquiry:', err);
    } finally {
      setRespondingId(null);
    }
  };

  // ── Open a conversation by friend object ──
  const openConversation = async (friend, tokenOverride) => {
    const token = tokenOverride || localStorage.getItem('token');
    setActiveFriend(friend);
    setMessages([]);
    setIsLoadingHistory(true);

    try {
      // 1. Get or create DM room
      const roomRes = await fetch(`${BACKEND}/api/chat/room`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId: friend.id })
      });

      if (!roomRes.ok) throw new Error('Room creation failed');
      const { roomId } = await roomRes.json();
      setActiveRoomId(roomId);

      // 2. Join Socket.io room (leave old one first)
      if (socketRef.current?.connected) {
        socketRef.current.emit('join_chat', roomId);
      }

      // 3. Load message history
      const histRes = await fetch(`${BACKEND}/api/chat/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (histRes.ok) {
        const data = await histRes.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to open conversation:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const openRoomById = async (roomId, token, friends) => {
    setActiveRoomId(roomId);
    setIsLoadingHistory(true);
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('join_chat', roomId);
      }
      const histRes = await fetch(`${BACKEND}/api/chat/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (histRes.ok) {
        const data = await histRes.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to open room:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !activeRoomId || !socketRef.current?.connected) return;
    socketRef.current.emit('send_message', { roomId: activeRoomId, content: trimmed });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(f =>
    f.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout activeTab="messages">
      <div className="flex h-full overflow-hidden">

      {/* ── LEFT PANE: Conversation List ── */}
      {/* On mobile: show only when no active chat. On desktop: always visible */}
      <div className={`${activeFriend ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] border-r border-gray-800/60 flex-col bg-[#0A0D14] flex-shrink-0`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800/40">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
              isConnected
                ? 'text-green-400 border-green-500/30 bg-green-500/10'
                : 'text-gray-500 border-gray-700 bg-gray-800/30'
            }`}>
              {isConnected ? '● LIVE' : '○ OFF'}
            </span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setLeftTab('messages')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                leftTab === 'messages'
                  ? 'bg-[#5B75FF]/15 text-[#5B75FF] border border-[#5B75FF]/30'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              <MessageCircle size={13} className="inline mr-1.5 mb-0.5" />
              Chats
            </button>
            <button
              onClick={() => { setLeftTab('inquiries'); loadInquiries(); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
                leftTab === 'inquiries'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              <Bell size={13} className="inline mr-1.5 mb-0.5" />
              Inquiries
              {inquiryCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#5B75FF] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {inquiryCount > 9 ? '9+' : inquiryCount}
                </span>
              )}
            </button>
          </div>

          {/* Search — only on chats tab */}
          {leftTab === 'messages' && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#11151C] text-white border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#5B75FF] transition-colors"
              />
            </div>
          )}
        </div>

        {/* ── INQUIRIES PANEL ── */}
        {leftTab === 'inquiries' && (
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3">
            {inquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-gray-600 px-4">
                <Bell size={26} className="mb-3 opacity-30" />
                <p className="text-sm font-semibold text-gray-500">No pending inquiries</p>
                <p className="text-xs mt-1">When students ask about your events, they'll appear here.</p>
              </div>
            ) : (
              inquiries.map(inq => (
                <div key={inq.id} className="bg-[#11151C] border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
                  {/* Sender + event */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5B75FF] to-[#FF6B6B] flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                      {inq.sender?.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{inq.sender?.displayName}</p>
                      <p className="text-blue-400 text-[11px] flex items-center gap-1 truncate">
                        <Calendar size={10} />
                        Re: {inq.event?.title}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-600 flex-shrink-0">
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-gray-300 text-xs bg-[#05060F] p-3 rounded-xl border border-gray-800/50 italic leading-relaxed">
                    "{inq.message}"
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(inq.id, 'ACCEPT')}
                      disabled={respondingId === inq.id}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#5B75FF]/15 text-[#5B75FF] hover:bg-[#5B75FF] hover:text-white border border-[#5B75FF]/30 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <Check size={13} /> Accept & Chat
                    </button>
                    <button
                      onClick={() => handleRespond(inq.id, 'REJECT')}
                      disabled={respondingId === inq.id}
                      className="px-3 bg-gray-800/50 text-gray-500 hover:bg-red-500/15 hover:text-red-400 border border-gray-700 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── CONVERSATIONS LIST ── */}
        {leftTab === 'messages' && (
        <div className="flex-1 overflow-y-auto py-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-gray-600 text-sm px-6 py-10">
              <MessageCircle size={28} className="mx-auto mb-3 opacity-40" />
              {conversations.length === 0
                ? 'No connections yet. Go meet people!'
                : 'No results found.'}
            </div>
          ) : (
            filteredConversations.map((friend) => {
              const isActive = activeFriend?.id === friend.id;
              return (
                <button
                  key={friend.id}
                  onClick={() => openConversation(friend)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left ${
                    isActive
                      ? 'bg-[#5B75FF]/10 border-r-2 border-[#5B75FF]'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.display_name}`}
                      alt={friend.display_name}
                      className="w-11 h-11 rounded-full bg-gray-800 object-cover"
                      onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'; }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0A0D14]" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
                      {friend.display_name}
                    </p>
                    <p className="text-gray-500 text-xs truncate uppercase tracking-wide">
                      {friend.course}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
        )}

      </div>

      {/* ── RIGHT PANE: Active Chat ── */}
      {/* On mobile: show only when a chat is active */}
      <div className={`${activeFriend ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#05060f] min-w-0`}>

        {/* Chat Header */}
        <div className="h-[72px] border-b border-gray-800/60 flex items-center justify-between px-4 md:px-6 bg-[#0A0D14]/80 backdrop-blur-xl shrink-0">
          {activeFriend ? (
            <div className="flex items-center gap-3">
              {/* Mobile back button */}
              <button
                onClick={() => setActiveFriend(null)}
                className="md:hidden text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 -ml-1"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="relative">
                <img
                  src={activeFriend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeFriend.display_name}`}
                  alt={activeFriend.display_name}
                  className="w-9 h-9 rounded-full bg-gray-800 object-cover"
                  onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'; }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0D14]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">{activeFriend.display_name}</p>
                <p className="text-gray-500 text-xs uppercase tracking-wider">{activeFriend.course}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-gray-600">
              <MessageCircle size={20} />
              <span className="text-sm">Select a conversation</span>
            </div>
          )}
          {activeFriend && (
            <button
              onClick={() => router.push('/connections')}
              className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
              title="Back to Connections"
            >
              <ArrowLeft size={18} />
            </button>
          )}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!activeFriend ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
              <div className="w-20 h-20 rounded-full bg-[#11151C] border border-gray-800 flex items-center justify-center mb-4">
                <MessageCircle size={32} className="opacity-40" />
              </div>
              <p className="font-semibold text-gray-400 mb-1">No conversation selected</p>
              <p className="text-sm">Pick a connection from the left to start chatting.</p>
            </div>
          ) : isLoadingHistory ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5B75FF]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
              <p className="text-3xl mb-3">👋</p>
              <p className="font-semibold">Say hello to {activeFriend.display_name}!</p>
              <p className="text-sm mt-1">This is the beginning of your conversation.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender?.id === currentUser?.id || msg.senderId === currentUser?.id;
              return (
                <div key={msg.id || idx} className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar — only show for received messages */}
                  {!isMe && (
                    <img
                      src={msg.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.display_name || 'user'}`}
                      alt="avatar"
                      className="w-7 h-7 rounded-full bg-gray-800 flex-shrink-0 mb-1"
                    />
                  )}

                  {/* Bubble */}
                  <div className={`max-w-[65%] group ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <span className="text-[10px] text-gray-500 font-semibold ml-1 mb-1 uppercase tracking-wider">
                        {msg.sender?.display_name}
                      </span>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#4375FF] text-white rounded-br-sm shadow-[0_4px_20px_rgba(67,117,255,0.25)]'
                        : 'bg-[#161B22] text-gray-100 border border-gray-800/80 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className={`text-[10px] mt-1 px-1 ${isMe ? 'text-gray-600' : 'text-gray-600'}`}>
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        {activeFriend && (
          <div className="p-4 md:p-5 bg-[#0A0D14]/80 border-t border-gray-800/60 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-3 bg-[#11151C] border border-gray-800 rounded-full px-5 py-2.5 focus-within:border-[#5B75FF] transition-colors">
              <input
                type="text"
                placeholder={`Message ${activeFriend.display_name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none"
                autoFocus
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !isConnected}
                className="flex-shrink-0 w-9 h-9 rounded-full bg-[#b5c2ff] hover:bg-white flex items-center justify-center text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(181,194,255,0.4)]"
              >
                <svg className="w-4 h-4 translate-x-px" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            {!isConnected && (
              <p className="text-[11px] text-center text-yellow-500/60 mt-2">Reconnecting to Vybe...</p>
            )}
          </div>
        )}
      </div>
      </div>
    </AppLayout>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-[#05060f] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5B75FF]" />
      </div>
    }>
      <MessagesInner />
    </Suspense>
  );
}
