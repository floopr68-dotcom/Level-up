import React, { useEffect } from 'react';
import { Award, Sparkles, Flame, Shield, ArrowRight, Zap, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NinjaRank } from '../types/shinobi';
import { NINJA_RANKS_DATA } from '../data/ninjaDefaults';
import { soundEngine } from '../utils/audio';

interface RankElevationCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  newRank: NinjaRank;
  oldRank?: NinjaRank;
  shinobiName: string;
}

export const RankElevationCelebration: React.FC<RankElevationCelebrationProps> = ({
  isOpen,
  onClose,
  newRank,
  oldRank = 'Academy Student',
  shinobiName,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    soundEngine.playLevelUp();

    // Multistage canvas-confetti shower in vibrant orange, gold, and leaf green
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const colors = ['#f97316', '#fb923c', '#eab308', '#facc15', '#22c55e', '#84cc16', '#ffffff'];

    // Initial center burst
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
      colors,
      disableForReducedMotion: false,
    });

    // Sustained side cannons & leaf shower
    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);

      // Left blast
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });

      // Right blast
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      // Top floating leaves
      confetti({
        particleCount: 15,
        angle: 270,
        spread: 120,
        origin: { x: 0.5, y: -0.1 },
        colors,
        gravity: 0.8,
        scalar: 1.2,
      });
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const rankData = NINJA_RANKS_DATA.find((r) => r.rank === newRank) || NINJA_RANKS_DATA[1];

  const getHokageProclamation = (rank: NinjaRank) => {
    switch (rank) {
      case 'Genin':
        return 'By order of the Hidden Leaf Council, you have officially graduated! Fasten your Konoha headband and protect your comrades with your life!';
      case 'Chunin':
        return 'You have proven the tactical wisdom, stamina, and fortitude of a true Chunin leader. Wear your flak jacket with fierce pride!';
      case 'Jonin':
        return 'Extraordinary mastery! Your taijutsu conditioning and will of fire place you among Konoha’s elite Jonin. The village places its deepest trust in your blade!';
      case 'Hokage':
        return 'The highest summit of the shinobi world! You stand as the ultimate shield of Konoha. Your name will be immortalized forever on the Hokage Rock!';
      default:
        return 'Your chakra stirs and your spirit grows stronger. Keep pushing your limits every single day!';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto animate-fadeIn">
      {/* Background glowing aura rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-orange-500/20 via-yellow-500/15 to-transparent blur-3xl animate-pulse" />
        <div className="w-[300px] h-[300px] rounded-full bg-orange-600/25 blur-2xl animate-spin" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#181a29] via-[#10121d] to-[#0a0b12] border-2 border-orange-500/60 p-6 sm:p-7 shadow-[0_0_60px_rgba(249,115,22,0.45)] text-slate-100 text-center max-h-[92vh] overflow-y-auto">
        {/* Top Header Proclamation Ribbon */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/30 via-yellow-500/30 to-orange-500/30 border border-orange-400 text-orange-300 text-xs font-ninja tracking-widest uppercase mb-4 shadow-lg animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span>Konohagakure Promotion Proclamation</span>
          <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>

        {/* Big Animated Rank Badge Icon with glowing sunburst */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-yellow-300 p-1 chakra-glow-gold animate-pulse shadow-2xl">
            <div className="w-full h-full rounded-full bg-[#0d0f17] flex flex-col items-center justify-center border-2 border-yellow-400/40">
              <span className="text-5xl select-none filter drop-shadow-md">
                {rankData.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Transition: Old Rank ➔ New Rank */}
        <div className="flex items-center justify-center space-x-2 my-2 text-xs font-ninja uppercase tracking-wider text-slate-400">
          <span className="line-through opacity-70">{oldRank}</span>
          <ArrowRight className="w-4 h-4 text-orange-400" />
          <span className="text-orange-400 font-extrabold text-sm">
            PROMOTED
          </span>
        </div>

        {/* Elevated Title */}
        <h1 className="font-ninja text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-amber-200 tracking-wide uppercase chakra-text-glow my-1">
          {newRank}
        </h1>

        <p className="font-ninja text-sm font-bold text-slate-200 uppercase tracking-wider">
          Awarded to Trainee <span className="text-orange-400">{shinobiName}</span>
        </p>

        {/* Lord Hokage Decree Box */}
        <div className="my-5 p-4 rounded-2xl bg-black/60 border border-orange-500/40 text-left shadow-inner">
          <div className="flex items-center space-x-2 mb-1.5 text-xs font-ninja uppercase text-yellow-400 font-bold">
            <Flame className="w-3.5 h-3.5 fill-yellow-400" />
            <span>Decree of the Will of Fire:</span>
          </div>
          <p className="text-xs text-slate-300 italic font-sans leading-relaxed">
            "{getHokageProclamation(newRank)}"
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-orange-300">
            <span>Special Shinobi Perk:</span>
            <span className="font-bold text-white">Chakra Capacity Max +25%</span>
          </div>
        </div>

        {/* Powered by Cherry Ribbon */}
        <div className="flex items-center justify-center space-x-1.5 text-xs text-pink-300/80 font-ninja mb-4">
          <span>🌸</span>
          <span>Shinobi Engine Promotion • Powered by Cherry</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundEngine.playWhoosh();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-black font-ninja font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          <Check className="w-5 h-5 text-black stroke-[3]" />
          <span>Accept Ninja Rank & Seal Scroll</span>
        </button>
      </div>
    </div>
  );
};
