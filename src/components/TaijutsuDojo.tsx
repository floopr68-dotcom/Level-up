import React, { useState, useEffect } from 'react';
import { Dumbbell, Flame, CheckCircle, Clock, Plus, Play, Award, RotateCcw, ChevronRight, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkoutRoutine, Exercise, ExerciseSet, FitnessGoal, CompletedWorkout } from '../types/shinobi';
import { PRESET_WORKOUT_ROUTINES } from '../data/ninjaDefaults';
import { soundEngine } from '../utils/audio';

interface TaijutsuDojoProps {
  userGoal: FitnessGoal;
  onFinishWorkout: (completed: CompletedWorkout) => void;
}

export const TaijutsuDojo: React.FC<TaijutsuDojoProps> = ({
  userGoal,
  onFinishWorkout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [exercisesState, setExercisesState] = useState<Exercise[]>([]);

  // Rest Timer State
  const [restTimeRemaining, setRestTimeRemaining] = useState<number>(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);

  // Custom Exercise modal
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customJutsuName, setCustomJutsuName] = useState('');
  const [customCategory, setCustomCategory] = useState<'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Calisthenics' | 'Cardio'>('Chest');

  // Filter routines
  const categories = ['All', 'Push', 'Pull', 'Legs', 'Calisthenics', 'Home Workout', 'Shadow Clone Core'];

  const filteredRoutines = PRESET_WORKOUT_ROUTINES.filter((r) => {
    if (selectedCategory === 'All') return true;
    return r.category === selectedCategory;
  });

  // Start a workout
  const handleStartWorkout = (routine: WorkoutRoutine) => {
    soundEngine.playWhoosh();
    setActiveRoutine(routine);
    // Deep clone exercises so user can check off sets
    setExercisesState(JSON.parse(JSON.stringify(routine.exercises)));
    setWorkoutStartTime(Date.now());
  };

  // Toggle set completion
  const handleToggleSet = (exerciseIndex: number, setIndex: number) => {
    soundEngine.playClick();
    setExercisesState((prev) => {
      const updated = [...prev];
      const targetSet = updated[exerciseIndex].sets[setIndex];
      targetSet.completed = !targetSet.completed;

      // If marked completed, automatically trigger a standard 60s rest timer
      if (targetSet.completed) {
        startRestTimer(60);
      }
      return updated;
    });
  };

  // Update set weight / reps
  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: 'weightKg' | 'reps', val: number) => {
    setExercisesState((prev) => {
      const updated = [...prev];
      updated[exerciseIndex].sets[setIndex][field] = Math.max(0, val);
      return updated;
    });
  };

  // Add a set to an exercise
  const handleAddSet = (exerciseIndex: number) => {
    soundEngine.playClick();
    setExercisesState((prev) => {
      const updated = [...prev];
      const currentSets = updated[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      currentSets.push({
        setNumber: currentSets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 20,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
      });
      return updated;
    });
  };

  // Rest Timer Controller
  const startRestTimer = (seconds: number) => {
    setRestTimeRemaining(seconds);
    setIsRestTimerActive(true);
  };

  useEffect(() => {
    let timer: any = null;
    if (isRestTimerActive && restTimeRemaining > 0) {
      timer = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            soundEngine.playTimerTick(true);
            setIsRestTimerActive(false);
            return 0;
          }
          if (prev <= 4) {
            soundEngine.playTimerTick(false);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRestTimerActive, restTimeRemaining]);

  // Finish Workout
  const handleFinishWorkout = () => {
    if (!activeRoutine) return;

    soundEngine.playLevelUp();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f97316', '#eab308', '#38bdf8', '#ef4444'],
    });

    const durationMin = workoutStartTime ? Math.max(5, Math.round((Date.now() - workoutStartTime) / 60000)) : activeRoutine.durationMin;

    // Calculate total completed volume
    let totalVolume = 0;
    let completedSetsCount = 0;
    exercisesState.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          completedSetsCount++;
          totalVolume += s.weightKg * s.reps;
        }
      });
    });

    const completed: CompletedWorkout = {
      id: 'cw-' + Date.now(),
      routineId: activeRoutine.id,
      routineTitle: activeRoutine.title,
      completedAt: new Date().toISOString(),
      durationMinutes: durationMin,
      expEarned: activeRoutine.expReward + Math.round(completedSetsCount * 5),
      totalVolumeKg: totalVolume,
      exercisesDone: exercisesState.length,
    };

    onFinishWorkout(completed);
    setActiveRoutine(null);
    setWorkoutStartTime(null);
  };

  // Add custom exercise
  const handleCreateCustomExercise = () => {
    if (!customExerciseName.trim()) return;
    soundEngine.playWhoosh();

    const newEx: Exercise = {
      id: 'ex-cust-' + Date.now(),
      name: customExerciseName.trim(),
      shinobiJutsuName: customJutsuName.trim() || `${customExerciseName.trim()} Jutsu`,
      category: customCategory,
      targetMuscles: ['Target Muscle Group'],
      sets: [
        { setNumber: 1, weightKg: 20, reps: 10, completed: false },
        { setNumber: 2, weightKg: 20, reps: 10, completed: false },
        { setNumber: 3, weightKg: 20, reps: 10, completed: false },
      ],
    };

    setExercisesState((prev) => [...prev, newEx]);
    setCustomExerciseName('');
    setCustomJutsuName('');
    setShowAddCustomModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Active Workout Screen */}
      {activeRoutine ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Header of Active Workout */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-orange-950/60 via-slate-900 to-black border border-orange-500/40 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold">
                  [ACTIVE TAIJUTSU SESSION]
                </span>
                <h2 className="font-ninja text-lg font-extrabold text-white tracking-wide">
                  {activeRoutine.title}
                </h2>
                <p className="text-xs text-slate-300 italic mt-0.5">
                  "{activeRoutine.shinobiLore}"
                </p>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveRoutine(null);
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rest Timer Widget */}
            <div className="mt-4 p-3 rounded-2xl bg-black/60 border border-orange-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${isRestTimerActive ? 'text-orange-400 animate-spin' : 'text-slate-400'}`} />
                <div>
                  <span className="text-[10px] font-ninja tracking-wider text-slate-400 uppercase block">
                    Rest Timer
                  </span>
                  <span className={`text-base font-mono font-bold ${restTimeRemaining > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
                    {restTimeRemaining > 0 ? `${restTimeRemaining}s` : 'Ready'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {[30, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      soundEngine.playClick();
                      startRestTimer(sec);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300 hover:text-orange-400 hover:border-orange-500/50 transition active:scale-95"
                  >
                    {sec}s
                  </button>
                ))}
                {isRestTimerActive && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setIsRestTimerActive(false);
                      setRestTimeRemaining(0);
                    }}
                    className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-400 text-xs"
                    title="Stop Timer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Exercise list */}
          <div className="space-y-3">
            {exercisesState.map((ex, exIdx) => (
              <div
                key={ex.id || exIdx}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-ninja text-sm font-bold text-white tracking-wide">
                      {ex.name}
                    </h3>
                    <span className="text-xs font-ninja text-orange-400 font-bold block">
                      {ex.shinobiJutsuName}
                    </span>
                    <div className="flex items-center space-x-1 mt-1">
                      {ex.targetMuscles.map((m, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sets Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-ninja tracking-wider text-slate-400 uppercase px-1">
                    <span className="col-span-2 text-center">Set</span>
                    <span className="col-span-4 text-center">KG / LBS</span>
                    <span className="col-span-3 text-center">Reps</span>
                    <span className="col-span-3 text-center">Done</span>
                  </div>

                  {ex.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition ${
                        set.completed ? 'bg-orange-950/30 border border-orange-500/40' : 'bg-slate-950/60 border border-slate-800'
                      }`}
                    >
                      <span className="col-span-2 text-center text-xs font-mono font-bold text-slate-300">
                        #{set.setNumber}
                      </span>

                      {/* Weight input */}
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={set.weightKg}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                          className="w-full text-center py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Reps input */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)}
                          className="w-full text-center py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Complete checkmark */}
                      <div className="col-span-3 flex justify-center">
                        <button
                          onClick={() => handleToggleSet(exIdx, setIdx)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-90 ${
                            set.completed
                              ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.6)]'
                              : 'bg-slate-800 border border-slate-700 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddSet(exIdx)}
                    className="w-full py-1.5 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-orange-400 hover:border-orange-500/50 text-xs font-ninja tracking-wider flex items-center justify-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Set</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add Custom Exercise to this routine */}
            <button
              onClick={() => setShowAddCustomModal(true)}
              className="w-full py-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-ninja font-bold text-slate-300 hover:border-orange-500 hover:text-orange-400 flex items-center justify-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Jutsu Technique</span>
            </button>
          </div>

          {/* Complete Taijutsu Session Button */}
          <div className="sticky bottom-20 z-20 pt-2">
            <button
              onClick={handleFinishWorkout}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-black font-ninja font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl hover:brightness-110 active:scale-95 transition"
            >
              <Award className="w-5 h-5 text-black" />
              <span>Complete Taijutsu & Claim EXP</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workout Routines Browser */
        <div className="space-y-4">
          {/* Header */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-[#12141c] border border-orange-500/20">
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/40 text-orange-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-ninja text-base font-bold text-slate-100 uppercase tracking-wider">
                  Taijutsu Dojo
                </h2>
                <p className="text-xs text-orange-400/90 font-mono">
                  Custom Splits & Shinobi Conditioning
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Forged for your goal:{' '}
              <span className="font-ninja text-orange-300 font-bold uppercase">
                {userGoal.replace('_', ' ')}
              </span>
              . Earn Taijutsu EXP with every set logged!
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-ninja font-bold whitespace-nowrap transition active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Routines Grid */}
          <div className="space-y-3">
            {filteredRoutines.map((routine) => {
              const isGoalMatch = routine.goalAffinity === userGoal;
              return (
                <div
                  key={routine.id}
                  className="group relative p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0e1017] border border-slate-800 hover:border-orange-500/50 transition-all shadow-lg overflow-hidden"
                >
                  {isGoalMatch && (
                    <div className="absolute top-0 right-0 px-3 py-0.5 rounded-bl-xl bg-orange-500 text-black text-[9px] font-ninja font-bold uppercase tracking-wider shadow">
                      Goal Match
                    </div>
                  )}

                  <div className="flex items-start justify-between pr-14">
                    <div>
                      <span className="text-[10px] font-ninja text-orange-400 tracking-wider uppercase font-bold">
                        {routine.category} • {routine.difficulty}
                      </span>
                      <h3 className="font-ninja text-base font-bold text-white tracking-wide">
                        {routine.title}
                      </h3>
                      <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-2">
                        {routine.shinobiLore}
                      </p>
                    </div>
                  </div>

                  {/* Exercises Preview */}
                  <div className="my-3 space-y-1">
                    {routine.exercises.slice(0, 3).map((ex, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate">• {ex.name}</span>
                        <span className="text-[11px] font-mono text-slate-500">{ex.sets.length} sets</span>
                      </div>
                    ))}
                    {routine.exercises.length > 3 && (
                      <span className="text-[10px] text-orange-400/80 font-mono">
                        +{routine.exercises.length - 3} more jutsu exercises
                      </span>
                    )}
                  </div>

                  {/* Card Footer: Duration, EXP, & Start Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                      <span>⏱️ {routine.durationMin} mins</span>
                      <span className="flex items-center gap-1 text-orange-400 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        +{routine.expReward} EXP
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartWorkout(routine)}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-black font-ninja font-bold text-xs uppercase tracking-wider flex items-center space-x-1 shadow-md active:scale-95 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Commence</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Exercise Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0f111a] border border-orange-500/40 p-5 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowAddCustomModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-ninja text-base font-bold text-white uppercase tracking-wider mb-3">
              Add Custom Jutsu Technique
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-ninja tracking-wider text-slate-400 uppercase block mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Barbell Deadlift, Push-Ups"
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-ninja tracking-wider text-slate-400 uppercase block mb-1">
                  Shinobi Jutsu Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Earth Style Titan Deadlift"
                  value={customJutsuName}
                  onChange={(e) => setCustomJutsuName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-ninja tracking-wider text-slate-400 uppercase block mb-1">
                  Target Muscle Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e: any) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Legs">Legs</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Arms">Arms</option>
                  <option value="Core">Core</option>
                  <option value="Calisthenics">Calisthenics</option>
                  <option value="Cardio">Cardio</option>
                </select>
              </div>

              <button
                onClick={handleCreateCustomExercise}
                className="w-full mt-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-ninja font-extrabold text-xs uppercase tracking-wider transition active:scale-95"
              >
                Inscribe Jutsu to Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
