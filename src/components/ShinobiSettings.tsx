import React, { useState } from 'react';
import { User, Settings, Shield, Award, RefreshCcw, Volume2, VolumeX, Save, Target, Sparkles, Heart } from 'lucide-react';
import { ShinobiProfile, FitnessGoal, ActivityLevel, CalculatedTargets } from '../types/shinobi';
import { CREATOR_SIGNATURE } from '../data/ninjaDefaults';
import { soundEngine } from '../utils/audio';

interface ShinobiSettingsProps {
  profile: ShinobiProfile;
  targets: CalculatedTargets;
  isMuted: boolean;
  onToggleMute: () => void;
  onUpdateProfile: (updatedProfile: ShinobiProfile) => void;
  onResetData: () => void;
  onRestartOnboarding: () => void;
}

export const ShinobiSettings: React.FC<ShinobiSettingsProps> = ({
  profile,
  targets,
  isMuted,
  onToggleMute,
  onUpdateProfile,
  onResetData,
  onRestartOnboarding,
}) => {
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal);
  const [weight, setWeight] = useState(profile.weight);
  const [height, setHeight] = useState(profile.height);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [village, setVillage] = useState(profile.village);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playLevelUp();

    const updated: ShinobiProfile = {
      ...profile,
      name: name.trim() || 'Shinobi',
      goal,
      weight,
      height,
      activityLevel,
      village,
    };

    onUpdateProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-black border border-orange-500/25">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/40 text-orange-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-ninja text-base font-bold text-slate-100 uppercase tracking-wider">
              Shinobi Codex & Profile
            </h2>
            <p className="text-xs text-orange-400 font-mono">
              Ninja Registry & Configuration
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-ninja tracking-wider text-slate-300 uppercase font-bold">
            Shinobi Trainee Dossier
          </span>
          {isSaved && (
            <span className="text-xs font-ninja text-emerald-400 font-bold animate-pulse">
              ✓ Codex Updated!
            </span>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="text-[11px] font-ninja tracking-wider text-slate-400 uppercase block mb-1">
            Ninja Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-ninja font-bold focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Goal */}
        <div>
          <label className="text-[11px] font-ninja tracking-wider text-slate-400 uppercase block mb-1">
            Active Training Goal
          </label>
          <select
            value={goal}
            onChange={(e: any) => setGoal(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-ninja focus:outline-none focus:border-orange-500"
          >
            <option value="weight_loss">Weight Loss (Agility Shred / 500 kcal deficit)</option>
            <option value="muscle_gain">Muscle Gain (Taijutsu Bulk / 400 kcal surplus)</option>
            <option value="endurance_maintenance">Endurance / Maintenance (Chakra Stamina)</option>
          </select>
        </div>

        {/* Height and Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-ninja tracking-wider text-slate-400 uppercase block mb-1">
              Height ({profile.heightUnit})
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 170)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-ninja tracking-wider text-slate-400 uppercase block mb-1">
              Weight ({profile.weightUnit})
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 70)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="text-[11px] font-ninja tracking-wider text-slate-400 uppercase block mb-1">
            Activity Level
          </label>
          <select
            value={activityLevel}
            onChange={(e: any) => setActivityLevel(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-ninja text-xs focus:outline-none focus:border-orange-500"
          >
            <option value="sedentary">Desk Ninja (Sedentary)</option>
            <option value="light">Academy Trainee (1-2 days/week)</option>
            <option value="moderate">Active Genin (3-5 days/week)</option>
            <option value="very_active">Elite Anbu Operative (Heavy daily)</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-ninja font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition"
        >
          <Save className="w-4 h-4 text-black" />
          <span>Save & Recalculate Shinobi Targets</span>
        </button>
      </form>

      {/* Audio Sound Settings */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            {isMuted ? <VolumeX className="w-5 h-5 text-slate-500" /> : <Volume2 className="w-5 h-5 text-orange-400" />}
          </div>
          <div>
            <h4 className="font-ninja text-xs font-bold text-white uppercase tracking-wider">
              Ninja Sound Synthesizer
            </h4>
            <p className="text-[11px] text-slate-400">
              Web Audio jutsu, chakra hum, & level up sound effects
            </p>
          </div>
        </div>

        <button
          onClick={onToggleMute}
          className={`px-3 py-1.5 rounded-xl text-xs font-ninja font-bold transition active:scale-95 ${
            !isMuted
              ? 'bg-orange-500 text-black shadow-md'
              : 'bg-slate-800 border border-slate-700 text-slate-400'
          }`}
        >
          {!isMuted ? 'ENABLED' : 'MUTED'}
        </button>
      </div>

      {/* Powered by Cherry Special Feature Badge */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-950/40 via-purple-950/20 to-slate-950 border border-pink-500/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xl shadow-inner">
            🌸
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-ninja text-xs font-extrabold text-pink-300 uppercase tracking-wider">
                Powered by Cherry
              </h4>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-200 font-mono font-bold">
                CORE ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              High-performance chakra calculation & AI vision ration pipeline
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Data Export & Backup */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-ninja tracking-wider text-slate-300 uppercase font-bold">
            Shinobi Scroll Archive (Data Export)
          </span>
          <span className="text-[10px] font-mono text-orange-400 font-bold">
            JSON Backup
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-sans">
          Export your entire training log, taijutsu EXP, and ration appraisals as a backup file.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              soundEngine.playLevelUp();
              const fullData = {
                exportedAt: new Date().toISOString(),
                version: '1.0',
                engine: 'Level Up Shinobi Training System - Powered by Cherry',
                developer: 'Dhruv',
                profile: JSON.parse(localStorage.getItem('shinobi_profile_v1') || '{}'),
                stats: JSON.parse(localStorage.getItem('shinobi_stats_v1') || '{}'),
                steps: localStorage.getItem('shinobi_steps_v1') || '0',
                distanceKm: localStorage.getItem('shinobi_distance_v1') || '0',
                waterMl: localStorage.getItem('shinobi_water_v1') || '0',
                meals: JSON.parse(localStorage.getItem('shinobi_meals_v1') || '[]'),
                workouts: JSON.parse(localStorage.getItem('shinobi_workouts_v1') || '[]'),
              };

              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullData, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `shinobi-scroll-${profile.name.toLowerCase() || 'trainee'}-${new Date().toISOString().slice(0, 10)}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-ninja font-extrabold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition"
          >
            <span>📜 Export Scroll</span>
          </button>

          <label className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-orange-500 text-slate-200 text-xs font-ninja font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer text-center">
            <span>📥 Import Scroll</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const parsed = JSON.parse(event.target?.result as string);
                    if (parsed.profile) localStorage.setItem('shinobi_profile_v1', JSON.stringify(parsed.profile));
                    if (parsed.stats) localStorage.setItem('shinobi_stats_v1', JSON.stringify(parsed.stats));
                    if (parsed.steps) localStorage.setItem('shinobi_steps_v1', parsed.steps.toString());
                    if (parsed.distanceKm) localStorage.setItem('shinobi_distance_v1', parsed.distanceKm.toString());
                    if (parsed.waterMl) localStorage.setItem('shinobi_water_v1', parsed.waterMl.toString());
                    if (parsed.meals) localStorage.setItem('shinobi_meals_v1', JSON.stringify(parsed.meals));
                    if (parsed.workouts) localStorage.setItem('shinobi_workouts_v1', JSON.stringify(parsed.workouts));
                    soundEngine.playLevelUp();
                    alert('Shinobi training scroll imported successfully! Reloading...');
                    window.location.reload();
                  } catch (err: any) {
                    alert('Invalid scroll format: ' + err.message);
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
        </div>
      </div>

      {/* Reset & Onboarding options */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
        <span className="text-xs font-ninja tracking-wider text-slate-400 uppercase font-bold block mb-1">
          System Administration
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundEngine.playWhoosh();
              onRestartOnboarding();
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white text-xs font-ninja font-bold tracking-wider transition active:scale-95 text-center"
          >
            Re-run Registration
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all steps and logged workouts?')) {
                onResetData();
              }
            }}
            className="py-2.5 px-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 text-xs font-ninja font-bold tracking-wider transition active:scale-95 text-center"
          >
            Reset All Logs
          </button>
        </div>
      </div>

      {/* DEVELOPER SIGNATURE & CREDITS (EXACT REQUIREMENT) */}
      <div className="p-4 rounded-3xl bg-black border border-orange-500/40 text-center shadow-inner mt-4">
        <pre className="font-mono text-[11px] text-orange-400/90 whitespace-pre leading-relaxed select-all">
{CREATOR_SIGNATURE}
        </pre>
      </div>
    </div>
  );
};
