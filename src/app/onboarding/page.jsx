"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DEPARTMENTS = ["BBA", "MBA", "BCOM", "MTECH", "BTECH"];
const SUGGESTED_INTERESTS = [
  "#WebDev", "#AI", "#MachineLearning", "#UIUX", "#DataScience", 
  "#CyberSecurity", "#Blockchain", "#CloudComputing", "#MobileDev",
  "#CompetitiveProgramming", "#OpenSource", "#DevOps", "#Robotics"
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [course, setCourse] = useState('SCSE');
  const [year, setYear] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Guard: If already completed, don't let them stay here
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.onboarding_completed) {
      router.push('/dashboard');
    }
  }, [router]);

  const toggleInterest = (tag) => {
    setSelectedInterests(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleFinish = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/onboarding`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          course, 
          year_of_study: year, 
          hostel_block: '',
          interests: selectedInterests 
        })
      });

      const data = await res.json();

      if (res.ok) {
        // CRITICAL: Update the local 'user' object with the response from backend
        // This ensures the Dashboard 'Guard' sees onboarding_completed = true
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        const updatedUser = {
          ...currentUser,
          ...data.user,
          onboarding_completed: true,
          course: course,
          year_of_study: year,
          interests: selectedInterests
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Now redirect - the Guard will let you through!
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to complete onboarding');
      }
    } catch (err) {
      console.error("Onboarding failed", err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060f] flex items-center justify-center p-6 font-sans">
      <div className="bg-[#11151C] border border-gray-800/60 p-10 rounded-[40px] max-w-xl w-full shadow-2xl relative overflow-hidden">
        
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-10"></div>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500" 
            style={{ width: `${(step / 2) * 100}%` }}
          ></div>
        </div>

        <div className="relative z-10">
          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-bold text-white mb-2">Set your campus profile</h2>
              <p className="text-gray-400 mb-10">Which department and year represent you?</p>

              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Department</label>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {DEPARTMENTS.map(dept => (
                  <button 
                    key={dept}
                    onClick={() => setCourse(dept)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${course === dept ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-[#0A0D14] border-gray-800 text-gray-400 hover:border-gray-600'}`}
                  >
                    {dept}
                  </button>
                ))}
              </div>

              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Academic Year</label>
              <div className="flex gap-4 mb-10">
                {[1, 2, 3, 4].map(y => (
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className={`flex-1 py-4 rounded-xl border font-bold transition-all ${year === y ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-[#0A0D14] border-gray-800 text-gray-400 hover:border-gray-600'}`}
                  >
                    Year {y}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                Next Step <span className="text-lg">→</span>
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-bold text-white mb-2">What are you into?</h2>
              <p className="text-gray-400 mb-10">Select at least 3 interests to personalize your feed.</p>

              <div className="flex flex-wrap gap-2 mb-12 max-h-56 overflow-y-auto pr-2">
                {SUGGESTED_INTERESTS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleInterest(tag)}
                    className={`px-4 py-2 rounded-full border text-xs font-medium transition-all whitespace-nowrap ${selectedInterests.includes(tag) ? 'bg-[#b5c2ff] border-[#b5c2ff] text-black shadow-[0_0_10px_rgba(181,194,255,0.3)]' : 'bg-[#1C212B] border-gray-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <p className="text-gray-500 text-sm mb-6">
                Selected: <span className="text-blue-400 font-semibold">{selectedInterests.length}</span>/3 minimum
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)} 
                  disabled={loading}
                  className="flex-1 bg-transparent border border-gray-800 text-gray-400 font-bold py-4 rounded-2xl hover:bg-gray-800/50 transition-all disabled:opacity-50"
                >
                  Back
                </button>
                <button 
                  onClick={handleFinish}
                  disabled={selectedInterests.length < 3 || loading}
                  className={`flex-[2] font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] ${selectedInterests.length >= 3 && !loading ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-800 text-gray-600 cursor-not-allowed shadow-none'}`}
                >
                  {loading ? 'Setting up your Vybe...' : 'Join the Vybe →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
