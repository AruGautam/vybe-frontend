import { useRouter } from 'next/navigation';
import { TrendingUp, Calendar, MessageCircle, Users, Sparkles, ShoppingBag, LogOut } from 'lucide-react';

export default function Sidebar({ active }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/signup');
  };

  const navItems = [
    { name: 'Dashboard',   path: '/dashboard',  icon: <TrendingUp size={17} />,    key: 'dashboard' },
    { name: 'Events',      path: '/events',      icon: <Calendar size={17} />,      key: 'events' },
    { name: 'Chat',        path: '/messages',    icon: <MessageCircle size={17} />, key: 'messages' },
    { name: 'Connections', path: '/connections', icon: <Users size={17} />,         key: 'connections' },
    { name: 'Meet People', path: '/meet-people', icon: <Sparkles size={17} />,      key: 'meet-people' },
    { name: 'Exchange',    path: '/exchange',    icon: <ShoppingBag size={17} />,   key: 'exchange' },
  ];

  return (
    <div className="w-[260px] shrink-0 h-screen sticky top-0 flex flex-col bg-[#0a0a0f]/80 backdrop-blur-xl border-r border-white/[0.05] p-5 z-50 hidden md:flex">

      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-[14px] bg-[#bcff00] flex items-center justify-center shadow-[0_0_20px_rgba(188,255,0,0.4)]">
          <Sparkles className="text-[#0a0a0f]" size={20} strokeWidth={2.5} />
        </div>
        <span className="text-lg font-black tracking-[-0.04em] text-white">VYBE</span>
      </div>

      {/* ── Section label ─────────────────────────────────────────── */}
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25 mb-3 px-1">Menu</p>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.path)}
              className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 text-left ${
                isActive
                  ? 'bg-[#bcff00] text-[#0a0a0f] shadow-[0_0_20px_rgba(188,255,0,0.3)]'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className={`${isActive ? 'text-[#0a0a0f]' : 'text-white/40 group-hover:text-white/80'} transition-colors`}>
                {item.icon}
              </span>
              {item.name}
            </button>
          );
        })}
      </div>

      {/* ── Divider ───────────────────────────────────────────────── */}
      <div className="h-px bg-white/[0.05] my-4" />

      {/* ── Logout ────────────────────────────────────────────────── */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
      >
        <LogOut size={17} />
        Log out
      </button>
    </div>
  );
}
