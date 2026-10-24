import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Footprints, Dumbbell, Utensils, Settings, Camera, Award, Shield, Flame, Zap, Plus, RefreshCw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  ShinobiProfile,
  ShinobiStats,
  CalculatedTargets,
  ShinobiMeal,
  CompletedWorkout,
  ShinobiQuest,
  NinjaRank,
  calculatePersonalizedTargets,
  getRankFromExp,
} from './types/shinobi';

import {
  DEFAULT_SHINOBI_PROFILE,
  INITIAL_DAILY_QUESTS,
  CREATOR_SIGNATURE,
} from './data/ninjaDefaults';

import { soundEngine } from './utils/audio';
import { PedometerSensorManager, GpsActivityTracker } from './utils/sensors';

import { ShinobiHUD } from './components/ShinobiHUD';
import { StepTrackerRing } from './components/StepTrackerRing';
import { RationScannerModal } from './components/RationScannerModal';
import { TaijutsuDojo } from './components/TaijutsuDojo';
import { RationDiary } from './components/RationDiary';
import { ShinobiSettings } from './components/ShinobiSettings';
import { RankModal } from './components/RankModal';
import { DailyQuestsList } from './components/DailyQuestsList';
import { OnboardingModal } from './components/OnboardingModal';
import { RankElevationCelebration } from './components/RankElevationCelebration';
import { WeeklyActivityChart } from './components/WeeklyActivityChart';

const STORAGE_KEYS = {
  PROFILE: 'shinobi_profile_v1',
  STATS: 'shinobi_stats_v1',
  STEPS: 'shinobi_steps_v1',
  DISTANCE: 'shinobi_distance_v1',
  WATER: 'shinobi_water_v1',
  MEALS: 'shinobi_meals_v1',
  WORKOUTS: 'shinobi_workouts_v1',
  QUESTS: 'shinobi_quests_v1',
  MUTED: 'shinobi_muted_v1',
};

export default function App() {
  // Load initial profile
  const [profile, setProfile] = useState<ShinobiProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SHINOBI_PROFILE;
  });

  // Calculate targets based on profile
  const targets: CalculatedTargets = useMemo(() => {
    return calculatePersonalizedTargets(profile);
  }, [profile]);

  // Overall EXP and Stats
  const [totalExp, setTotalExp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.totalExp || 0;
      }
    } catch {}
    return 150; // starting bonus exp
  });

  const [taijutsuExp, setTaijutsuExp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.taijutsuExp || 0;
      }
    } catch {}
    return 80;
  });

  // Compute rank and level from total EXP
  const stats: ShinobiStats = useMemo(() => {
    const rankData = getRankFromExp(totalExp);
    return {
      rank: rankData.rank,
      level: rankData.level,
      currentExp: rankData.currentExp,
      expToNextLevel: rankData.expToNextLevel,
      taijutsuExp,
      streakDays: 3,
      lastActiveDate: new Date().toISOString(),
    };
  }, [totalExp, taijutsuExp]);

  // Daily Steps & Distance
  const [currentSteps, setCurrentSteps] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STEPS);
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 3420;
  });

  const [distanceKm, setDistanceKm] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISTANCE);
      if (saved) return parseFloat(saved);
    } catch {}
    return 2.56;
  });

  // Water & Meals
  const [waterMl, setWaterMl] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER);
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 1250;
  });

  const [meals, setMeals] = useState<ShinobiMeal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEALS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'meal-init-1',
        dishName: 'Chasu Pork Ramen with Egg',
        shinobiName: 'Ichiraku Hot-Blooded Special Ramen',
        portionSize: '1 large bowl (~520g)',
        calories: 680,
        protein: 34,
        carbs: 76,
        fats: 24,
        chakraType: 'Yang Stamina & Muscle Rebuild',
        chakraBoostPoints: 75,
        shinobiAppraisal: 'An iconic meal fit for an aspiring Hokage! Restores stamina rapidly after morning patrol.',
        healthRating: 'A-Rank',
        timestamp: '08:30 AM',
      },
    ];
  });

  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Daily Quests
  const [quests, setQuests] = useState<ShinobiQuest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DAILY_QUESTS;
  });

  // Sound Engine Mute
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.MUTED) === 'true';
    } catch {}
    return false;
  });

  useEffect(() => {
    soundEngine.isMuted = isMuted;
  }, [isMuted]);

  // Tab & Modal Navigation
  const [activeTab, setActiveTab] = useState<'patrol' | 'dojo' | 'rations' | 'codex'>('patrol');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!profile.isOnboarded);

  // Full-screen Celebratory Rank Elevation State
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    newRank: NinjaRank;
    oldRank: NinjaRank;
  }>({
    isOpen: false,
    newRank: 'Genin',
    oldRank: 'Academy Student',
  });

  const prevRankRef = useRef<NinjaRank>(stats.rank);

  // Auto trigger celebratory animation whenever user achieves enough EXP to rank up
  useEffect(() => {
    if (prevRankRef.current !== stats.rank) {
      setCelebrationData({
        isOpen: true,
        newRank: stats.rank,
        oldRank: prevRankRef.current,
      });
      prevRankRef.current = stats.rank;
    }
  }, [stats.rank]);

  // Hardware Sensor States
  const [isPedometerActive, setIsPedometerActive] = useState(false);
  const [isGpsActive, setIsGpsActive] = useState(false);

  const pedometerRef = useRef<PedometerSensorManager | null>(null);
  const gpsRef = useRef<GpsActivityTracker | null>(null);

  // Initialize sensors
  useEffect(() => {
    pedometerRef.current = new PedometerSensorManager(currentSteps);
    gpsRef.current = new GpsActivityTracker();

    return () => {
      pedometerRef.current?.stopListening();
      gpsRef.current?.stopTracking();
    };
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify({ totalExp, taijutsuExp }));
  }, [totalExp, taijutsuExp]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STEPS, currentSteps.toString());
  }, [currentSteps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISTANCE, distanceKm.toString());
  }, [distanceKm]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATER, waterMl.toString());
  }, [waterMl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(completedWorkouts));
  }, [completedWorkouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MUTED, isMuted.toString());
  }, [isMuted]);

  // Update Quest Progress automatically
  useEffect(() => {
    setQuests((prev) =>
      prev.map((q) => {
        let newProgress = q.progress;
        if (q.type === 'steps') newProgress = currentSteps;
        if (q.type === 'rations') newProgress = meals.length;
        if (q.type === 'water') newProgress = waterMl;
        if (q.type === 'workout') newProgress = completedWorkouts.length;
        return {
          ...q,
          progress: newProgress,
        };
      })
    );
  }, [currentSteps, meals.length, waterMl, completedWorkouts.length]);

  // Pedometer sensor handler
  const handleTogglePedometer = async () => {
    if (!pedometerRef.current) return;

    if (isPedometerActive) {
      pedometerRef.current.stopListening();
      setIsPedometerActive(false);
    } else {
      pedometerRef.current.setStepCount(currentSteps);
      const res = await pedometerRef.current.startListening({
        onStep: (newCount, added) => {
          setCurrentSteps(newCount);
          setDistanceKm((prev) => Number((prev + added * 0.00075).toFixed(2)));
          // Gain 1 EXP for every 10 steps
          if (newCount % 10 === 0) {
            setTotalExp((prev) => prev + 1);
          }
        },
        onError: (err) => {
          alert('Pedometer sensor notice: ' + err);
          setIsPedometerActive(false);
        },
      });

      if (res.permissionGranted) {
        setIsPedometerActive(true);
      }
    }
  };

  // GPS handler
  const handleToggleGps = () => {
    if (!gpsRef.current) return;

    if (isGpsActive) {
      gpsRef.current.stopTracking();
      setIsGpsActive(false);
    } else {
      gpsRef.current.startTracking(
        (newDistanceKm) => {
          setDistanceKm(newDistanceKm);
        },
        (err) => {
          alert('GPS tracking notice: ' + err);
          setIsGpsActive(false);
        }
      );
      setIsGpsActive(true);
    }
  };

  // Manual step increment
  const handleAddManualSteps = (steps: number) => {
    setCurrentSteps((prev) => {
      const nextVal = prev + steps;
      pedometerRef.current?.setStepCount(nextVal);
      return nextVal;
    });
    setDistanceKm((prev) => Number((prev + steps * 0.00075).toFixed(2)));
    setTotalExp((prev) => prev + Math.max(1, Math.round(steps * 0.05)));
  };

  // Add meal from scanner or manual
  const handleLogMeal = (meal: ShinobiMeal) => {
    setMeals((prev) => [meal, ...prev]);
    setTotalExp((prev) => prev + 50);
  };

  // Delete meal
  const handleDeleteMeal = (mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  // Add water
  const handleAddWater = (amountMl: number) => {
    setWaterMl((prev) => prev + amountMl);
    setTotalExp((prev) => prev + 10);
  };

  // Complete workout from Taijutsu Dojo
  const handleFinishWorkout = (completed: CompletedWorkout) => {
    setCompletedWorkouts((prev) => [completed, ...prev]);
    setTaijutsuExp((prev) => prev + completed.expEarned);
    setTotalExp((prev) => prev + completed.expEarned);
  };

  // Claim Daily Quest EXP
  const handleClaimQuest = (questId: string, expReward: number) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
    );
    setTotalExp((prev) => prev + expReward);
  };

  // Reset all logs
  const handleResetData = () => {
    setCurrentSteps(0);
    setDistanceKm(0);
    setWaterMl(0);
    setMeals([]);
    setCompletedWorkouts([]);
    setQuests(INITIAL_DAILY_QUESTS);
    soundEngine.playWhoosh();
  };

  // Complete Onboarding
  const handleCompleteOnboarding = (newProfile: ShinobiProfile) => {
    setProfile(newProfile);
    setIsOnboardingOpen(false);
  };

  const caloriesBurnedWalking = Math.round(currentSteps * (profile.weight ? profile.weight * 0.00057 : 0.042));

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-black">
      {/* Onboarding Modal (First launch or manual restart) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />

      {/* Main Top Shinobi Stats HUD */}
      <ShinobiHUD
        profile={profile}
        stats={stats}
        targets={targets}
        currentSteps={currentSteps}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onOpenRankModal={() => setIsRankModalOpen(true)}
      />

      {/* Main View Area (Mobile Focused Layout) */}
      <main className="flex-1 max-w-md w-full mx-auto p-3.5 pb-28 space-y-4">
        {/* TAB 1: PATROL & GATE OVERVIEW */}
        {activeTab === 'patrol' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Step Counter & Distance Tracker */}
            <StepTrackerRing
              currentSteps={currentSteps}
              distanceKm={distanceKm}
              caloriesBurned={caloriesBurnedWalking}
              targets={targets}
              profile={profile}
              isPedometerActive={isPedometerActive}
              isGpsActive={isGpsActive}
              onTogglePedometer={handleTogglePedometer}
              onToggleGps={handleToggleGps}
              onAddManualSteps={handleAddManualSteps}
            />

            {/* 7-Day Activity Trends Visualization with Recharts */}
            <WeeklyActivityChart
              currentSteps={currentSteps}
              todayExp={stats.currentExp}
              dailyStepTarget={targets.dailySteps}
            />

            {/* Quick Action: Scan Food Button */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-black border border-orange-500/30 flex items-center justify-between shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
                  <Camera className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-ninja text-xs font-bold text-white uppercase tracking-wider">
                    Shinobi Ration Appraisal
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Snap or upload meal photo to calculate calories
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine.playWhoosh();
                  setIsScannerOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-ninja font-extrabold text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition"
              >
                Scan Now
              </button>
            </div>

            {/* Quick Training EXP Banner for Rank Elevation Testing */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-yellow-950/30 via-orange-950/30 to-slate-900 border border-yellow-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-spin" />
                <div>
                  <span className="font-ninja text-[11px] font-bold text-yellow-300 uppercase block">
                    Taijutsu Sparring Ground
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Train with Guy Sensei for massive EXP
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine.playLevelUp();
                  setTotalExp((prev) => prev + 500);
                  setTaijutsuExp((prev) => prev + 250);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-ninja font-extrabold text-[11px] uppercase tracking-wider shadow active:scale-95 transition hover:brightness-110"
                title="Earn +500 Shinobi EXP to level up & rank up"
              >
                +500 EXP Spar ⚡
              </button>
            </div>

            {/* Daily Missions / Quests */}
            <DailyQuestsList
              quests={quests}
              onClaimQuest={handleClaimQuest}
            />

            {/* Powered by Cherry Ribbon */}
            <div className="text-center py-2 flex items-center justify-center space-x-1.5 text-xs text-slate-500 font-ninja">
              <span>🌸</span>
              <span>Level Up: Shinobi Training</span>
              <span className="text-pink-400/90 font-bold">• Powered by Cherry</span>
            </div>
          </div>
        )}

        {/* TAB 2: TAIJUTSU DOJO (WORKOUT LOGGER) */}
        {activeTab === 'dojo' && (
          <div className="animate-fadeIn">
            <TaijutsuDojo
              userGoal={profile.goal}
              onFinishWorkout={handleFinishWorkout}
            />
          </div>
        )}

        {/* TAB 3: COMMISSARY & RATIONS (FOOD & SCANNER) */}
        {activeTab === 'rations' && (
          <div className="animate-fadeIn">
            <RationDiary
              meals={meals}
              waterMl={waterMl}
              targets={targets}
              caloriesBurnedWalking={caloriesBurnedWalking}
              onOpenScanner={() => setIsScannerOpen(true)}
              onAddManualMeal={handleLogMeal}
              onDeleteMeal={handleDeleteMeal}
              onAddWater={handleAddWater}
            />
          </div>
        )}

        {/* TAB 4: SHINOBI CODEX & SETTINGS */}
        {activeTab === 'codex' && (
          <div className="animate-fadeIn">
            <ShinobiSettings
              profile={profile}
              targets={targets}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              onUpdateProfile={(updated) => setProfile(updated)}
              onResetData={handleResetData}
              onRestartOnboarding={() => setIsOnboardingOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Floating Camera Button (Visible on all tabs for quick ration appraisal) */}
      <div className="fixed bottom-20 right-4 sm:right-[calc(50%-200px)] z-30">
        <button
          onClick={() => {
            soundEngine.playWhoosh();
            setIsScannerOpen(true);
          }}
          className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.6)] hover:brightness-110 active:scale-90 transition border border-orange-300"
          title="Scan Shinobi Rations (AI Vision)"
        >
          <Camera className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Mobile Tab Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#090b11]/95 backdrop-blur-lg border-t border-orange-500/20 py-2 px-3 shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* Tab 1: Patrol */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('patrol');
            }}
            className={`flex flex-col items-center py-1 rounded-xl transition ${
              activeTab === 'patrol'
                ? 'text-orange-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Footprints className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-ninja tracking-wider uppercase">
              Patrol
            </span>
          </button>

          {/* Tab 2: Taijutsu */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('dojo');
            }}
            className={`flex flex-col items-center py-1 rounded-xl transition ${
              activeTab === 'dojo'
                ? 'text-orange-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Dumbbell className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-ninja tracking-wider uppercase">
              Taijutsu
            </span>
          </button>

          {/* Tab 3: Rations */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('rations');
            }}
            className={`flex flex-col items-center py-1 rounded-xl transition ${
              activeTab === 'rations'
                ? 'text-orange-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Utensils className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-ninja tracking-wider uppercase">
              Rations
            </span>
          </button>

          {/* Tab 4: Codex */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('codex');
            }}
            className={`flex flex-col items-center py-1 rounded-xl transition ${
              activeTab === 'codex'
                ? 'text-orange-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-ninja tracking-wider uppercase">
              Codex
            </span>
          </button>
        </div>
      </nav>

      {/* AI Ration Photo Scanner Modal */}
      <RationScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onLogMeal={handleLogMeal}
      />

      {/* Shinobi Rank Roadmap Modal */}
      <RankModal
        isOpen={isRankModalOpen}
        onClose={() => setIsRankModalOpen(false)}
        stats={stats}
        onTriggerCelebration={(rank) => {
          setCelebrationData({
            isOpen: true,
            newRank: rank,
            oldRank: stats.rank,
          });
        }}
      />

      {/* Full-screen Celebratory Rank Elevation Animation with Orange & Gold Leaf Confetti */}
      <RankElevationCelebration
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData((prev) => ({ ...prev, isOpen: false }))}
        newRank={celebrationData.newRank}
        oldRank={celebrationData.oldRank}
        shinobiName={profile.name || 'Dhruv'}
      />
    </div>
  );
}
