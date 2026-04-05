'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, ShieldCheck, Info, Users, Calendar } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data.user?.onboarding_completed) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/onboarding';
        }
      } else {
        setError(data.error || "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05060f] flex items-center justify-center p-6 md:p-12 overflow-x-hidden">
      {/* Nebula glow - Adjusted for mobile */}
      <div className="pointer-events-none absolute -top-20 -left-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/10 rounded-full blur-[80px] md:blur-[120px]" />

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

        {/* ── LEFT: Branding (Mobile-First Text) ────────────────── */}
        <div className="flex-1 text-white text-center lg:text-left w-full">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 md:mb-10">
            <div className="bg-indigo-600/20 p-2.5 rounded-xl">
              <ShieldCheck color="#6366f1" size={28} />
            </div>
            <span className="text-2xl font-black tracking-tighter">VYBE</span>
          </div>

          {/* Headline - Fluid Typography */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-6">
            Your campus.<br />
            <span className="text-indigo-500">Your vybe.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-sm mx-auto lg:mx-0 mb-8">
            Step into the VIT Vybe — connect, compete, and own your campus life.
          </p>

          {/* Badges - Wrapping for small screens */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider">
              <Users size={14} /> Meet People
            </span>
            <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider">
              <Calendar size={14} /> Events
            </span>
            <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-green-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Available
            </span>
          </div>
        </div>

        {/* ── RIGHT: Login card (Adjusted for mobile widths) ────── */}
        <div className="w-full lg:w-[440px] shrink-0">
          
          {/* Info banner - Hidden on very small screens if needed, or kept slim */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 mb-4 mx-auto max-w-sm lg:max-w-none">
            <Info size={18} className="text-blue-400 mt-0.5 shrink-0" />
            <div className="text-[10px] md:text-xs text-slate-400">
              <b className="text-white block mb-0.5 uppercase">Campus Auth</b>
              Please use your official VIT student email to gain access.
            </div>
          </div>

          {/* Login box */}
          <div className="bg-[#0d0f1a]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] w-full">
            <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-1">Welcome Back</h2>
            <p className="text-slate-500 text-sm text-center mb-8 italic">Enter your credentials</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type="email"
                  placeholder="your-email@vitstudent.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs font-bold text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base transition-all shadow-[0_20px_40px_rgba(37,99,235,0.25)]"
              >
                {loading ? 'Authenticating...' : 'Catch the Vybe'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="text-center mt-8 pt-6 border-t border-white/5">
              <p className="text-sm text-slate-500">
                New to the campus?{' '}
                <button
                  onClick={() => router.push('/signup')}
                  className="text-blue-400 font-black hover:text-blue-300 transition-colors ml-1"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}