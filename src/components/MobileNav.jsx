import Link from 'next/link';
import { Home, Calendar, MessageCircle, User, Users, Sparkles, ShoppingBag } from 'lucide-react';

export default function MobileNav({ activeTab }) {
  const navItems = [
    { id: 'dashboard',   path: '/dashboard',  icon: <Home size={20} />,          label: 'Home' },
    { id: 'events',      path: '/events',      icon: <Calendar size={20} />,      label: 'Events' },
    { id: 'meet-people', path: '/meet-people', icon: <Sparkles size={20} />,      label: 'Meet' },
    { id: 'messages',    path: '/messages',    icon: <MessageCircle size={20} />, label: 'Chat' },
    { id: 'connections', path: '/connections', icon: <Users size={20} />,         label: 'Friends' },
    { id: 'exchange',    path: '/exchange',    icon: <ShoppingBag size={20} />,   label: 'Exchange' },
    { id: 'profile',     path: '/profile',     icon: <User size={20} />,          label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Frosted midnight bar */}
      <div className="bg-[#0a0a0f]/90 backdrop-blur-2xl border-t border-white/[0.06] shadow-[0_-8px_40px_rgba(0,0,0,0.6)]">
        <div className="flex overflow-x-auto scrollbar-hide px-1 py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex flex-col items-center justify-center shrink-0 w-[14.28%] min-w-[60px] py-2 gap-1 transition-all duration-200 relative ${
                  isActive ? 'text-[#0a0a0f]' : 'text-white/35 hover:text-white/70'
                }`}
              >
                {/* Active pill background */}
                {isActive && (
                  <span className="absolute inset-x-2 inset-y-0.5 rounded-full bg-[#bcff00] shadow-[0_0_16px_rgba(188,255,0,0.5)] -z-10" />
                )}
                <span className={`transition-colors ${isActive ? 'text-[#0a0a0f]' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-wide ${isActive ? 'text-[#0a0a0f]' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}