export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'endurance_maintenance';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';

export type NinjaRank = 'Academy Student' | 'Genin' | 'Chunin' | 'Jonin' | 'Hokage';

export interface ShinobiProfile {
  name: string;
  goal: FitnessGoal;
  height: number; // in cm
  heightUnit: 'cm' | 'ft';
  weight: number; // in kg
  weightUnit: 'kg' | 'lbs';
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: ActivityLevel;
  village: string;
  avatarSeed: string;
  isOnboarded: boolean;
  registeredAt: string;
}

export interface CalculatedTargets {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  dailySteps: number;
  walkingDistanceKm: number;
  waterMl: number;
}

export interface ShinobiStats {
  rank: NinjaRank;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  taijutsuExp: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface ExerciseSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Calisthenics' | 'Cardio';
  shinobiJutsuName: string;
  targetMuscles: string[];
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  shinobiLore: string;
  goalAffinity: FitnessGoal;
  category: 'Push' | 'Pull' | 'Legs' | 'Calisthenics' | 'Home Workout' | 'Shadow Clone Core';
  difficulty: 'Academy' | 'Genin' | 'Chunin' | 'Jonin' | 'Anbu';
  durationMin: number;
  expReward: number;
  exercises: Exercise[];
}

export interface CompletedWorkout {
  id: string;
  routineId: string;
  routineTitle: string;
  completedAt: string;
  durationMinutes: number;
  expEarned: number;
  totalVolumeKg: number;
  exercisesDone: number;
}

export interface ShinobiMeal {
  id: string;
  dishName: string;
  shinobiName: string;
  portionSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  chakraType: string;
  chakraBoostPoints: number;
  shinobiAppraisal: string;
  healthRating: string;
  timestamp: string;
  imageUrl?: string;
}

export interface ShinobiQuest {
  id: string;
  title: string;
  rank: 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank';
  description: string;
  type: 'steps' | 'workout' | 'rations' | 'water';
  target: number;
  progress: number;
  completed: boolean;
  expReward: number;
}

export interface DailyActivity {
  date: string;
  steps: number;
  distanceKm: number;
  caloriesBurned: number;
  waterMl: number;
  meals: ShinobiMeal[];
  workouts: CompletedWorkout[];
}

// Target calculation based on Mifflin-St Jeor formula
export function calculatePersonalizedTargets(profile: ShinobiProfile): CalculatedTargets {
  const { weight, height, age, gender, activityLevel, goal } = profile;

  // Base BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 50;
  }

  // Activity multipliers
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.375);

  let targetCalories = Math.round(tdee);
  let targetSteps = 10000;
  let proteinRatio = 0.25;
  let carbsRatio = 0.50;
  let fatsRatio = 0.25;

  if (goal === 'weight_loss') {
    targetCalories = Math.max(1300, Math.round(tdee - 500));
    targetSteps = 12000;
    proteinRatio = 0.32; // Higher protein to preserve shinobi lean mass
    carbsRatio = 0.40;
    fatsRatio = 0.28;
  } else if (goal === 'muscle_gain') {
    targetCalories = Math.round(tdee + 400); // Caloric surplus for taijutsu bulk
    targetSteps = 9000;
    proteinRatio = 0.28;
    carbsRatio = 0.50;
    fatsRatio = 0.22;
  } else {
    // endurance / maintenance
    targetCalories = Math.round(tdee);
    targetSteps = 11000;
    proteinRatio = 0.25;
    carbsRatio = 0.52;
    fatsRatio = 0.23;
  }

  // Grams: 4 kcal per g protein & carb, 9 kcal per g fat
  const proteinGrams = Math.round((targetCalories * proteinRatio) / 4);
  const carbsGrams = Math.round((targetCalories * carbsRatio) / 4);
  const fatsGrams = Math.round((targetCalories * fatsRatio) / 9);

  // Approximate distance (1 step ≈ 0.00075 km)
  const walkingDistanceKm = Number((targetSteps * 0.00075).toFixed(1));
  const waterMl = Math.round(weight * 35); // 35 ml per kg body weight

  return {
    dailyCalories: targetCalories,
    proteinGrams,
    carbsGrams,
    fatsGrams,
    dailySteps: targetSteps,
    walkingDistanceKm,
    waterMl,
  };
}

// EXP calculation & Rank evaluation
export function getRankFromExp(totalExp: number): { rank: NinjaRank; level: number; currentExp: number; expToNextLevel: number; progressPercent: number } {
  // Rank thresholds
  // Academy: Level 1-5 (0 - 500 EXP)
  // Genin: Level 6-15 (501 - 2500 EXP)
  // Chunin: Level 16-30 (2501 - 6500 EXP)
  // Jonin: Level 31-50 (6501 - 15000 EXP)
  // Hokage: Level 50+ (> 15000 EXP)

  let level = 1;
  let remainingExp = totalExp;
  let expForCurrent = 100;

  while (remainingExp >= expForCurrent) {
    remainingExp -= expForCurrent;
    level++;
    expForCurrent = Math.round(100 + (level - 1) * 35);
  }

  let rank: NinjaRank = 'Academy Student';
  if (level >= 50) {
    rank = 'Hokage';
  } else if (level >= 30) {
    rank = 'Jonin';
  } else if (level >= 15) {
    rank = 'Chunin';
  } else if (level >= 5) {
    rank = 'Genin';
  }

  const progressPercent = Math.min(100, Math.round((remainingExp / expForCurrent) * 100));

  return {
    rank,
    level,
    currentExp: remainingExp,
    expToNextLevel: expForCurrent,
    progressPercent,
  };
}
