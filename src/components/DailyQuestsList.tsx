import React from 'react';
import { Scroll, Award, CheckCircle, Flame, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShinobiQuest } from '../types/shinobi';
import { soundEngine } from '../utils/audio';

interface DailyQuestsListProps {
  quests: ShinobiQuest[];
  onClaimQuest: (questId: string, expReward: number) => void;
}

export const DailyQuestsList: React.FC<DailyQuestsListProps> = ({
  quests,
  onClaimQuest,
}) => {
  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'S-Rank':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'A-Rank':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'B-Rank':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'C-Rank':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  const handleClaim = (quest: ShinobiQuest) => {
    soundEngine.playLevelUp();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f97316', '#eab308', '#38bdf8'],
    });
    onClaimQuest(quest.id, quest.expReward);
  };

  return (
    <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scroll className="w-4 h-4 text-orange-400" />
          <h3 className="font-ninja text-xs font-bold text-slate-200 uppercase tracking-wider">
            Daily Shinobi Missions
          </h3>
        </div>
        <span className="text-[10px] font-mono text-orange-400 font-bold">
          {quests.filter((q) => q.completed).length} / {quests.length} Completed
        </span>
      </div>

      <div className="space-y-2">
        {quests.map((quest) => {
          const isReadyToClaim = quest.progress >= quest.target && !quest.completed;
          const progressPercent = Math.min(100, Math.round((quest.progress / quest.target) * 100));

          return (
            <div
              key={quest.id}
              className={`p-3 rounded-2xl border transition ${
                quest.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : isReadyToClaim
                  ? 'bg-orange-950/40 border-orange-500/60 shadow-[0_0_12px_rgba(249,115,22,0.25)]'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.2 rounded-md text-[9px] font-ninja font-extrabold border ${getRankBadgeColor(quest.rank)}`}>
                      {quest.rank}
                    </span>
                    <span className="font-ninja text-xs font-bold text-white">
                      {quest.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    {quest.description}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {quest.completed ? (
                    <span className="text-[10px] font-ninja text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Claimed
                    </span>
                  ) : isReadyToClaim ? (
                    <button
                      onClick={() => handleClaim(quest)}
                      className="px-3 py-1 rounded-xl bg-orange-500 text-black font-ninja font-extrabold text-[10px] uppercase tracking-wider shadow active:scale-95 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-black" />
                      Claim +{quest.expReward} EXP
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      +{quest.expReward} EXP
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2.5">
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-0.5">
                  <span>Progress</span>
                  <span>{quest.progress} / {quest.target}</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
