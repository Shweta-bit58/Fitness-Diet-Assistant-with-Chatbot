import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000";

function Home() {
  const navigate = useNavigate();
  const [fitnessData, setFitnessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Champion";

  useEffect(() => {
    fetchFitnessDetails();
    // eslint-disable-next-line
  }, []);

  const fetchFitnessDetails = async () => {
    try {
      const res = await fetch(`${API}/api/fitness/details/${userId}`);
      if (res.status === 200) {
        const data = await res.json();
        setFitnessData(data);
      } else {
        setFitnessData(null);
      }
    } catch (err) {
      console.error("Error fetching fitness details:", err);
      setFitnessData(null);
    }
    setLoading(false);
  };

  const getBMI = () => {
    if (!fitnessData) return null;
    return (fitnessData.weight / ((fitnessData.height / 100) ** 2)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20' };
    return { label: 'Obese', color: 'text-rose-400', bg: 'from-rose-500/20 to-rose-600/5', border: 'border-rose-500/20' };
  };

  const getCalorieEstimate = () => {
    if (!fitnessData) return null;
    // Harris-Benedict equation (rough estimate)
    const bmr = 10 * fitnessData.weight + 6.25 * fitnessData.height - 5 * fitnessData.age + 5;
    const goalMultipliers = {
      'weight loss': 0.8,
      'muscle gain': 1.2,
      'endurance': 1.15,
      'flexibility': 1.0,
      'general fitness': 1.1,
    };
    return Math.round(bmr * (goalMultipliers[fitnessData.goal] || 1.0) * 1.55);
  };

  const getWaterIntake = () => {
    if (!fitnessData) return null;
    return (fitnessData.weight * 0.033).toFixed(1);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getGoalIcon = (goal) => {
    const icons = {
      'weight loss': '🔥',
      'muscle gain': '💪',
      'endurance': '🏃',
      'flexibility': '🧘',
      'general fitness': '⚡',
    };
    return icons[goal] || '🎯';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mesh-bg" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          <p className="text-slate-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="mesh-bg" />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Greeting Header */}
        <div className="mb-10 animate-slide-up">
          <p className="text-slate-400 text-sm font-medium mb-1">{getGreeting()} 👋</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Welcome back, <span className="text-gradient">{fitnessData?.name || userName}</span>
          </h1>
          <p className="text-slate-400 mt-2">Here's your fitness overview for today</p>
        </div>

        {fitnessData ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up stagger-2">
              {/* BMI Card */}
              <div className={`stat-card glass-card rounded-2xl p-5 border ${getBMICategory(getBMI()).border}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">BMI</p>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{getBMI()}</p>
                <p className={`text-xs font-semibold mt-1 ${getBMICategory(getBMI()).color}`}>
                  {getBMICategory(getBMI()).label}
                </p>
              </div>

              {/* Weight Card */}
              <div className="stat-card glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Weight</p>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{fitnessData.weight}<span className="text-lg text-slate-400 ml-1">kg</span></p>
                <p className="text-xs text-slate-500 mt-1">Current weight</p>
              </div>

              {/* Calories Card */}
              <div className="stat-card glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Daily Cal.</p>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{getCalorieEstimate()}<span className="text-lg text-slate-400 ml-1">kcal</span></p>
                <p className="text-xs text-slate-500 mt-1">Estimated target</p>
              </div>

              {/* Water Card */}
              <div className="stat-card glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Water</p>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{getWaterIntake()}<span className="text-lg text-slate-400 ml-1">L</span></p>
                <p className="text-xs text-slate-500 mt-1">Daily intake</p>
              </div>
            </div>

            {/* Profile & Quick Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Profile Summary */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 animate-slide-up stagger-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Fitness Profile</h2>
                  <button
                    onClick={() => navigate("/fitness")}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
                  >
                    Edit Profile
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-light rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Name</p>
                    <p className="text-sm font-semibold text-white truncate">{fitnessData.name}</p>
                  </div>
                  <div className="glass-light rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Age</p>
                    <p className="text-sm font-semibold text-white">{fitnessData.age} years</p>
                  </div>
                  <div className="glass-light rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Height</p>
                    <p className="text-sm font-semibold text-white">{fitnessData.height} cm</p>
                  </div>
                  <div className="glass-light rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Weight</p>
                    <p className="text-sm font-semibold text-white">{fitnessData.weight} kg</p>
                  </div>
                </div>

                {/* Goals */}
                <div className="mt-5 glass-light rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-3">Your Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {fitnessData.goal.split(',').map((g, i) => {
                      const trimmed = g.trim();
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 capitalize"
                        >
                          {getGoalIcon(trimmed)} {trimmed}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card rounded-2xl p-6 animate-slide-up stagger-4">
                <h2 className="text-lg font-bold text-white mb-5">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    id="action-chat"
                    onClick={() => navigate("/chat")}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">AI Fitness Coach</p>
                      <p className="text-xs text-slate-400">Get personalized advice</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-500 ml-auto group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    id="action-profile"
                    onClick={() => navigate("/fitness")}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">Update Profile</p>
                      <p className="text-xs text-slate-400">Edit your fitness details</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-500 ml-auto group-hover:text-violet-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Motivational Tips */}
            <div className="glass-card rounded-2xl p-6 animate-slide-up stagger-5">
              <h2 className="text-lg font-bold text-white mb-4">💡 Today's Tips</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-light rounded-xl p-4">
                  <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">Nutrition</p>
                  <p className="text-sm text-slate-300">Eat protein within 30 min of working out for maximum muscle recovery.</p>
                </div>
                <div className="glass-light rounded-xl p-4">
                  <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">Hydration</p>
                  <p className="text-sm text-slate-300">Drink {getWaterIntake()}L of water today. Start with a glass right when you wake up!</p>
                </div>
                <div className="glass-light rounded-xl p-4">
                  <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">Recovery</p>
                  <p className="text-sm text-slate-300">Sleep 7-9 hours tonight. Growth hormone is released during deep sleep.</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Profile State */
          <div className="max-w-lg mx-auto text-center animate-slide-up stagger-2">
            <div className="glass-card rounded-2xl p-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 mb-6">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Complete Your Profile</h2>
              <p className="text-slate-400 mb-8">
                Add your fitness details to unlock personalized recommendations, AI coaching, and track your progress.
              </p>
              <button
                onClick={() => navigate("/fitness")}
                className="btn-primary text-white px-8 py-3.5 rounded-xl font-semibold text-sm"
              >
                Set Up Profile Now
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-12">
          Keep pushing, your best is yet to come! 🎯
        </p>
      </div>
    </div>
  );
}

export default Home;