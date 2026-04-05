import { MessageCircle, UserPlus } from 'lucide-react';

export default function UserCard({ user }) {
  // Fallback for interests just in case
  const interests = user.interests || [];

  return (
    <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-gray-700 transition-all shadow-lg h-full">
      
      {/* 1. STRICT AVATAR CONTAINER - Fixed dimensions */}
      <div className="relative mb-4 w-24 h-24 flex-shrink-0">
        <img 
          src={user.avatar_url} 
          alt={user.display_name} 
          className="w-full h-full object-cover rounded-full border-2 border-gray-700 bg-[#0B0E14]"
        />
        {/* Online Status Dot */}
        <div className={`absolute bottom-0 right-1 w-5 h-5 rounded-full border-[3px] border-[#161B22] ${user.is_online ? 'bg-green-500' : 'bg-gray-600'}`} />
      </div>

      {/* 2. FORCED WHITE TEXT */}
      <h3 className="text-white font-bold text-lg">{user.display_name}</h3>
      <p className="text-blue-400 text-xs mb-4 uppercase tracking-wider font-semibold mt-1">
        {user.course} • Year {user.year_of_study}
      </p>

      {/* 3. TAGS */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {interests.map((tag) => (
          <span key={tag} className="text-[11px] font-medium bg-[#21262D] text-gray-300 px-3 py-1 rounded-full border border-gray-700">
            {tag}
          </span>
        ))}
      </div>

      {/* 4. BUTTONS AT BOTTOM */}
      <div className="flex gap-3 w-full mt-auto">
        <button className="flex-1 bg-[#21262D] text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors border border-gray-700">
          Ping
        </button>
        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          Connect
        </button>
      </div>
    </div>
  );
}
