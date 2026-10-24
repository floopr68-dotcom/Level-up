import React, { useState } from 'react';
import { Shield, Sparkles, Flame, Zap, ArrowRight, ArrowLeft, Check, Compass, Target, User, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShinobiProfile, FitnessGoal, ActivityLevel, calculatePersonalizedTargets } from '../types/shinobi';
import { CREATOR_SIGNATURE, PRESET_WORKOUT_ROUTINES } from '../data/ninjaDefaults';
import { soundEngine } from '../utils/audio';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: ShinobiProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('Dhruv');
  const [age, setAge] = useState(23);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [village, setVillage] = useState('Hidden Leaf Village (Konohagakure)');

  const [goal, setGoal] = useState<FitnessGoal>('muscle_gain');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

  const [weightKg, setWeightKg] = useState(75);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightCm, setHeightCm] = useState(178);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');

  if (!isOpen) return null;

  // Build draft profile for preview calculation
  const draftProfile: ShinobiProfile = {
    name: name.trim() || 'Shinobi',
    goal,
    height: heightUnit === 'cm' ? heightCm : Math.round(heightCm * 2.54),
    heightUnit,
    weight: weightUnit === 'kg' ? weightKg : Math.round(weightKg * 0.453592),
    weightUnit,
    age,
    gender,
    activityLevel,
    village,
    avatarSeed: 'naruto-sage',
    isOnboarded: true,
    registeredAt: new Date().toISOString(),
  };

  const calculatedTargets = calculatePersonalizedTargets(draftProfile);

  const recommendedRoutines = PRESET_WORKOUT_ROUTINES.filter(
    (r) => r.goalAffinity === goal
  );

  const handleNext = () => {
    soundEngine.playWhoosh();
    if (step < 3) {
      setStep((prev) => (prev + 1) as any);
    }
  };

  const handleBack = () => {
    soundEngine.playClick();
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    }
  };

  const handleFinish = () => {
    soundEngine.playLevelUp();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f97316', '#eab308', '#38bdf8', '#ef4444', '#ffffff'],
    });
    onComplete(draftProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-lg overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#12141f] to-[#0a0b10] border border-orange-500/40 p-5 sm:p-6 shadow-[0_0_50px_rgba(249,115,22,0.25)] text-slate-100 max-h-[95vh] overflow-y-auto">
        {/* Top Header Badge */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-xs font-ninja tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shinobi Registration Protocol</span>
          </div>
          <h1 className="font-ninja text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase chakra-text-glow">
            Level Up: Shinobi Training
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Step {step} of 3: {step === 1 ? 'Ninja Identity' : step === 2 ? 'Physical Attributes & Goal' : 'Your Training Blueprint'}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center items-center space-x-2 mt-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : s < step ? 'w-4 bg-orange-700' : 'w-4 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: IDENTITY & ORIGIN */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="text-xs font-ninja tracking-wider text-slate-300 uppercase block mb-1.5">
                Shinobi Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name (e.g. Dhruv)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-ninja font-bold text-sm focus:outline-none focus:border-orange-500 transition"
                />
                <User className="absolute right-3 top-3 w-4 h-4 text-orange-400/80" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-ninja tracking-wider text-slate-300 uppercase block mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={12}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10) || 20)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-ninja tracking-wider text-slate-300 uppercase block mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-ninja text-xs focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="male">Male Shinobi</option>
                  <option value="female">Kunoichi (Female)</option>
                  <option value="other">Shinobi Operative</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-ninja tracking-wider text-slate-300 uppercase block mb-1.5">
                Affiliation Village
              </label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-ninja text-xs focus:outline-none focus:border-orange-500 transition"
              >
                <option value="Hidden Leaf Village (Konohagakure)">🍃 Hidden Leaf (Konohagakure)</option>
                <option value="Hidden Sand Village (Sunagakure)">🏜️ Hidden Sand (Sunagakure)</option>
                <option value="Hidden Cloud Village (Kumogakure)">⚡ Hidden Cloud (Kumogakure)</option>
                <option value="Hidden Mist Village (Kirigakure)">🌊 Hidden Mist (Kirigakure)</option>
                <option value="Hidden Stone Village (Iwagakure)">🪨 Hidden Stone (Iwagakure)</option>
              </select>
            </div>

            <div className="pt-3">
              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-ninja font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg hover:brightness-110 active:scale-95 transition disabled:opacity-50"
              >
                <span>Continue to Physical Stats</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GOALS & STATS */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Fitness Goal Selection */}
            <div>
              <label className="text-xs font-ninja tracking-wider text-slate-300 uppercase block mb-2">
                Select Your Shinobi Training Goal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Weight Loss */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setGoal('weight_loss');
                  }}
                  className={`p-3 rounded-2xl border text-left transition active:scale-95 ${
                    goal === 'weight_loss'
                      ? 'bg-orange-950/60 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Flame className={`w-5 h-5 mb-1 ${goal === 'weight_loss' ? 'text-orange-400' : 'text-slate-500'}`} />
                  <span className="font-ninja text-xs font-bold block uppercase text-slate-200">
                    Weight Loss
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                    Agility shred & 500 kcal deficit
                  </span>
                </button>

                {/* Muscle Gain / Bulk */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setGoal('muscle_gain');
                  }}
                  className={`p-3 rounded-2xl border text-left transition active:scale-95 ${
                    goal === 'muscle_gain'
                      ? 'bg-orange-950/60 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Target className={`w-5 h-5 mb-1 ${goal === 'muscle_gain' ? 'text-orange-400' : 'text-slate-500'}`} />
                  <span className="font-ninja text-xs font-bold block uppercase text-slate-200">
                    Muscle Gain
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                    Taijutsu bulk & progressive overload
                  </span>
                </button>

                {/* Endurance / Maintenance */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setGoal('endurance_maintenance');
                  }}
                  className={`p-3 rounded-2xl border text-left transition active:scale-95 ${
                    goal === 'endurance_maintenance'
                      ? 'bg-orange-950/60 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Zap className={`w-5 h-5 mb-1 ${goal === 'endurance_maintenance' ? 'text-orange-400' : 'text-slate-500'}`} />
                  <span className="font-ninja text-xs font-bold block uppercase text-slate-200">
                    Endurance
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                    Chakra stamina & athletic power
                  </span>
                </button>
              </div>
            </div>

            {/* Height & Weight Inputs with Unit Toggles */}
            <div className="grid grid-cols-2 gap-3">
              {/* Height */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-ninja tracking-wider text-slate-300 uppercase">
                    Height
                  </label>
                  <button
                    type="button"
                    onClick={() => setHeightUnit((u) => (u === 'cm' ? 'ft' : 'cm'))}
                    className="text-[10px] font-mono text-orange-400 hover:underline"
                  >
                    Toggle {heightUnit === 'cm' ? 'FT' : 'CM'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 170)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-orange-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                    {heightUnit}
                  </span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-ninja tracking-wider text-slate-300 uppercase">
                    Weight
                  </label>
                  <button
                    type="button"
                    onClick={() => setWeightUnit((u) => (u === 'kg' ? 'lbs' : 'kg'))}
                    className="text-[10px] font-mono text-orange-400 hover:underline"
                  >
                    Toggle {weightUnit === 'kg' ? 'LBS' : 'KG'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-orange-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                    {weightUnit}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="text-xs font-ninja tracking-wider text-slate-300 uppercase block mb-1.5">
                Current Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e: any) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-ninja text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="sedentary">Desk Ninja (Sedentary / Light desk work)</option>
                <option value="light">Academy Trainee (1-2 workouts / week)</option>
                <option value="moderate">Active Genin (3-5 vigorous sessions / week)</option>
                <option value="very_active">Elite Anbu Operative (Heavy daily training)</option>
              </select>
            </div>

            {/* Nav buttons */}
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-ninja text-xs uppercase tracking-wider flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-ninja font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition"
              >
                <span>Generate Shinobi Blueprint</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BLUEPRINT & DEVELOPER SIGNATURE */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-950/50 via-slate-900 to-black border border-orange-500/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold block mb-1">
                [Calculated Target Metrics]
              </span>
              <h3 className="font-ninja text-lg font-bold text-white">
                {name}'s Personalized Shinobi Targets
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Calibrated for {goal.replace('_', ' ').toUpperCase()} via Mifflin-St Jeor formula.
              </p>

              {/* Target Calories & Macros */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800">
                <div className="p-2 rounded-xl bg-slate-950/70 text-center">
                  <span className="text-[10px] font-ninja text-slate-400 uppercase block">Daily Cal</span>
                  <span className="font-ninja text-base font-bold text-orange-400">
                    {calculatedTargets.dailyCalories}
                  </span>
                  <span className="text-[9px] text-slate-500 block">kcal</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 text-center">
                  <span className="text-[10px] font-ninja text-slate-400 uppercase block">Protein</span>
                  <span className="font-ninja text-base font-bold text-cyan-400">
                    {calculatedTargets.proteinGrams}g
                  </span>
                  <span className="text-[9px] text-slate-500 block">target</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 text-center">
                  <span className="text-[10px] font-ninja text-slate-400 uppercase block">Carbs</span>
                  <span className="font-ninja text-base font-bold text-amber-400">
                    {calculatedTargets.carbsGrams}g
                  </span>
                  <span className="text-[9px] text-slate-500 block">target</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 text-center">
                  <span className="text-[10px] font-ninja text-slate-400 uppercase block">Fats</span>
                  <span className="font-ninja text-base font-bold text-rose-400">
                    {calculatedTargets.fatsGrams}g
                  </span>
                  <span className="text-[9px] text-slate-500 block">target</span>
                </div>
              </div>

              {/* Target Steps & Distance */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded-xl bg-slate-950/70 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-ninja text-[11px]">Daily Step Goal:</span>
                  <span className="font-ninja font-bold text-orange-300">
                    {calculatedTargets.dailySteps.toLocaleString()} steps
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-ninja text-[11px]">Patrol Distance:</span>
                  <span className="font-ninja font-bold text-cyan-300">
                    ~{calculatedTargets.walkingDistanceKm} km
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Workouts Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-ninja tracking-wider text-orange-400 uppercase font-bold block mb-1.5">
                Recommended Taijutsu Routines for You:
              </span>
              <div className="space-y-1.5">
                {recommendedRoutines.slice(0, 2).map((r) => (
                  <div key={r.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-ninja font-bold text-slate-200">{r.title}</span>
                      <span className="text-[10px] text-slate-400 block font-sans">{r.category} • {r.durationMin} mins</span>
                    </div>
                    <span className="text-[10px] font-mono text-orange-400 font-bold">+{r.expReward} EXP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CRITICAL DEVELOPER SIGNATURE & CREDITS (EXACT REQUIREMENT) */}
            <div className="p-3 rounded-2xl bg-black border border-orange-500/40 text-center shadow-inner">
              <pre className="font-mono text-[10px] text-orange-400/90 whitespace-pre leading-relaxed select-all">
{CREATOR_SIGNATURE}
              </pre>
            </div>

            {/* Finish Button */}
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-ninja text-xs uppercase tracking-wider flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-black font-ninja font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(249,115,22,0.5)] active:scale-95 transition"
              >
                <Check className="w-5 h-5 text-black stroke-[3]" />
                <span>Seal Scroll & Enter Village</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
