import React, { useState } from 'react';
import { Utensils, Camera, Plus, Droplets, Trash2, Sparkles, Zap, ChevronDown, Check } from 'lucide-react';
import { ShinobiMeal, CalculatedTargets } from '../types/shinobi';
import { soundEngine } from '../utils/audio';

interface RationDiaryProps {
  meals: ShinobiMeal[];
  waterMl: number;
  targets: CalculatedTargets;
  caloriesBurnedWalking: number;
  onOpenScanner: () => void;
  onAddManualMeal: (meal: ShinobiMeal) => void;
  onDeleteMeal: (mealId: string) => void;
  onAddWater: (amountMl: number) => void;
}

export const RationDiary: React.FC<RationDiaryProps> = ({
  meals,
  waterMl,
  targets,
  caloriesBurnedWalking,
  onOpenScanner,
  onAddManualMeal,
  onDeleteMeal,
  onAddWater,
}) => {
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFats, setManualFats] = useState('');

  // Calculate totals consumed
  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFats = meals.reduce((acc, m) => acc + m.fats, 0);

  // Net Calories = Consumed - Burned
  const remainingCalories = targets.dailyCalories - totalCalories;
  const caloriePercent = Math.min(100, Math.round((totalCalories / targets.dailyCalories) * 100));

  const proteinPercent = Math.min(100, Math.round((totalProtein / targets.proteinGrams) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / targets.carbsGrams) * 100));
  const fatsPercent = Math.min(100, Math.round((totalFats / targets.fatsGrams) * 100));
  const waterPercent = Math.min(100, Math.round((waterMl / targets.waterMl) * 100));

  const handleCreateManualMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualCalories) return;
    soundEngine.playChakraCharge();

    const cal = parseInt(manualCalories, 10) || 300;
    const pro = parseFloat(manualProtein) || Math.round((cal * 0.25) / 4);
    const crb = parseFloat(manualCarbs) || Math.round((cal * 0.50) / 4);
    const fat = parseFloat(manualFats) || Math.round((cal * 0.25) / 9);

    const newMeal: ShinobiMeal = {
      id: 'meal-man-' + Date.now(),
      dishName: manualName.trim(),
      shinobiName: `Field Ration: ${manualName.trim()}`,
      portionSize: '1 portion',
      calories: cal,
      protein: pro,
      carbs: crb,
      fats: fat,
      chakraType: 'General Physical Stamina',
      chakraBoostPoints: 35,
      shinobiAppraisal: 'Quick field ration consumed on duty. Preserves vital chakra reserves!',
      healthRating: 'B-Rank',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddManualMeal(newMeal);
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFats('');
    setShowManualAdd(false);
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner: Daily Chakra & Calorie Allocation */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#151724] to-[#0c0d14] border border-orange-500/25 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-ninja text-base font-bold text-slate-100 uppercase tracking-wider">
                Shinobi Commissary
              </h2>
              <p className="text-xs text-orange-400/90 font-mono">
                Rations & Calorie Balance
              </p>
            </div>
          </div>

          {/* AI Scanner Button */}
          <button
            onClick={() => {
              soundEngine.playWhoosh();
              onOpenScanner();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-ninja font-extrabold uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition"
          >
            <Camera className="w-4 h-4 text-black" />
            <span>AI Scan</span>
          </button>
        </div>

        {/* Calorie Stats Circle & Summary */}
        <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-black/40 border border-slate-800 my-3">
          <div>
            <span className="text-[10px] font-ninja tracking-wider text-slate-400 uppercase block">
              Target
            </span>
            <span className="font-ninja text-base font-bold text-white">
              {targets.dailyCalories}
            </span>
            <span className="text-[9px] text-slate-500 block">kcal</span>
          </div>

          <div className="border-x border-slate-800">
            <span className="text-[10px] font-ninja tracking-wider text-orange-400 uppercase block">
              Consumed
            </span>
            <span className="font-ninja text-base font-bold text-orange-400">
              {totalCalories}
            </span>
            <span className="text-[9px] text-slate-500 block">kcal</span>
          </div>

          <div>
            <span className="text-[10px] font-ninja tracking-wider text-cyan-400 uppercase block">
              Remaining
            </span>
            <span className={`font-ninja text-base font-bold ${remainingCalories >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
              {remainingCalories}
            </span>
            <span className="text-[9px] text-slate-500 block">kcal</span>
          </div>
        </div>

        {/* Calorie Bar */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Calorie Consumption: {caloriePercent}%</span>
            <span>Burned from walking: ~{caloriesBurnedWalking} kcal</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* Macronutrient Distribution Bars */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
          {/* Protein */}
          <div className="p-2 rounded-xl bg-slate-900/60 border border-cyan-500/20">
            <div className="flex justify-between items-center text-[10px] font-ninja text-cyan-400 mb-1">
              <span>PROTEIN</span>
              <span>{totalProtein}/{targets.proteinGrams}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="p-2 rounded-xl bg-slate-900/60 border border-amber-500/20">
            <div className="flex justify-between items-center text-[10px] font-ninja text-amber-400 mb-1">
              <span>CARBS</span>
              <span>{totalCarbs}/{targets.carbsGrams}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="p-2 rounded-xl bg-slate-900/60 border border-rose-500/20">
            <div className="flex justify-between items-center text-[10px] font-ninja text-rose-400 mb-1">
              <span>FATS</span>
              <span>{totalFats}/{targets.fatsGrams}g</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full"
                style={{ width: `${fatsPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Water Hydration Card */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-cyan-500/25 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <Droplets className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-ninja tracking-wider text-slate-400 uppercase">
              Water Release Hydration
            </span>
            <div className="text-base font-ninja font-bold text-cyan-300">
              {waterMl} / {targets.waterMl} ml
            </div>
            <span className="text-[10px] font-mono text-cyan-400/80">
              {waterPercent}% of target
            </span>
          </div>
        </div>

        {/* Quick add water buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              soundEngine.playClick();
              onAddWater(250);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-900/80 active:scale-95 transition"
          >
            +250ml
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              onAddWater(500);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-900/80 active:scale-95 transition"
          >
            +500ml
          </button>
        </div>
      </div>

      {/* Rations Diary Header & Quick Add */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-ninja tracking-wider text-slate-300 uppercase font-bold">
          Today's Ration Scrolls ({meals.length})
        </span>

        <button
          onClick={() => {
            soundEngine.playClick();
            setShowManualAdd(!showManualAdd);
          }}
          className="text-xs font-ninja text-orange-400 hover:text-orange-300 flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showManualAdd ? 'Hide Manual' : 'Manual Entry'}</span>
        </button>
      </div>

      {/* Manual Entry Form */}
      {showManualAdd && (
        <form onSubmit={handleCreateManualMeal} className="p-3.5 rounded-2xl bg-slate-950 border border-orange-500/40 space-y-3 animate-fadeIn">
          <span className="text-[11px] font-ninja tracking-wider text-orange-400 uppercase font-bold block">
            Record Custom Field Ration
          </span>

          <input
            type="text"
            placeholder="Meal or Dish Name (e.g. Soldier Pill Protein Shake)"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500"
            required
          />

          <div className="grid grid-cols-4 gap-2">
            <input
              type="number"
              placeholder="Calories"
              value={manualCalories}
              onChange={(e) => setManualCalories(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-center font-mono focus:outline-none focus:border-orange-500"
              required
            />
            <input
              type="number"
              placeholder="Protein (g)"
              value={manualProtein}
              onChange={(e) => setManualProtein(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-center font-mono focus:outline-none focus:border-orange-500"
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={manualCarbs}
              onChange={(e) => setManualCarbs(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-center font-mono focus:outline-none focus:border-orange-500"
            />
            <input
              type="number"
              placeholder="Fats (g)"
              value={manualFats}
              onChange={(e) => setManualFats(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-center font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-orange-500 text-black font-ninja font-extrabold text-xs uppercase tracking-wider transition active:scale-95"
          >
            Inscribe Ration to Scroll
          </button>
        </form>
      )}

      {/* Meals List */}
      {meals.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-slate-400">
          <Utensils className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-xs font-ninja tracking-wider text-slate-300">
            No shinobi rations logged yet today
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Use the "AI Scan" button above to snap a photo and appraise your meal!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#10121a] to-slate-900 border border-slate-800 hover:border-orange-500/40 transition shadow-md flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                {meal.imageUrl ? (
                  <img
                    src={meal.imageUrl}
                    alt={meal.dishName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                )}

                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-ninja text-xs font-bold text-white truncate">
                      {meal.shinobiName}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                      {meal.healthRating}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {meal.dishName} • <span className="text-slate-500 font-mono">{meal.timestamp}</span>
                  </p>
                  <p className="text-[10px] text-cyan-400 font-mono mt-0.5">
                    P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="text-right">
                  <span className="font-ninja text-sm font-bold text-orange-400 block">
                    {meal.calories}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block">kcal</span>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onDeleteMeal(meal.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 transition"
                  title="Remove meal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
