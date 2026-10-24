import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, Footprints, Flame, Calendar, Award, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export interface DayActivityData {
  day: string; // 'Mon', 'Tue', etc.
  date: string; // 'Oct 20'
  steps: number;
  exp: number;
  targetSteps: number;
  isToday?: boolean;
}

interface WeeklyActivityChartProps {
  currentSteps: number;
  todayExp: number;
  dailyStepTarget: number;
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({
  currentSteps,
  todayExp,
  dailyStepTarget,
}) => {
  const [chartMode, setChartMode] = useState<'combined' | 'steps' | 'exp'>('combined');

  // Generate 7-day historical activity dataset with today's live data
  const data: DayActivityData[] = useMemo(() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result: DayActivityData[] = [];

    // Realistic historical shinobi workout & step counts for past 6 days
    const pastSteps = [8420, 10250, 7890, 11400, 9300, 12600];
    const pastExp = [340, 520, 280, 610, 430, 780];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      const dateStr = `${monthName} ${dayNum}`;

      if (i === 0) {
        // Today (live)
        result.push({
          day: `${dayName} (Today)`,
          date: dateStr,
          steps: currentSteps,
          exp: Math.max(120, todayExp),
          targetSteps: dailyStepTarget,
          isToday: true,
        });
      } else {
        const histIndex = 6 - i;
        result.push({
          day: dayName,
          date: dateStr,
          steps: pastSteps[histIndex % pastSteps.length],
          exp: pastExp[histIndex % pastExp.length],
          targetSteps: dailyStepTarget,
          isToday: false,
        });
      }
    }
    return result;
  }, [currentSteps, todayExp, dailyStepTarget]);

  // Aggregate statistics
  const totalWeeklySteps = useMemo(() => data.reduce((acc, d) => acc + d.steps, 0), [data]);
  const avgDailySteps = Math.round(totalWeeklySteps / 7);
  const totalWeeklyExp = useMemo(() => data.reduce((acc, d) => acc + d.exp, 0), [data]);
  const bestDay = useMemo(() => {
    return data.reduce((max, d) => (d.steps > max.steps ? d : max), data[0]);
  }, [data]);

  // Custom Dark Mode Naruto Styled Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dayData = payload[0].payload as DayActivityData;
      return (
        <div className="p-3 rounded-2xl bg-[#0e101a]/95 border border-orange-500/50 shadow-2xl backdrop-blur-md text-xs font-ninja">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800 text-slate-300">
            <span className="font-bold text-white uppercase">{label}</span>
            <span className="text-[10px] text-orange-400 font-mono">{dayData.date}</span>
          </div>

          <div className="space-y-1 font-mono">
            <div className="flex items-center justify-between space-x-3 text-orange-400">
              <span className="flex items-center gap-1 text-[11px] font-ninja">
                <Footprints className="w-3.5 h-3.5" /> Steps:
              </span>
              <span className="font-bold">{dayData.steps.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between space-x-3 text-cyan-400">
              <span className="flex items-center gap-1 text-[11px] font-ninja">
                <Flame className="w-3.5 h-3.5" /> EXP Gained:
              </span>
              <span className="font-bold">+{dayData.exp.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between space-x-3 text-slate-400 text-[10px] pt-1 border-t border-slate-800/80">
              <span>Goal Target:</span>
              <span>{dayData.targetSteps.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#121422] to-[#0a0b12] border border-orange-500/25 shadow-xl space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-ninja text-sm font-bold tracking-wider text-slate-100 uppercase">
              7-Day Shinobi Activity Logs
            </h3>
            <p className="text-[11px] text-orange-400/90 font-mono">
              Patrol Steps & Taijutsu EXP Momentum
            </p>
          </div>
        </div>

        {/* View mode toggle chips */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => {
              soundEngine.playClick();
              setChartMode('combined');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-ninja font-bold uppercase transition active:scale-95 ${
              chartMode === 'combined'
                ? 'bg-orange-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setChartMode('steps');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-ninja font-bold uppercase transition active:scale-95 ${
              chartMode === 'steps'
                ? 'bg-orange-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Steps
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setChartMode('exp');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-ninja font-bold uppercase transition active:scale-95 ${
              chartMode === 'exp'
                ? 'bg-cyan-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EXP
          </button>
        </div>
      </div>

      {/* 7-Day Stats Summary Strip */}
      <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-2xl bg-black/40 border border-slate-800">
        <div>
          <span className="text-[9px] font-ninja tracking-wider text-slate-400 uppercase block">
            7-Day Total Steps
          </span>
          <span className="font-ninja text-sm font-bold text-orange-400 font-mono">
            {totalWeeklySteps.toLocaleString()}
          </span>
        </div>

        <div className="border-x border-slate-800">
          <span className="text-[9px] font-ninja tracking-wider text-slate-400 uppercase block">
            Daily Average
          </span>
          <span className="font-ninja text-sm font-bold text-white font-mono">
            {avgDailySteps.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-[9px] font-ninja tracking-wider text-cyan-400 uppercase block">
            Weekly EXP
          </span>
          <span className="font-ninja text-sm font-bold text-cyan-400 font-mono">
            +{totalWeeklyExp.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Recharts Visualization Area */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'exp' ? (
            /* EXP Trend Bar Chart */
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="expBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2333" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Chakra Petch' }}
                axisLine={{ stroke: '#272b3b' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="exp"
                name="EXP Gained"
                fill="url(#expBarGradient)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          ) : (
            /* Steps Area Chart & Combined Area Chart */
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Naruto Orange Steps Gradient */}
                <linearGradient id="stepsOrangeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
                {/* Cyan EXP Glow Gradient */}
                <linearGradient id="expCyanArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1f2333" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Chakra Petch' }}
                axisLine={{ stroke: '#272b3b' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Steps Area Curve */}
              <Area
                type="monotone"
                dataKey="steps"
                name="Steps"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#stepsOrangeArea)"
                activeDot={{ r: 6, fill: '#fbbf24', stroke: '#f97316', strokeWidth: 2 }}
              />

              {/* If combined mode, also display EXP as secondary line */}
              {chartMode === 'combined' && (
                <Area
                  type="monotone"
                  dataKey="exp"
                  name="EXP"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="url(#expCyanArea)"
                  activeDot={{ r: 5, fill: '#38bdf8' }}
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Highlight: Peak Day Callout */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        <span className="flex items-center gap-1.5 text-slate-400 font-sans">
          <Award className="w-3.5 h-3.5 text-yellow-400" />
          Peak Patrol: <strong className="text-white font-ninja">{bestDay.day}</strong>
        </span>
        <span className="font-mono text-orange-400 font-bold">
          {bestDay.steps.toLocaleString()} steps ({bestDay.exp} EXP)
        </span>
      </div>
    </div>
  );
};
