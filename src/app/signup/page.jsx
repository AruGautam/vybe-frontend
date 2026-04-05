'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, ArrowRight, ShieldCheck, Info, Users, Calendar, KeyRound } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      setLoading(false);
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\\/?]/.test(password)) {
      setError('Password must contain at least one special character.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, inviteCode: inviteCode.trim() || undefined })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        const isOrg = data.user?.role === 'CLUB_ADMIN';
        setSuccess(isOrg
          ? '🚀 Organization account created! Setting up your profile...'
          : '✓ Account created successfully! Entering onboarding...'
        );
        setTimeout(() => { window.location.href = '/onboarding'; }, 1500);
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05060f] flex items-center justify-center p-6 md:p-10 overflow-x-hidden">
      {/* Nebula glow */}
      <div className="pointer-events-none absolute -top-20 -left-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/10 rounded-full blur-[80px] md:blur-[120px]" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center gap-10 lg:gap-20">

        {/* LEFT: Branding */}
        <div className="flex-1 text-white text-center lg:text-left w-full">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 md:mb-10">
            <div className="bg-indigo-600/20 p-2.5 rounded-xl">
              <ShieldCheck color="#6366f1" size={28} />
            </div>
            <span className="text-2xl font-black tracking-tighter">VYBE</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-6">
            Join the<br />
            <span className="text-indigo-500">Vybe.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-sm mx-auto lg:mx-0 mb-8">
            Create your VIT account and become part of the digital ecosystem. Connect with thousands of students.
          </p>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider">
              <Users size={14} /> Meet People
            </span>
            <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider">
              <Calendar size={14} /> Events
            </span>
            <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-green-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Launching Now
            </span>
          </div>
        </div>

        {/* RIGHT: Signup card */}
        <div className="w-full lg:w-[460px] shrink-0">
          {/* Info banner */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Info size={18} className="text-blue-400 mt-0.5 shrink-0" />
            <div className="text-[10px] md:text-xs text-slate-400">
              <b className="text-white block mb-0.5 uppercase">VIT Students Only</b>
              Use your official VIT student email to register.
            </div>
          </div>

          <div className="bg-[#0d0f1a]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 md:p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-1">Create Account</h2>
            <p className="text-slate-500 text-sm text-center mb-6 italic">Join the Vybe community</p>

            <form onSubmit={handleSignup} className="space-y-3">
              {/* Name */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input type="text" placeholder="Full Name" value={name}
                  onChange={(e) => setName(e.target.value)} disabled={loading} required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input type="email" placeholder="your-email@vitstudent.ac.in" value={email}
                  onChange={(e) => setEmail(e.target.value)} disabled={loading} required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input type="password" placeholder="Password" value={password}
                  onChange={(e) => setPassword(e.target.value)} disabled={loading} required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="flex flex-col gap-1 px-1">
                  {[
                    { ok: password.length >= 8, label: '8+ characters' },
                    { ok: /[A-Z]/.test(password), label: '1 uppercase letter' },
                    { ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\\/?]/.test(password), label: '1 special character' },
                  ].map(({ ok, label }) => (
                    <span key={label} className={`text-[11px] flex items-center gap-1.5 ${ok ? 'text-green-400' : 'text-slate-600'}`}>
                      {ok ? '✓' : '○'} {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input type="password" placeholder="Confirm Password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Invite Code */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5 px-1">
                  <KeyRound size={12} className="text-slate-600" />
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Organization Invite Code</span>
                  <span className="text-[11px] text-slate-700">(Optional)</span>
                </div>
                <input type="text" placeholder="Only for verified club organizations"
                  value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
                  disabled={loading} autoComplete="off" spellCheck={false}
                  className={`w-full bg-black/40 border rounded-2xl py-3.5 px-4 text-white text-sm placeholder-slate-600 outline-none transition-colors font-mono tracking-wider
                    ${inviteCode ? 'border-violet-500/40 bg-violet-500/5 focus:border-violet-400' : 'border-white/10 focus:border-indigo-500'}`}
                />
                {inviteCode && (
                  <p className="text-[11px] text-violet-400 flex items-center gap-1.5 mt-1.5 px-1">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                    Invite code detected — account will be created as Club Admin
                  </p>
                )}
              </div>

              {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}
              {success && <p className="text-green-400 text-xs font-bold text-center">{success}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base transition-all shadow-[0_20px_40px_rgba(37,99,235,0.25)]"
              >
                {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="text-center mt-6 pt-5 border-t border-white/5">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <button onClick={() => router.push('/login')}
                  className="text-blue-400 font-black hover:text-blue-300 transition-colors ml-1">
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
