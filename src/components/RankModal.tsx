import React, { useState } from 'react';
import {
  X,
  Award,
  Shield,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  Gift,
  Target,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { ShinobiStats, NinjaRank } from '../types/shinobi';
import { NINJA_RANKS_DATA } from '../data/ninjaDefaults';
import { soundEngine } from '../utils/audio';

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ShinobiStats;
  onTriggerCelebration?: (rank: NinjaRank) => void;
}

export const RankModal: React.FC<RankModalProps> = ({
  isOpen,
  onClose,
  stats,
  onTriggerCelebration,
}) => {
  // Currently inspected rank in the timeline (defaults to user's active rank)
  const [selectedRankName, setSelectedRankName] = useState<NinjaRank>(stats.rank);

  if (!isOpen) return null;

  const currentRankIndex = NINJA_RANKS_DATA.findIndex((r) => r.rank === stats.rank);
  const selectedRankData = NINJA_RANKS_DATA.find((r) => r.rank === selectedRankName) || NINJA_RANKS_DATA[0];
  const selectedRankIndex = NINJA_RANKS_DATA.findIndex((r) => r.rank === selectedRankName);

  const isSelectedUnlocked = stats.level >= selectedRankData.minLevel;
  const isSelectedCurrent = stats.rank === selectedRankData.rank;

  // Percentage progress across entire hierarchy (0 to 100%)
  const totalRanksCount = NINJA_RANKS_DATA.length;
  const hierarchyProgressPercent = Math.min(
    100,
    Math.round(((currentRankIndex + stats.currentExp / stats.expToNextLevel) / (totalRanksCount - 1)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#131524] via-[#0e101a] to-[#08090f] border border-orange-500/40 p-5 sm:p-6 shadow-[0_0_50px_rgba(249,115,22,0.25)] text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/40 text-orange-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-ninja text-base font-bold tracking-wider text-slate-100 uppercase">
              Shinobi Rank Timeline
            </h2>
            <p className="text-xs text-orange-400 font-mono">
              Konohagakure Promotion Roadmap & Milestones
            </p>
          </div>
        </div>

        {/* Current Active Standing Overview */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-950/50 via-slate-900 to-black border border-orange-500/40 mb-4 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] font-ninja tracking-wider text-orange-400 uppercase font-bold block">
              Your Active Rank Standing
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-2xl select-none">{NINJA_RANKS_DATA[currentRankIndex]?.badge}</span>
              <div>
                <span className="font-ninja text-base font-extrabold text-white tracking-wide">
                  {stats.rank}
                </span>
                <span className="text-xs font-mono text-slate-300 ml-1.5">
                  • Level {stats.level}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-ninja tracking-wider text-slate-400 uppercase block">
              Next Promotion In
            </span>
            <span className="font-ninja text-sm font-bold text-orange-300 font-mono">
              {stats.expToNextLevel - stats.currentExp} EXP
            </span>
          </div>
        </div>

        {/* INTERACTIVE VISUAL TIMELINE TRACK */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-ninja tracking-wider text-slate-300 uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Hierarchy Progress Track ({hierarchyProgressPercent}%)
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Tap any rank to inspect
            </span>
          </div>

          {/* Connected Timeline Nodes */}
          <div className="relative flex items-center justify-between px-2 pt-2 pb-1">
            {/* Background connecting bar */}
            <div className="absolute left-6 right-6 top-7 h-1 bg-slate-800 -translate-y-1/2 z-0" />

            {/* Active completed progress bar */}
            <div
              className="absolute left-6 top-7 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `calc(${hierarchyProgressPercent}% * 0.88)`,
              }}
            />

            {NINJA_RANKS_DATA.map((rankInfo, idx) => {
              const isPassed = idx < currentRankIndex;
              const isCurrent = idx === currentRankIndex;
              const isSelected = rankInfo.rank === selectedRankName;

              return (
                <div key={rankInfo.rank} className="relative flex flex-col items-center z-10">
                  {/* Interactive Node Button */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedRankName(rankInfo.rank);
                    }}
                    className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-black scale-110 shadow-lg'
                        : ''
                    } ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-black shadow-[0_0_15px_rgba(249,115,22,0.8)] border-2 border-white'
                        : isPassed
                        ? 'bg-slate-900 border-2 border-emerald-500/80 text-emerald-400'
                        : 'bg-slate-950 border border-slate-700 text-slate-500'
                    }`}
                    title={rankInfo.rank}
                  >
                    <span className="text-xl select-none">{rankInfo.badge}</span>

                    {/* Small status tag */}
                    {isPassed && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-amber-400 text-black font-ninja text-[8px] font-black uppercase shadow animate-pulse">
                        YOU
                      </div>
                    )}
                  </button>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-ninja tracking-wider uppercase mt-2 text-center transition ${
                      isSelected
                        ? 'text-orange-400 font-extrabold'
                        : isCurrent
                        ? 'text-white font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    {rankInfo.rank.split(' ')[0]}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    Lv.{rankInfo.minLevel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SELECTED RANK DETAILS & MILESTONES CARD */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0d0f17] border border-orange-500/30 space-y-4 shadow-xl animate-fadeIn">
          {/* Header of selected rank */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-3xl shadow-inner">
                {selectedRankData.badge}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-ninja text-lg font-bold text-white tracking-wide">
                    {selectedRankData.rank}
                  </h3>
                  {isSelectedCurrent ? (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-black text-[9px] font-ninja font-extrabold uppercase">
                      Current Rank
                    </span>
                  ) : isSelectedUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-ninja font-bold uppercase">
                      Unlocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-ninja uppercase flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {selectedRankData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Unlocked Milestones Checklist */}
          <div>
            <span className="text-[11px] font-ninja tracking-wider text-orange-400 uppercase font-bold flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-orange-400" />
              Required Shinobi Milestones:
            </span>

            <div className="space-y-1.5">
              {selectedRankData.milestones.map((milestone, mIdx) => (
                <div
                  key={mIdx}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2.5 text-xs transition ${
                    isSelectedUnlocked
                      ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isSelectedUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                        {mIdx + 1}
                      </div>
                    )}
                  </div>
                  <span className="font-sans leading-snug">{milestone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unlocked Rewards & Equipment */}
          <div>
            <span className="text-[11px] font-ninja tracking-wider text-yellow-400 uppercase font-bold flex items-center gap-1.5 mb-2">
              <Gift className="w-3.5 h-3.5 text-yellow-400" />
              Unlocked Shinobi Rewards & Gear:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedRankData.rewards.map((reward, rIdx) => (
                <div
                  key={rIdx}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center space-x-2 text-xs"
                >
                  <span className="text-sm">🎁</span>
                  <span className="font-ninja text-slate-300 font-medium truncate">
                    {reward}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Shinobi Perk */}
          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start space-x-2.5">
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-ninja tracking-wider text-cyan-400 uppercase font-bold block">
                Rank Perk & Energy Multiplier:
              </span>
              <p className="text-xs text-cyan-200 font-sans mt-0.5">
                {selectedRankData.perk} • <strong className="font-mono text-white">{selectedRankData.chakraBonus}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Simulate Celebration */}
        {onTriggerCelebration && (
          <div className="mt-4 pt-2">
            <button
              onClick={() => {
                soundEngine.playLevelUp();
                onTriggerCelebration(selectedRankData.rank);
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500 text-black font-ninja font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-black fill-black" />
              <span>Simulate Promotion Ceremony for {selectedRankData.rank} 🍃</span>
            </button>
          </div>
        )}

        {/* Footer Lore */}
        <div className="mt-3 text-center">
          <p className="text-[11px] text-slate-500 font-sans">
            Level up by clocking patrol steps, completing taijutsu splits, and appraising rations.
          </p>
        </div>
      </div>
    </div>
  );
};
