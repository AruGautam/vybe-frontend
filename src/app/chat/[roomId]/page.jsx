"use client";
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { ArrowLeft, Send } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL;

export default function ChatPage() {
  const { roomId } = useParams();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [peerName, setPeerName] = useState('');
  const [myId, setMyId] = useState('');

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user?.onboarding_completed) {
      router.push('/login');
      return;
    }

    setMyId(user.id);

    // 1. Load message history via REST
    const loadHistory = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/chat/${roomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };

    loadHistory();

    // 2. Connect Socket.io with JWT auth
    const socket = io(BACKEND, {
      auth: { token },
      transports: ['websocket']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_chat', roomId);
    });

    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, router]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current?.connected) return;

    socketRef.current.emit('send_message', { roomId, content: trimmed });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#05060f] text-white font-sans">

      {/* ── TOP BAR ── */}
      <header className="flex items-center gap-4 px-6 py-4 bg-[#0D0F1A]/80 border-b border-white/5 backdrop-blur-xl sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5B75FF] to-[#FF6B6B] flex items-center justify-center text-white text-sm font-bold">
            {peerName ? peerName[0].toUpperCase() : '?'}
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{peerName || 'Chat'}</p>
            <p className={`text-[10px] font-semibold ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
              {isConnected ? '● Live' : '○ Connecting...'}
            </p>
          </div>
        </div>
      </header>

      {/* ── MESSAGES ── */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-semibold">No messages yet.</p>
            <p className="text-sm mt-1">Send the first one!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender?.id === myId;
            return (
              <div key={msg.id || i} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!isMe && (
                  <img
                    src={msg.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.display_name}`}
                    alt={msg.sender?.display_name}
                    className="w-7 h-7 rounded-full bg-gray-800 flex-shrink-0"
                  />
                )}

                {/* Bubble */}
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-[#5B75FF] text-white rounded-br-sm'
                    : 'bg-[#11151C] text-gray-100 border border-gray-800/80 rounded-bl-sm'
                }`}>
                  {!isMe && (
                    <p className="text-[10px] font-bold text-[#5B75FF] mb-1 uppercase tracking-wider">
                      {msg.sender?.display_name}
                    </p>
                  )}
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500'} text-right`}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      {/* ── INPUT BAR ── */}
      <footer className="px-4 py-4 bg-[#0D0F1A]/80 border-t border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3 bg-[#11151C] border border-gray-800 rounded-2xl px-4 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message... (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#5B75FF] flex items-center justify-center text-white hover:bg-[#4a63ee] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(91,117,255,0.4)]"
          >
            <Send size={16} />
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-center text-yellow-500/70 mt-2">Reconnecting to Vybe...</p>
        )}
      </footer>
    </div>
  );
}
