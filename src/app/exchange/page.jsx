"use client";
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Tag, ShoppingBag, Plus, MessageCircle, Info, Search, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const CONDITION_LABELS = {
  NEW:      { label: 'New',      color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  LIKE_NEW: { label: 'Like New', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  GOOD:     { label: 'Good',     color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  FAIR:     { label: 'Fair',     color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
};

export default function CampusExchange() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'GOOD',
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserId(user?.id || null);
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/marketplace`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostItem = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    setPostError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/marketplace/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setItems(prev => [data.item, ...prev]);
        setForm({ title: '', description: '', price: '', condition: 'GOOD' });
        setPostSuccess(true);
        setTimeout(() => setPostSuccess(false), 3000);
      } else {
        setPostError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setPostError('Network error — is the backend running?');
    } finally {
      setIsPosting(false);
    }
  };

  const handleMarkSold = async (itemId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/marketplace/${itemId}/sold`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'SOLD' } : i));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  const filteredItems = items.filter(item => {
    const matchesSearch =
      !searchTerm ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondition = !filterCondition || item.condition === filterCondition;
    return matchesSearch && matchesCondition;
  });

  return (
    <AppLayout activeTab="exchange">
      <div className="p-8 max-w-7xl mx-auto pb-24">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">Student Market</p>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShoppingBag className="text-green-500" size={30} />
            Campus Exchange
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">
            Buy, sell, and trade with verified students on Vybe.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT: ITEM FEED ─────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Search + Filter bar */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#11151C] border border-gray-800 focus:border-green-500/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none transition"
                />
              </div>
              <div className="relative">
                <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <select
                  value={filterCondition}
                  onChange={e => setFilterCondition(e.target.value)}
                  className="bg-[#11151C] border border-gray-800 focus:border-green-500/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none transition appearance-none"
                >
                  <option value="">All Conditions</option>
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-[#11151C] border border-gray-800 rounded-[32px] p-12 text-center">
                <Tag size={40} className="mx-auto text-gray-700 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  {searchTerm || filterCondition ? 'No items match your filters.' : 'No items listed yet.'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {!searchTerm && !filterCondition && 'Be the first to list something on campus!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredItems.map(item => {
                  const cond = CONDITION_LABELS[item.condition] || CONDITION_LABELS.GOOD;
                  const isOwner = item.sellerId === currentUserId;
                  const isSold = item.status === 'SOLD';

                  return (
                    <div
                      key={item.id}
                      className={`bg-[#11151C] border rounded-[24px] p-6 flex flex-col transition-all ${
                        isSold
                          ? 'border-gray-800 opacity-60'
                          : 'border-gray-800 hover:border-green-500/40 hover:shadow-[0_0_30px_rgba(34,197,94,0.05)]'
                      }`}
                    >
                      {/* Top row: price + condition */}
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-green-400 font-black text-xl">
                          {formatPrice(item.price)}
                        </span>
                        <div className="flex items-center gap-2">
                          {isSold && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md">
                              Sold
                            </span>
                          )}
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${cond.color}`}>
                            {cond.label}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white mb-1.5 leading-snug">{item.title}</h3>
                      <p className="text-sm text-gray-400 mb-5 flex-1 line-clamp-2 leading-relaxed">
                        {item.description || <span className="italic text-gray-600">No description provided.</span>}
                      </p>

                      {/* Bottom row: seller + action */}
                      <div className="pt-4 border-t border-gray-800/80 flex justify-between items-center mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-[10px] font-black text-white">
                            {item.seller?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {item.seller?.displayName?.split(' ')[0] || 'Student'}
                          </span>
                        </div>

                        {isOwner && !isSold ? (
                          <button
                            onClick={() => handleMarkSold(item.id)}
                            className="text-xs font-bold text-orange-400 hover:text-orange-300 transition border border-orange-500/30 bg-orange-500/10 px-3 py-1 rounded-full"
                          >
                            Mark Sold
                          </button>
                        ) : !isSold ? (
                          <button
                            onClick={() => router.push(`/messages?peer=${item.sellerId}`)}
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition"
                          >
                            <MessageCircle size={13} /> Message
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: POST FORM ─────────────────────────────────── */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="bg-[#11151C] border border-gray-800 rounded-[32px] p-6 sticky top-8">
              <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <Tag size={16} className="text-green-400" /> Post an Item
              </h2>

              <form onSubmit={handlePostItem} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    What are you selling? *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Engineering Drafter, DS textbook"
                    className="w-full bg-[#05060F] border border-gray-700 focus:border-green-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition placeholder-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="e.g. 500"
                      className="w-full bg-[#05060F] border border-gray-700 focus:border-green-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Condition *
                    </label>
                    <select
                      value={form.condition}
                      onChange={e => setForm({ ...form, condition: e.target.value })}
                      className="w-full bg-[#05060F] border border-gray-700 focus:border-green-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition"
                    >
                      <option value="NEW">New</option>
                      <option value="LIKE_NEW">Like New</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Details
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Mention edition, any damage, pickup location, etc."
                    rows={3}
                    maxLength={500}
                    className="w-full bg-[#05060F] border border-gray-700 focus:border-green-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition resize-none placeholder-gray-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPosting || !form.title.trim() || form.price === ''}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  {isPosting ? 'Posting...' : 'List Item'}
                </button>

                {postSuccess && (
                  <p className="text-center text-green-400 text-xs font-semibold">
                    ✓ Item listed successfully!
                  </p>
                )}
                {postError && (
                  <p className="text-center text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-3">
                    ✗ {postError}
                  </p>
                )}
              </form>

              <div className="mt-5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 text-blue-400 text-xs leading-relaxed">
                <Info size={15} className="shrink-0 mt-0.5" />
                <p>
                  Transactions happen in person on campus. Use the{' '}
                  <span className="font-bold">Message</span> button to negotiate
                  and arrange a pickup spot.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
