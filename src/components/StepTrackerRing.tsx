import React, { useState, useEffect } from 'react';
import { Footprints, Navigation, Flame, Play, Pause, Plus, RefreshCw, Compass, AlertCircle } from 'lucide-react';
import { CalculatedTargets, ShinobiProfile } from '../types/shinobi';
import { soundEngine } from '../utils/audio';

interface StepTrackerRingProps {
  currentSteps: number;
  distanceKm: number;
  caloriesBurned: number;
  targets: CalculatedTargets;
  profile: ShinobiProfile;
  isPedometerActive: boolean;
  isGpsActive: boolean;
  onTogglePedometer: () => void;
  onToggleGps: () => void;
  onAddManualSteps: (steps: number) => void;
  onResetDailySteps?: () => void;
}

export const StepTrackerRing: React.FC<StepTrackerRingProps> = ({
  currentSteps,
  distanceKm,
  caloriesBurned,
  targets,
  profile,
  isPedometerActive,
  isGpsActive,
  onTogglePedometer,
  onToggleGps,
  onAddManualSteps,
  onResetDailySteps,
}) => {
  const [unitMode, setUnitMode] = useState<'km' | 'miles'>('km');
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);

  // Calculate distance based on steps or GPS
  const displayedDistanceKm = distanceKm > 0 ? distanceKm : Number((currentSteps * 0.00075).toFixed(2));
  const displayedDistance = unitMode === 'km' 
    ? displayedDistanceKm 
    : Number((displayedDistanceKm * 0.621371).toFixed(2));

  // Walking calories calculation: approx 0.04 - 0.05 kcal per step based on body weight
  const calculatedCalories = caloriesBurned > 0 
    ? caloriesBurned 
    : Math.round(currentSteps * (profile.weight ? (profile.weight * 0.00057) : 0.042));

  const progressPercent = Math.min(100, Math.round((currentSteps / targets.dailySteps) * 100));

  // Circular progress SVG constants
  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Simulator loop for testing real-time increment on desktop/dev
  useEffect(() => {
    let interval: any = null;
    if (isSimulatingWalk) {
      interval = setInterval(() => {
        onAddManualSteps(2);
      }, 700);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulatingWalk, onAddManualSteps]);

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#13151f] to-[#0c0d14] border border-orange-500/25 p-5 shadow-2xl overflow-hidden">
      {/* Decorative ninja watermark background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-ninja text-sm font-bold tracking-wider text-slate-100 uppercase">
              Shinobi Patrol Tracker
            </h2>
            <p className="text-[11px] text-slate-400">
              Leaf Village Border Distance & Pace
            </p>
          </div>
        </div>

        {/* Distance Unit toggle */}
        <button
          onClick={() => {
            soundEngine.playClick();
            setUnitMode((prev) => (prev === 'km' ? 'miles' : 'km'));
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-orange-400 hover:border-orange-500/50 transition active:scale-95"
          title="Toggle KM / Miles"
        >
          {unitMode.toUpperCase()}
        </button>
      </div>

      {/* Central Progress Ring */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="chakraOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f97316" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1a1c28"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Active Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#chakraOrangeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            filter="url(#glow)"
          />
        </svg>

        {/* Center Content Inside Ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[11px] font-ninja tracking-widest text-orange-400 uppercase font-bold flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5 animate-bounce" />
            Steps Taken
          </span>

          <span className="text-4xl font-ninja font-extrabold text-white tracking-tight chakra-text-glow my-0.5">
            {currentSteps.toLocaleString()}
          </span>

          <span className="text-xs font-mono text-slate-400">
            Goal: {targets.dailySteps.toLocaleString()} steps
          </span>

          <div className="mt-2 px-3 py-0.5 rounded-full bg-orange-950/60 border border-orange-500/40 text-[11px] font-ninja font-bold text-orange-300">
            {progressPercent}% Complete
          </div>
        </div>
      </div>

      {/* Sub Stats Row: Distance & Calories Burned */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Distance Card */}
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-ninja tracking-wider text-slate-400 uppercase">
              Patrol Distance
            </span>
            <div className="text-base font-ninja font-bold text-cyan-300">
              {displayedDistance}{' '}
              <span className="text-[11px] font-normal text-slate-400 font-mono">
                {unitMode}
              </span>
            </div>
          </div>
        </div>

        {/* Calories Burned Card */}
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-ninja tracking-wider text-slate-400 uppercase">
              Burned Energy
            </span>
            <div className="text-base font-ninja font-bold text-rose-300">
              {calculatedCalories}{' '}
              <span className="text-[11px] font-normal text-slate-400 font-mono">
                kcal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Hardware Sensor & GPS Controls */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-ninja tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            Live Sensors & Hardware Tracking
          </span>
          {isPedometerActive && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Pedometer Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Pedometer Sensor Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onTogglePedometer();
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-ninja font-bold tracking-wider transition active:scale-95 ${
              isPedometerActive
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Footprints className="w-4 h-4" />
            <span>{isPedometerActive ? 'Stop Sensor' : 'Start Sensor'}</span>
          </button>

          {/* GPS Tracking Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleGps();
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-ninja font-bold tracking-wider transition active:scale-95 ${
              isGpsActive
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>{isGpsActive ? 'Tracking GPS' : 'GPS Patrol'}</span>
          </button>
        </div>

        {/* Quick Testing & Manual Add Shortcuts */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-mono">Quick Patrol Steps:</span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                soundEngine.playWhoosh();
                onAddManualSteps(250);
              }}
              className="px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-orange-400 hover:border-orange-500 transition active:scale-90"
            >
              +250
            </button>
            <button
              onClick={() => {
                soundEngine.playWhoosh();
                onAddManualSteps(1000);
              }}
              className="px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-orange-400 hover:border-orange-500 transition active:scale-90"
            >
              +1,000
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsSimulatingWalk(!isSimulatingWalk);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-ninja font-bold transition active:scale-90 flex items-center gap-1 ${
                isSimulatingWalk
                  ? 'bg-orange-500 text-black border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Continuously simulate walking steps"
            >
              {isSimulatingWalk ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isSimulatingWalk ? 'Walking...' : 'Walk Sim'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
