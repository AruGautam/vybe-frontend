"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Link2, Code, Globe, Edit3, Check, X,
  Zap, Users, CalendarDays, Flame, Plus, ToggleLeft, ToggleRight, ExternalLink,
  ShieldCheck, BookOpen, Wrench
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const LOOKING_FOR_OPTIONS = [
  'Hackathon Team', 'Study Buddy', 'Gym Partner', 'Roommate',
  'Project Collaborator', 'Mentor', 'Coffee Chat', 'Startup Co-founder',
  'Math Tutor', 'Music Jam'
];

const STATUS_PRESETS = [
  { emoji: '📚', text: 'Cramming for exams' },
  { emoji: '☕', text: 'Free for coffee at the Gazebo' },
  { emoji: '💻', text: 'Coding at the library' },
  { emoji: '🎮', text: 'Taking a break' },
  { emoji: '🏃', text: 'At the gym' },
  { emoji: '🍕', text: 'Lunch break — ping me!' },
  { emoji: '🔇', text: 'Heads down mode' },
  { emoji: '👋', text: 'Open to chat' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Edit form state
  const [form, setForm] = useState({
    statusEmoji: '👋',
    statusText: 'Just joined Vybe',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    leetcodeUrl: '',
    portfolioUrl: '',
    lookingFor: [],
    openToMeetups: true,
    interests: [],
    skills: '',
  });

  // New inputs for tags
  const [newInterest, setNewInterest] = useState('');
  const [newLookingFor, setNewLookingFor] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        const res = await fetch(`${API}/api/users/me/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 404) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/signup');
            return;
          }
          throw new Error(`Failed to fetch profile (${res.status})`);
        }
        const data = await res.json();
        setProfile(data);
        setForm({
          statusEmoji: data.statusEmoji || '👋',
          statusText: data.statusText || 'Just joined Vybe',
          bio: data.bio || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          leetcodeUrl: data.leetcodeUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          lookingFor: data.lookingFor || [],
          openToMeetups: data.openToMeetups ?? true,
          interests: data.interests || [],
          skills: data.skills ? data.skills.join(', ') : '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/users/me/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          skills: form.skills,
        })
      });
      if (!res.ok) throw new Error('Save failed');

      const parsedSkills = form.skills
        ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      setProfile(prev => ({ ...prev, ...form, skills: parsedSkills }));
      setIsEditing(false);
      setIsEditingStatus(false);
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err) {
      console.error(err);
      setSaveMsg('Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleLookingFor = (tag) => {
    setForm(f => ({
      ...f,
      lookingFor: f.lookingFor.includes(tag)
        ? f.lookingFor.filter(t => t !== tag)
        : [...f.lookingFor, tag]
    }));
  };

  const addCustomLookingFor = () => {
    const clean = newLookingFor.trim();
    if (clean && !form.lookingFor.includes(clean)) {
      setForm(f => ({ ...f, lookingFor: [...f.lookingFor, clean] }));
    }
    setNewLookingFor('');
  };

  const removeCustomLookingFor = (tag) => {
    setForm(f => ({ ...f, lookingFor: f.lookingFor.filter(t => t !== tag) }));
  };

  const addInterest = () => {
    const clean = newInterest.trim().replace(/^#/, '');
    if (clean && !form.interests.includes(clean)) {
      setForm(f => ({ ...f, interests: [...f.interests, clean] }));
    }
    setNewInterest('');
  };

  const removeInterest = (name) => {
    setForm(f => ({ ...f, interests: f.interests.filter(i => i !== name) }));
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#05060F] text-white">
      Loading profile...
    </div>
  );

  if (!profile) return (
    <div className="flex h-screen items-center justify-center bg-[#05060F] text-red-400">
      Could not load profile.
    </div>
  );

  const displayEmoji = isEditing ? form.statusEmoji : (profile.statusEmoji || '👋');
  const displayStatus = isEditing ? form.statusText : (profile.statusText || 'Just joined Vybe');

  // Filter out predefined options to find custom tags the user added
  const customLookingForTags = form.lookingFor.filter(tag => !LOOKING_FOR_OPTIONS.includes(tag));

  return (
    <AppLayout activeTab="profile">
      <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">

        {/* ── HEADER CARD ─────────────────────────────────────────── */}
        <div className="bg-[#11151C] border border-gray-800 rounded-[32px] p-8 mb-8 relative overflow-visible">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 blur-[120px] -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-20">

            {/* Avatar + Status Bubble (FIXED POSITIONING & Z-INDEX) */}
            <div className="relative shrink-0 flex flex-col items-center z-40">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[3px] shadow-xl relative z-30">
                <div className="w-full h-full rounded-full bg-[#05060F] flex items-center justify-center text-4xl font-black text-white">
                  {profile.display_name?.charAt(0).toUpperCase()}
                </div>
              </div>

              {!isEditingStatus ? (
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1C212B] border border-gray-700 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-xl hover:border-gray-500 transition cursor-pointer z-40"
                >
                  <span className="text-base">{displayEmoji}</span>
                  <span className="text-[11px] font-semibold text-gray-300 max-w-[120px] truncate">{displayStatus}</span>
                  <Edit3 size={11} className="text-gray-500 shrink-0" />
                </button>
              ) : (
                <div className="absolute top-[105%] left-1/2 -translate-x-1/2 z-50 bg-[#1C212B] border border-blue-500/40 rounded-2xl p-4 shadow-[0_30px_60px_rgba(0,0,0,0.7)] w-64">
                  <div className="flex gap-2 mb-3">
                    <input
                      value={form.statusEmoji}
                      onChange={e => setForm(f => ({ ...f, statusEmoji: e.target.value }))}
                      className="w-12 bg-[#05060F] border border-gray-700 rounded-lg text-center text-lg outline-none"
                      maxLength={2}
                    />
                    <input
                      value={form.statusText}
                      onChange={e => setForm(f => ({ ...f, statusText: e.target.value }))}
                      placeholder="What's your vibe?"
                      className="flex-1 bg-[#05060F] border border-gray-700 rounded-lg px-2 text-xs text-white outline-none focus:border-blue-500"
                      maxLength={30}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {STATUS_PRESETS.map(p => (
                      <button
                        key={p.text}
                        onClick={() => setForm(f => ({ ...f, statusEmoji: p.emoji, statusText: p.text }))}
                        className="text-sm bg-[#05060F] border border-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:border-blue-500 transition"
                        title={p.text}
                      >
                        {p.emoji}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => { handleSave(); }}
                    className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
                  >
                    Set Status
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0 relative z-20">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h1 className="text-3xl font-black text-white">{profile.display_name}</h1>
                {profile.role === 'CLUB_ADMIN' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={12} /> Club Admin
                  </span>
                )}
              </div>
              <p className="text-blue-400 font-medium mb-1 text-sm">{profile.email}</p>
              <p className="text-gray-400 text-sm mb-4">
                {profile.course || 'Course not set'} {profile.year_of_study ? `• Year ${profile.year_of_study}` : ''} {profile.hostel_block ? `• ${profile.hostel_block}` : ''}
              </p>

              {/* Social links */}
              <div className="flex gap-3 flex-wrap justify-center md:justify-start mb-5">
                {(isEditing ? form.githubUrl : profile.githubUrl) && (
                  <a href={isEditing ? form.githubUrl : profile.githubUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition border border-gray-700 hover:border-gray-500 rounded-full px-3 py-1">
                    <Link2 size={13} /> GitHub <ExternalLink size={11} />
                  </a>
                )}
                {(isEditing ? form.linkedinUrl : profile.linkedinUrl) && (
                  <a href={isEditing ? form.linkedinUrl : profile.linkedinUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition border border-gray-700 hover:border-blue-500/50 rounded-full px-3 py-1">
                    <Link2 size={13} /> LinkedIn <ExternalLink size={11} />
                  </a>
                )}
                {(isEditing ? form.leetcodeUrl : profile.leetcodeUrl) && (
                  <a href={isEditing ? form.leetcodeUrl : profile.leetcodeUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-yellow-400 transition border border-gray-700 hover:border-yellow-500/50 rounded-full px-3 py-1">
                    <Code size={13} /> LeetCode <ExternalLink size={11} />
                  </a>
                )}
                {(isEditing ? form.portfolioUrl : profile.portfolioUrl) && (
                  <a href={isEditing ? form.portfolioUrl : profile.portfolioUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-400 transition border border-gray-700 hover:border-green-500/50 rounded-full px-3 py-1">
                    <Globe size={13} /> Portfolio <ExternalLink size={11} />
                  </a>
                )}
                {!isEditing && !profile.githubUrl && !profile.linkedinUrl && !profile.leetcodeUrl && !profile.portfolioUrl && (
                  <span className="text-xs text-gray-600 italic">No links added yet — hit Edit to add them.</span>
                )}
              </div>

              {/* Stats row */}
              <div className="flex justify-center md:justify-start gap-3 flex-wrap">
                <StatChip icon={<Users size={14} />} value={profile.stats?.connections ?? 0} label="Connections" color="blue" />
                <StatChip icon={<Flame size={14} />} value={profile.vibeScore ?? 0} label="Vibe Score" color="orange" />
                <StatChip icon={<CalendarDays size={14} />} value={profile.stats?.eventsCreated ?? 0} label="Events" color="purple" />
                <StatChip icon={<Zap size={14} />} value={profile.stats?.vibesPosted ?? 0} label="Vibes" color="yellow" />
              </div>
            </div>

            {/* Edit / Save button */}
            <div className="flex flex-col items-end gap-2 shrink-0 relative z-20">
              <button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isEditing
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {isEditing ? <><Check size={16} /> {saving ? 'Saving…' : 'Save'}</> : <><Edit3 size={16} /> Edit Profile</>}
              </button>
              {isEditing && (
                <button
                  onClick={() => { setIsEditing(false); setIsEditingStatus(false); }}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition px-2 py-1"
                >
                  <X size={14} /> Cancel
                </button>
              )}
              {saveMsg && (
                <span className={`text-xs font-semibold ${saveMsg === 'Saved!' ? 'text-green-400' : 'text-red-400'}`}>
                  {saveMsg}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── EDIT FORM (links + availability) ────────────────────── */}
        {isEditing && (
          <div className="bg-[#11151C] border border-blue-500/20 rounded-[24px] p-6 mb-6 relative z-10">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Edit3 size={16} className="text-blue-400" /> Edit Links & Availability
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {[
                { key: 'githubUrl', label: 'GitHub URL', icon: <Link2 size={14} />, placeholder: 'https://github.com/yourname' },
                { key: 'linkedinUrl', label: 'LinkedIn URL', icon: <Link2 size={14} />, placeholder: 'https://linkedin.com/in/yourname' },
                { key: 'leetcodeUrl', label: 'LeetCode URL', icon: <Code size={14} />, placeholder: 'https://leetcode.com/yourname' },
                { key: 'portfolioUrl', label: 'Portfolio URL', icon: <Globe size={14} />, placeholder: 'https://yourportfolio.com' },
              ].map(({ key, label, icon, placeholder }) => (
                <div key={key}>
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">{icon} {label}</label>
                  <input
                    type="url"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-[#05060F] border border-gray-700 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-none transition"
                  />
                </div>
              ))}
            </div>

            {/* Availability toggle */}
            <div className="flex items-center justify-between bg-[#05060F] border border-gray-700 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Open to meetups</p>
                <p className="text-xs text-gray-500">Let others know you're up for hanging out on campus</p>
              </div>
              <button onClick={() => setForm(f => ({ ...f, openToMeetups: !f.openToMeetups }))}>
                {form.openToMeetups
                  ? <ToggleRight size={32} className="text-blue-500" />
                  : <ToggleLeft size={32} className="text-gray-600" />
                }
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">

          {/* ── INTERESTS ─────────────────────────────────────────── */}
          <div className="bg-[#11151C] border border-gray-800 rounded-[24px] p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap size={15} className="text-yellow-400" /> Interests
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {(isEditing ? form.interests : profile.interests).map(name => (
                <span key={name} className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
                  #{name}
                  {isEditing && (
                    <button onClick={() => removeInterest(name)} className="ml-1 text-blue-400 hover:text-red-400 transition">
                      <X size={10} />
                    </button>
                  )}
                </span>
              ))}
              {(isEditing ? form.interests : profile.interests).length === 0 && (
                <span className="text-xs text-gray-600 italic">No interests added yet.</span>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2 mt-2 pt-3 border-t border-gray-800">
                <input
                  value={newInterest}
                  onChange={e => setNewInterest(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addInterest()}
                  placeholder="Add interest (e.g. Robotics)"
                  className="flex-1 bg-[#05060F] border border-gray-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
                />
                <button onClick={addInterest} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl transition">
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

          {/* ── LOOKING FOR (WITH CUSTOM INPUT) ────────────────────── */}
          <div className="bg-[#11151C] border border-gray-800 rounded-[24px] p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users size={15} className="text-purple-400" /> Looking For
            </h2>
            {isEditing ? (
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {LOOKING_FOR_OPTIONS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleLookingFor(tag)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        form.lookingFor.includes(tag)
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                          : 'bg-white/5 border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  
                  {/* Custom Tags (Not in presets) */}
                  {customLookingForTags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {tag}
                      <button onClick={() => removeCustomLookingFor(tag)} className="ml-1 text-purple-400 hover:text-red-400 transition">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input for Custom Looking For tags */}
                <div className="flex gap-2 pt-3 border-t border-gray-800">
                  <input
                    value={newLookingFor}
                    onChange={e => setNewLookingFor(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomLookingFor()}
                    placeholder="Add custom (e.g. UX Designer)"
                    className="flex-1 bg-[#05060F] border border-gray-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
                  />
                  <button onClick={addCustomLookingFor} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl transition">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile.lookingFor || []).length > 0
                  ? profile.lookingFor.map(tag => (
                      <span key={tag} className="text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))
                  : <span className="text-xs text-gray-600 italic">Nothing set — edit your profile to let people know what you need.</span>
                }
              </div>
            )}
          </div>

          {/* ── AVAILABILITY ─────────────────────────────────────── */}
          <div className="bg-[#11151C] border border-gray-800 rounded-[24px] p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Flame size={15} className="text-orange-400" /> Availability
            </h2>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${profile.openToMeetups ? 'bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.4)]' : 'bg-gray-600'}`} />
              <p className="text-sm text-white font-semibold">
                {profile.openToMeetups ? 'Open to meetups 👋' : 'Heads down mode 🔇'}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {profile.openToMeetups
                ? 'You\'re showing up as available for campus hangouts.'
                : 'You\'re in focus mode — others won\'t ping you for meetups.'}
            </p>
          </div>

          {/* ── ACADEMIC INFO ─────────────────────────────────────── */}
          <div className="bg-[#11151C] border border-gray-800 rounded-[24px] p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <CalendarDays size={15} className="text-blue-400" /> Academic Info
            </h2>
            <dl className="space-y-2 text-sm">
              <InfoRow label="Course" value={profile.course} />
              <InfoRow label="Year" value={profile.year_of_study ? `Year ${profile.year_of_study}` : null} />
              <InfoRow label="Hostel Block" value={profile.hostel_block} />
            </dl>
          </div>

          {/* ── BIO ──────────────────────────────────────────────── */}
          <div className="bg-[#11151C] border border-gray-800 rounded-[24px] p-6 md:col-span-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen size={15} className="text-green-400" /> About Me
            </h2>
            {isEditing ? (
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell the campus about yourself… (max 160 chars)"
                maxLength={160}
                rows={3}
                className="w-full bg-[#05060F] border border-gray-700 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-none transition resize-none"
              />
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed">
                {profile.bio || <span className="text-gray-600 italic">No bio added yet — hit Edit to introduce yourself.</span>}
              </p>
            )}
          </div>

          {/* ── SKILLS ───────────────────────────────────────────── */}
          <div className="bg-[#11151C] border border-gray-800 rounded-[24px] p-6 md:col-span-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Wrench size={15} className="text-cyan-400" /> Skills
            </h2>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={form.skills}
                  onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                  placeholder="e.g. React, Python, Figma, Badminton"
                  className="w-full bg-[#05060F] border border-gray-700 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-white outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-1.5">Separate skills with commas.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile.skills || []).length > 0
                  ? profile.skills.map(skill => (
                      <span key={skill} className="text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))
                  : <span className="text-xs text-gray-600 italic">No skills listed yet — show what you know!</span>
                }
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

function StatChip({ icon, value, label, color }) {
  const colors = {
    blue:   'bg-blue-500/10 border-blue-500/20 text-blue-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  };
  return (
    <div className={`flex items-center gap-2 border px-3 py-2 rounded-xl ${colors[color] || colors.blue}`}>
      {icon}
      <div>
        <p className="text-base font-black leading-none">{value}</p>
        <p className="text-[10px] uppercase tracking-wider font-bold opacity-70 leading-none mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-white font-medium">{value || <span className="text-gray-600 italic text-xs">Not set</span>}</dd>
    </div>
  );
}