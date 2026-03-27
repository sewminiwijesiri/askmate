"use client";

import { AlertCircle, HelpCircle, Thermometer, TrendingUp } from "lucide-react";

export default function TopicConfusionCard({ topic, module, confusionScore, unresolvedQuestions, totalQuestions, difficultyScore }) {
  // Determine color based on confusion score
  const getLevelColor = (score) => {
    if (score > 40) return "text-rose-600 bg-rose-50 border-rose-100";
    if (score > 20) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-emerald-600 bg-emerald-50 border-emerald-100";
  };

  const getHeatColor = (score) => {
    if (score > 40) return "bg-rose-500";
    if (score > 20) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const levelColor = getLevelColor(confusionScore);
  const heatColor = getHeatColor(confusionScore);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${levelColor}`}>
              {confusionScore > 40 ? "High Alert" : confusionScore > 20 ? "Growing" : "Stable"}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {topic === "All Topics" ? "Module Analytics" : module}
            </span>
          </div>
          <h4 className="text-base font-bold text-[#002147] tracking-tight group-hover:text-orange-600 transition-colors">
            {topic === "All Topics" ? module : topic}
          </h4>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${heatColor}`}>
          <Thermometer size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <HelpCircle size={10} /> Questions
          </p>
          <p className="text-lg font-black text-[#002147]">{totalQuestions}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <AlertCircle size={10} /> Unresolved
          </p>
          <p className="text-lg font-black text-rose-600">{unresolvedQuestions}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1.5 h-3 rounded-full ${
                  i <= Math.round(difficultyScore) ? heatColor : "bg-slate-100"
                }`}
              ></div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Difficulty</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
          INDEX <span className="text-slate-900">{confusionScore.toFixed(1)}</span>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 ${heatColor}`}></div>
    </div>
  );
}
