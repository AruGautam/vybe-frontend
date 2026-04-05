import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout({ children, activeTab }) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white font-sans">

      {/* ── Mesh gradient aura — scoped to the content area ─────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Primary violet aura — top left corner */}
        <div className="aura-blob -top-[160px] left-[200px] w-[500px] h-[500px] bg-violet-600" />
        {/* Neon cyan accent — bottom right */}
        <div className="aura-blob bottom-[5%] right-[10%] w-[360px] h-[360px] bg-cyan-400" style={{ opacity: 0.12 }} />
        {/* Neon lime whisper — mid left */}
        <div className="aura-blob top-[55%] left-[5%] w-[280px] h-[280px] bg-[#bcff00]" style={{ opacity: 0.07 }} />
      </div>

      {/* 1. SIDEBAR: Hidden on mobile, visible on desktop */}
      <div className="hidden md:flex relative z-20">
        <Sidebar active={activeTab} />
      </div>

      {/* 2. MAIN CONTENT */}
      <main className="relative z-10 w-full flex-1 h-screen overflow-y-auto pb-24 md:pb-0">
        {children}
      </main>

      {/* 3. MOBILE NAV: Only shows on mobile */}
      <div className="md:hidden">
        <MobileNav activeTab={activeTab} />
      </div>

    </div>
  );
}
