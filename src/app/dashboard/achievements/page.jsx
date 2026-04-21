'use client';

import React, { useState, useEffect } from 'react';
import {
  Star, Award, Zap, Calendar, MessageCircle, Trophy, Target, BookOpen,
  Lock, Edit3, Flame, TrendingUp, ChevronRight
} from 'lucide-react';

// --- MOCK DATA ---
const userProfile = {
  name: "Alex Chen",
  level: "Level 8 Scholar",
  progress: 67,
  points: "2,450",
  rank: 42,
  totalStudents: "1,247"
};

const badges = [
  { id: 1, name: "First Answer", description: "Answered your first question", date: "Earned Jan 15, 2025", icon: MessageCircle, tier: "bronze", earned: true },
  { id: 2, name: "10 Upvotes", description: "Received 10 upvotes on an answer", date: "Earned Feb 02, 2025", icon: Star, tier: "silver", earned: true },
  { id: 3, name: "7-Day Streak", description: "Logged in for 7 consecutive days", date: "Earned Feb 10, 2025", icon: Flame, tier: "silver", earned: true },
  { id: 4, name: "Top Helper", description: "Voted most helpful in a week", date: "Earned Mar 01, 2025", icon: Trophy, tier: "gold", earned: true },
  { id: 5, name: "Fast Responder", description: "Answered a question within 5 mins", date: "Earned Mar 15, 2025", icon: Zap, tier: "gold", earned: true },
  { id: 6, name: "SQL Master", description: "Answered 50 SQL questions", date: "Earned Apr 05, 2025", icon: BookOpen, tier: "platinum", earned: true },
  { id: 7, name: "Network Expert", description: "Contribute to 100 networking threads", date: null, icon: Target, tier: "platinum", earned: false },
  { id: 8, name: "30-Day Streak", description: "Log in for 30 consecutive days", date: null, icon: Calendar, tier: "gold", earned: false },
];

const milestones = [
  { id: 1, name: "50 Upvotes", current: 38, target: 50, reward: "+500 pts", remaining: "12 answers needed" },
  { id: 2, name: "30-Day Streak", current: 12, target: 30, reward: "+1000 pts", remaining: "18 days remaining" },
  { id: 3, name: "Expert Helper", current: 75, target: 100, reward: "+2000 pts", remaining: "25 answers needed" },
];

const leaderboard = [
  { rank: 40, name: "Sarah J.", points: 2600, isCurrentUser: false },
  { rank: 41, name: "Mike T.", points: 2510, isCurrentUser: false },
  { rank: 42, name: "Alex Chen", points: 2450, isCurrentUser: true },
  { rank: 43, name: "Emma W.", points: 2390, isCurrentUser: false },
  { rank: 44, name: "David L.", points: 2280, isCurrentUser: false },
];

const activityFeed = [
  { id: 1, name: "Earned SQL Master Badge", time: "2 hours ago", icon: Award },
  { id: 2, name: "Reached Level 8 Scholar", time: "1 day ago", icon: TrendingUp },
  { id: 3, name: "12-Day Login Streak", time: "2 days ago", icon: Flame },
  { id: 4, name: "Top Helper of the Week", time: "1 week ago", icon: Trophy },
  { id: 5, name: "Answered 100th Question", time: "2 weeks ago", icon: MessageCircle },
];

const tierStyles = {
  bronze: { bg: "from-[#cd7f32] to-[#a0522d]", icon: "text-white" },
  silver: { bg: "from-[#e5e4e2] to-[#b0c4de]", icon: "text-[#334155]" },
  gold: { bg: "from-[#fff099] to-[#ffd700]", icon: "text-[#854d0e]" },
  platinum: { bg: "from-[#f8f9fa] to-[#e5e4e2]", icon: "text-[#1e293b]" }
};

const generateCalendarData = () => {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const dayIndex = 29 - i;
    const d = new Date(today);
    d.setDate(d.getDate() - dayIndex);

    let status = 'inactive';
    let tooltip = 'No activity';

    if (dayIndex < 12) {
      status = 'active';
      tooltip = `${(dayIndex % 3) + 1} answers given`;
      if (dayIndex === 5 || dayIndex === 9) {
        status = 'bonus';
        tooltip = 'Bonus activity day! (+50 pts)';
      }
    } else if (dayIndex > 15 && dayIndex % 2 === 0) {
      status = 'active';
      tooltip = '1 question asked';
    }

    return {
      id: i,
      label: d.getDate(),
      date: d.toISOString().split('T')[0],
      status,
      tooltip
    };
  });
};

const calendarDays = generateCalendarData();

// --- COMPONENTS ---

// Helper tooltip component exclusively using Tailwind
const Tooltip = ({ children, content }) => {
  return (
    <div className="group relative flex justify-center cursor-help">
      {children}
      <div className="pointer-events-none absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-50 shadow-xl">
        {content}
        <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
};

export default function AchievementsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleMilestoneClick = () => {
    alert("Feature coming soon: Viewing milestone details.");
  };

  const handleUserClick = (name) => {
    alert(`Placeholder alert: Viewing full profile for ${name}`);
  };

  const handleDayClick = (dayData) => {
    console.log('Calendar Day Clicked:', dayData);
  };

  // Error state placeholder
  if (hasError) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-12 text-center bg-red-50 rounded-2xl border border-red-100">
        <h2 className="text-2xl font-bold text-red-700 mb-2">Oops! Something went wrong</h2>
        <p className="text-red-500 mb-4">We couldn't load your achievements right now.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Loading skeleton placeholder
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="bg-white rounded-2xl h-40 border border-slate-100 flex items-center px-6 gap-6 shadow-sm">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-200"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-slate-200 rounded w-1/3 md:w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 md:w-1/5"></div>
            <div className="hidden md:flex gap-4">
              <div className="h-10 bg-slate-200 rounded w-32"></div>
              <div className="h-10 bg-slate-200 rounded w-32"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="h-40 bg-slate-200 rounded-xl"></div>)}
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-white rounded-2xl h-72 border border-slate-100 shadow-sm"></div>
            <div className="bg-white rounded-2xl h-64 border border-slate-100 shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

      {/* 1. Profile Header Section */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
            {userProfile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow hover:bg-slate-50 border border-slate-100 text-slate-600 transition-colors">
            <Edit3 size={16} />
          </button>
        </div>

        <div className="flex-1 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{userProfile.name}</h1>
              <div className="text-indigo-600 font-medium">{userProfile.level}</div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-3">
              <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 flex items-center gap-2">
                <Award className="text-amber-500" size={18} />
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Points</div>
                  <div className="font-bold text-slate-800 -mt-1">{userProfile.points}</div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 flex items-center gap-2">
                <Trophy className="text-indigo-500" size={18} />
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Global Rank</div>
                  <div className="font-bold text-slate-800 -mt-1">#{userProfile.rank} <span className="text-slate-400 font-normal text-xs">of {userProfile.totalStudents}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-lg mx-auto md:mx-0 mt-4">
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              <span>Progress to next level</span>
              <span className="text-indigo-600">{userProfile.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${userProfile.progress}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* 2. Achievement Badges Grid */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Badges Earned</h2>
              <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">12/25 earned</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map(badge => {
                const style = tierStyles[badge.tier] || tierStyles.silver;
                const Icon = badge.icon;

                return (
                  <div
                    key={badge.id}
                    className={`bg-white rounded-xl p-5 border shadow-sm transition-all duration-300 relative group
                      ${badge.earned ? 'border-slate-100 hover:border-indigo-200 hover:-translate-y-1 hover:shadow-md cursor-pointer' : 'border-slate-100 bg-slate-50/50 grayscale opacity-70 cursor-not-allowed'}`}
                  >
                    <div className="flex justify-center mb-4 relative">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br transition-transform group-hover:scale-110 duration-300 ${style.bg}`}>
                        <Icon size={24} className={style.icon} strokeWidth={2.5} />
                      </div>
                      {!badge.earned && (
                        <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-1.5 border-2 border-white shadow-sm">
                          <Lock size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-center text-slate-800 mb-1 text-sm">{badge.name}</h3>
                    <p className="text-xs text-center text-slate-500 mb-3 leading-tight min-h-[32px]">{badge.description}</p>

                    <div className="mt-auto">
                      {badge.earned ? (
                        <div className="text-[10px] uppercase font-bold tracking-wider text-center text-emerald-600 bg-emerald-50 py-1 rounded border border-emerald-100">
                          {badge.date}
                        </div>
                      ) : (
                        <div className="text-[10px] uppercase font-bold tracking-wider text-center text-slate-400 bg-slate-100 py-1 rounded border border-slate-200">
                          Not yet earned
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Streak Calendar */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Activity Streak</h2>
                <div className="flex gap-6">
                  <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                    <Flame className="text-orange-500" size={24} strokeWidth={2.5} />
                    <div>
                      <div className="text-[10px] text-orange-600/80 font-bold uppercase tracking-wider">Current</div>
                      <div className="font-bold text-orange-700 -mt-1 text-lg">12 Days</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                    <Trophy className="text-yellow-600" size={24} strokeWidth={2.5} />
                    <div>
                      <div className="text-[10px] text-yellow-700/80 font-bold uppercase tracking-wider">Best</div>
                      <div className="font-bold text-yellow-800 -mt-1 text-lg">24 Days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Last 30 Days</div>
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {calendarDays.map((day) => (
                  <Tooltip key={day.id} content={day.tooltip}>
                    <div
                      onClick={() => handleDayClick(day)}
                      className={`aspect-square w-full rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 hover:scale-110 shadow-sm
                        ${day.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' :
                          day.status === 'bonus' ? 'bg-amber-100 text-amber-700 border-2 border-amber-300 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 to-amber-200' :
                            'bg-slate-50 text-slate-400 border border-slate-200 hover:border-slate-300'}`}
                    >
                      {day.label}
                    </div>
                  </Tooltip>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-4 text-xs text-slate-500 font-semibold uppercase tracking-wide">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-50 border border-slate-200"></div> Inactive</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></div> Active</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div> Bonus</div>
              </div>
            </div>
          </section>

        </div>

        <div className="space-y-8">

          {/* 4. Next Milestones Section */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Next Achievements</h2>
            <div className="space-y-3 flex flex-col">
              {milestones.map(milestone => (
                <div
                  key={milestone.id}
                  onClick={handleMilestoneClick}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-2 cursor-pointer hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{milestone.name}</h3>
                    <span className="text-indigo-700 font-bold text-[10px] uppercase tracking-wider bg-indigo-100 px-2 py-0.5 rounded-full">{milestone.reward}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full"
                      style={{ width: `${(milestone.current / milestone.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{milestone.remaining}</p>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Leaderboard Snippet */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">Your Cohort Rank</h2>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wide">
                View All
              </button>
            </div>

            <div className="space-y-2">
              {leaderboard.map(user => (
                <div
                  key={user.rank}
                  onClick={() => handleUserClick(user.name)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${user.isCurrentUser ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`font-bold w-6 text-center text-sm ${user.isCurrentUser ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {user.rank}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 overflow-hidden shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className={`text-sm font-semibold ${user.isCurrentUser ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {user.name}
                      {user.isCurrentUser && <span className="ml-2 text-[9px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>}
                    </div>
                  </div>
                  <div className="font-bold text-slate-700 text-sm">
                    {user.points} <span className="text-[10px] text-slate-400 font-normal uppercase">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Recent Activity Feed */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h2>
            <div className="relative border-l-2 border-slate-100 ml-3.5 space-y-6">
              {activityFeed.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="relative pl-6">
                    <div className="absolute -left-[15px] top-0.5 w-7 h-7 bg-white rounded-full flex items-center justify-center border-2 border-slate-100 shadow-sm text-indigo-500">
                      <Icon size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm leading-tight">{activity.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wide">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
