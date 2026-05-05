import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000";

function Fitness() {
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [customGoal, setCustomGoal] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  const userId = localStorage.getItem("userId");

  const goals = [
    { value: "weight loss", label: "Weight Loss", icon: "🔥", desc: "Burn fat & get lean" },
    { value: "muscle gain", label: "Muscle Gain", icon: "💪", desc: "Build strength & size" },
    { value: "endurance", label: "Endurance", icon: "🏃", desc: "Boost stamina & cardio" },
    { value: "flexibility", label: "Flexibility", icon: "🧘", desc: "Improve mobility" },
    { value: "general fitness", label: "General Fitness", icon: "⚡", desc: "Stay active & healthy" },
  ];

  useEffect(() => {
    fetchExistingDetails();
    // eslint-disable-next-line
  }, []);

  const fetchExistingDetails = async () => {
    try {
      const res = await fetch(`${API}/api/fitness/details/${userId}`);
      if (res.status === 200) {
        const data = await res.json();
        setName(data.name || "");
        setAge(String(data.age || ""));
        setHeight(String(data.height || ""));
        setWeight(String(data.weight || ""));

        // Parse goals - stored as comma-separated string
        if (data.goal) {
          const savedGoals = data.goal.split(",").map((g) => g.trim());
          const predefined = goals.map((g) => g.value);
          const predefinedSelected = savedGoals.filter((g) => predefined.includes(g));
          const customOnes = savedGoals.filter((g) => !predefined.includes(g));

          setSelectedGoals(predefinedSelected);
          if (customOnes.length > 0) {
            setCustomGoal(customOnes.join(", "));
            setShowCustomInput(true);
          }
        }
        setHasExisting(true);
      }
    } catch (err) {
      console.error("Error checking details:", err);
    }
    setLoading(false);
  };

  const toggleGoal = (goalValue) => {
    setSelectedGoals((prev) =>
      prev.includes(goalValue)
        ? prev.filter((g) => g !== goalValue)
        : [...prev, goalValue]
    );
  };

  const getAllGoals = () => {
    const all = [...selectedGoals];
    if (customGoal.trim()) {
      all.push(customGoal.trim());
    }
    return all.join(", ");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !age || !height || !weight) {
      toast.warning("Please fill all fields");
      return;
    }

    const combinedGoals = getAllGoals();
    if (!combinedGoals) {
      toast.warning("Please select at least one goal");
      return;
    }

    if (isNaN(age) || age < 1 || age > 150) {
      toast.warning("Please enter a valid age (1-150)");
      return;
    }
    if (isNaN(height) || height < 50 || height > 300) {
      toast.warning("Please enter a valid height (50-300 cm)");
      return;
    }
    if (isNaN(weight) || weight < 20 || weight > 500) {
      toast.warning("Please enter a valid weight (20-500 kg)");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API}/api/fitness/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name,
          age: Number(age),
          height: Number(height),
          weight: Number(weight),
          goal: combinedGoals,
        }),
      });

      if (res.status === 200) {
        toast.success(hasExisting ? "Profile updated! 🎯" : "Profile created! 🎉");
        setTimeout(() => navigate("/home"), 800);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save details");
      }
    } catch (err) {
      console.error("Error saving fitness details:", err);
      toast.error("Cannot connect to server");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mesh-bg" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          <p className="text-slate-400 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="mesh-bg" />
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-xl shadow-emerald-500/20 mb-5">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            {hasExisting ? "Update Your Profile" : "Create Your Profile"}
          </h1>
          <p className="text-slate-400">
            {hasExisting ? "Keep your details up to date for better recommendations" : "Tell us about yourself for personalized fitness advice"}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-8 animate-slide-up stagger-2">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Name & Age Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  id="fitness-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl input-dark text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Age (years)</label>
                <input
                  id="fitness-age"
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl input-dark text-sm"
                />
              </div>
            </div>

            {/* Height & Weight Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Height (cm)</label>
                <input
                  id="fitness-height"
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl input-dark text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Weight (kg)</label>
                <input
                  id="fitness-weight"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl input-dark text-sm"
                />
              </div>
            </div>

            {/* BMI Preview */}
            {height && weight && (
              <div className="glass-light rounded-xl p-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">BMI Preview</p>
                    <p className="text-2xl font-bold text-gradient mt-1">
                      {(weight / ((height / 100) * (height / 100))).toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      (weight / ((height / 100) * (height / 100))) < 18.5 ? 'text-amber-400' :
                      (weight / ((height / 100) * (height / 100))) < 25 ? 'text-emerald-400' :
                      (weight / ((height / 100) * (height / 100))) < 30 ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {(weight / ((height / 100) * (height / 100))) < 18.5 ? 'Underweight' :
                       (weight / ((height / 100) * (height / 100))) < 25 ? 'Normal' :
                       (weight / ((height / 100) * (height / 100))) < 30 ? 'Overweight' :
                       'Obese'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Body Mass Index</p>
                  </div>
                </div>
              </div>
            )}

            {/* Fitness Goals - Multi Select */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-300">
                  Fitness Goals <span className="text-slate-500 font-normal">(select multiple)</span>
                </label>
                {selectedGoals.length > 0 && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    {selectedGoals.length} selected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((g) => {
                  const isSelected = selectedGoals.includes(g.value);
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => toggleGoal(g.value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-left group ${
                        isSelected
                          ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                      }`}
                    >
                      <span className="text-2xl">{g.icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {g.label}
                        </p>
                        <p className="text-xs text-slate-500">{g.desc}</p>
                      </div>
                      {/* Checkbox indicator */}
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-600 group-hover:border-slate-400'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Goal */}
            <div>
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition group"
                >
                  <div className="w-6 h-6 rounded-lg border-2 border-dashed border-violet-500/40 flex items-center justify-center group-hover:border-violet-400/60 transition">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  Add your own custom goal
                </button>
              ) : (
                <div className="animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Custom Goal 🎯
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomGoal("");
                      }}
                      className="text-xs text-slate-500 hover:text-rose-400 transition"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    id="fitness-custom-goal"
                    type="text"
                    placeholder="e.g., Run a marathon, Do 50 pushups, Lose 10kg in 3 months..."
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl input-dark text-sm"
                    maxLength={100}
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Describe your personal fitness target
                  </p>
                </div>
              )}
            </div>

            {/* Selected Goals Summary */}
            {(selectedGoals.length > 0 || customGoal.trim()) && (
              <div className="glass-light rounded-xl p-4 animate-fade-in">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Your Goals Summary</p>
                <div className="flex flex-wrap gap-2">
                  {selectedGoals.map((g) => {
                    const goalInfo = goals.find((gi) => gi.value === g);
                    return (
                      <span
                        key={g}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      >
                        {goalInfo?.icon} {goalInfo?.label || g}
                      </span>
                    );
                  })}
                  {customGoal.trim() && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-500/15 text-violet-400 border border-violet-500/20">
                      🎯 {customGoal.trim()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              id="fitness-save"
              type="submit"
              disabled={isSaving}
              className="w-full btn-primary text-white py-4 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                hasExisting ? "Update Profile" : "Save Profile"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Fitness;