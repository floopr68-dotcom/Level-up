import React from 'react';
import { Volume2, VolumeX, Flame, Zap, Shield, Sparkles } from 'lucide-react';
import { ShinobiProfile, ShinobiStats, CalculatedTargets } from '../types/shinobi';
import { soundEngine } from '../utils/audio';

interface ShinobiHUDProps {
  profile: ShinobiProfile;
  stats: ShinobiStats;
  targets: CalculatedTargets;
  currentSteps: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRankModal: () => void;
}

export const ShinobiHUD: React.FC<ShinobiHUDProps> = ({
  profile,
  stats,
  targets,
  currentSteps,
  isMuted,
  onToggleMute,
  onOpenRankModal,
}) => {
  // Chakra % based on step progress towards daily goal
  const chakraPercent = Math.min(100, Math.round((currentSteps / targets.dailySteps) * 100));

  // EXP progress to next level
  const expPercent = Math.min(100, Math.round((stats.currentExp / stats.expToNextLevel) * 100));

  const getRankTheme = () => {
    switch (stats.rank) {
      case 'Hokage':
        return {
          color: 'text-amber-400',
          border: 'border-amber-500/50',
          bg: 'bg-amber-950/40',
          aura: 'chakra-glow-gold',
          symbol: '🔥',
        };
      case 'Jonin':
        return {
          color: 'text-rose-400',
          border: 'border-rose-500/50',
          bg: 'bg-rose-950/40',
          aura: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
          symbol: '⚔️',
        };
      case 'Chunin':
        return {
          color: 'text-orange-400',
          border: 'border-orange-500/50',
          bg: 'bg-orange-950/40',
          aura: 'chakra-glow-orange',
          symbol: '🎽',
        };
      case 'Genin':
        return {
          color: 'text-cyan-400',
          border: 'border-cyan-500/50',
          bg: 'bg-cyan-950/40',
          aura: 'chakra-glow-blue',
          symbol: '🔷',
        };
      default:
        return {
          color: 'text-slate-300',
          border: 'border-slate-700',
          bg: 'bg-slate-900/60',
          aura: '',
          symbol: '🎓',
        };
    }
  };

  const rankTheme = getRankTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0b10]/95 backdrop-blur-md border-b border-orange-500/20 px-3 py-2.5 shadow-xl transition-all">
      <div className="max-w-md mx-auto">
        {/* Upper row: Shinobi Identity & Rank Tag */}
        <div className="flex items-center justify-between mb-2">
          {/* User & Rank Badge */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenRankModal();
            }}
            className="flex items-center space-x-2 text-left group transition active:scale-95"
            title="View Shinobi Rank Progression"
          >
            {/* Headband / Village Crest icon */}
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-black border ${rankTheme.border} ${rankTheme.aura} overflow-hidden shadow-inner`}>
              <span className="text-lg select-none">{rankTheme.symbol}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-ninja text-xs font-bold tracking-wider text-slate-100 uppercase">
                  {profile.name || 'Shinobi'}
                </span>
                <span className="text-[10px] text-orange-400/80 font-mono">
                  [Leaf]
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className={`text-[11px] font-ninja font-extrabold uppercase tracking-wide ${rankTheme.color}`}>
                  {stats.rank}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  • LVL {stats.level}
                </span>
              </div>
            </div>
          </button>

          {/* Right Side Controls: Taijutsu EXP & Sound Toggle */}
          <div className="flex items-center space-x-2">
            {/* Taijutsu EXP counter */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-orange-950/30 border border-orange-500/30 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-ninja tracking-wider text-orange-300 uppercase">
                  Taijutsu EXP
                </span>
                <span className="text-xs font-ninja font-bold text-orange-400">
                  {stats.taijutsuExp.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Mute button */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-orange-400 active:scale-90 transition"
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
            </button>
          </div>
        </div>

        {/* Level EXP Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-0.5">
            <span className="flex items-center gap-1 text-slate-300">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              Shinobi EXP
            </span>
            <span>
              {stats.currentExp} / {stats.expToNextLevel} EXP ({expPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>

        {/* Daily Chakra Bar (Step & Physical Activity Energy) */}
        <div>
          <div className="flex justify-between items-center text-[10px] font-ninja mb-0.5">
            <span className="flex items-center gap-1 text-cyan-400 tracking-wide font-bold">
              <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400 animate-pulse" />
              CHAKRA STAMINA (PATROL)
            </span>
            <span className="font-mono text-cyan-300 font-bold">
              {currentSteps.toLocaleString()} / {targets.dailySteps.toLocaleString()} ({chakraPercent}%)
            </span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-cyan-500/30 p-[1px]">
            {/* Flowing animated chakra gradient */}
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-200 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              style={{ width: `${chakraPercent}%` }}
            />
            {/* Shimmer line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-shimmer" />
          </div>
        </div>
      </div>
    </header>
  );
};
