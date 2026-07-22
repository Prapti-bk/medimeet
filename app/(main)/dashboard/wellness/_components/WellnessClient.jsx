"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Sparkles, ClipboardEdit, BarChart3,
  Droplets, Moon, Footprints, Dumbbell, Heart,
  RefreshCw, TrendingUp, Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { getWellnessHistory, getWellnessInsights, getTodayLog } from "@/actions/wellness";
import WellnessForm from "./WellnessForm";
import WellnessScore from "./WellnessScore";
import InsightCard from "./InsightCard";
import TrendChart from "./TrendChart";

const TABS = [
  { id: "log",      label: "Daily Log",   emoji: "📝" },
  { id: "insights", label: "AI Insights", emoji: "🤖" },
  { id: "trends",   label: "Trends",      emoji: "📈" },
];

function MetricWidget({ icon: Icon, label, value, unit, color, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
    >
      <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md mb-3`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className={`text-2xl font-extrabold ${color}`}>
        {value != null ? value : "—"}
        {value != null && <span className="text-sm font-semibold ml-1 text-slate-400">{unit}</span>}
      </p>
      <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
    </motion.div>
  );
}

export default function WellnessClient({ userName }) {
  const [activeTab, setActiveTab] = useState("log");
  const [todayLog, setTodayLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, histRes, insRes] = await Promise.all([
        getTodayLog(),
        getWellnessHistory(14),
        getWellnessInsights(),
      ]);
      setTodayLog(todayRes.log);
      setHistory(histRes.logs);
      setInsights(insRes.insights);
      setScore(insRes.score);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleSaved = () => setRefreshKey(k => k + 1);

  // Build chart data from history
  const chartData = history.map(l => ({
    day:     format(new Date(l.date), "EEE"),
    water:   l.waterIntake ?? 0,
    sleep:   l.sleepHours  ?? 0,
    steps:   l.steps       ?? 0,
    mood:    { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 }[l.mood] ?? 0,
    systolic:l.systolic    ?? 0,
    weight:  l.weight      ?? 0,
    exercise:l.exerciseMinutes ?? 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-[#f8fbff] to-[#eef4ff]">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-lg shadow-sky-200/50">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold gradient-title">AI Wellness Tracker</h1>
                <p className="text-slate-500 text-sm font-medium">
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-sky-100 shadow-sm">
                <Calendar className="h-4 w-4 text-sky-500" />
                <span className="text-xs font-semibold text-slate-600">{history.length} days logged</span>
              </div>
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                className="p-2.5 rounded-xl bg-white border border-sky-100 shadow-sm text-sky-500 hover:bg-sky-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Today's metric widgets */}
          {!loading && todayLog && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              <MetricWidget icon={Droplets}  label="Water"    value={todayLog.waterIntake}     unit="L"   color="text-cyan-600"    gradient="from-cyan-400 to-sky-400" />
              <MetricWidget icon={Moon}      label="Sleep"    value={todayLog.sleepHours}      unit="h"   color="text-violet-600"  gradient="from-violet-400 to-indigo-400" />
              <MetricWidget icon={Footprints}label="Steps"    value={todayLog.steps?.toLocaleString()} unit="" color="text-emerald-600" gradient="from-emerald-400 to-teal-400" />
              <MetricWidget icon={Dumbbell}  label="Exercise" value={todayLog.exerciseMinutes} unit="min" color="text-sky-600"     gradient="from-sky-400 to-cyan-400" />
              <MetricWidget icon={Heart}     label="BP"       value={todayLog.systolic ? `${todayLog.systolic}/${todayLog.diastolic}` : null} unit="" color="text-red-500" gradient="from-red-400 to-rose-400" />
              <MetricWidget icon={TrendingUp}label="Score"    value={score}                    unit=""    color="text-sky-600"     gradient="from-sky-400 to-cyan-400" />
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 h-24 animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl mb-3" />
                  <div className="w-16 h-5 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm w-fit">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-200/60"
                    : "text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                }`}
              >
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── CONTENT ── */}
        <AnimatePresence mode="wait">

          {/* LOG TAB */}
          {activeTab === "log" && (
            <motion.div key="log" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-md">
                      <ClipboardEdit className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800">Today's Health Log</h2>
                      <p className="text-xs text-slate-400">{todayLog ? "Update today's entry" : "Log your health metrics"}</p>
                    </div>
                  </div>
                  <WellnessForm existing={todayLog} onSaved={handleSaved} />
                </div>

                {/* Score + quick insights */}
                <div className="space-y-4">
                  {/* Score card */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-lg p-6 flex flex-col items-center">
                    {score != null ? (
                      <WellnessScore score={score} />
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-sky-200 mb-3" />
                        <p className="text-slate-500 font-semibold text-sm">Log your first entry</p>
                        <p className="text-slate-400 text-xs mt-1">to see your wellness score</p>
                      </div>
                    )}
                  </div>

                  {/* Top 2 insights */}
                  {insights.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-sky-500" />
                        <p className="text-sm font-bold text-slate-700">AI Highlights</p>
                      </div>
                      <div className="space-y-2">
                        {insights.slice(0, 2).map((ins, i) => (
                          <InsightCard key={i} insight={ins} index={i} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* INSIGHTS TAB */}
          {activeTab === "insights" && (
            <motion.div key="insights" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Insights list */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-lg p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-400 shadow-md">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-800">AI Wellness Insights</h2>
                        <p className="text-xs text-slate-400">Based on your last 7 days of data</p>
                      </div>
                    </div>

                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : insights.length === 0 ? (
                      <div className="text-center py-12">
                        <Sparkles className="h-12 w-12 mx-auto text-sky-200 mb-3" />
                        <p className="text-slate-500 font-semibold">No insights yet</p>
                        <p className="text-slate-400 text-sm mt-1">Log at least 3 days of data to unlock AI insights</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {insights.map((ins, i) => (
                          <InsightCard key={i} insight={ins} index={i} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score + streak */}
                <div className="space-y-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-lg p-6 flex flex-col items-center">
                    {score != null ? <WellnessScore score={score} /> : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-sky-200 mb-3" />
                        <p className="text-slate-400 text-sm">Log data to see score</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-3xl border border-sky-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-sky-700 uppercase tracking-wide mb-3">Logging Streak</p>
                    <p className="text-4xl font-extrabold text-sky-600">{history.length}</p>
                    <p className="text-sm text-slate-500 font-medium">days tracked (last 14)</p>
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {[...Array(14)].map((_, i) => {
                        const hasLog = i < history.length;
                        return (
                          <div key={i} className={`w-5 h-5 rounded-md ${hasLog ? "bg-sky-400" : "bg-slate-100"}`} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TRENDS TAB */}
          {activeTab === "trends" && (
            <motion.div key="trends" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              {chartData.length === 0 ? (
                <div className="text-center py-20 bg-white/90 rounded-3xl border border-sky-100 shadow-lg">
                  <BarChart3 className="h-14 w-14 mx-auto text-sky-200 mb-4" />
                  <p className="text-slate-500 font-semibold text-lg">No trend data yet</p>
                  <p className="text-slate-400 text-sm mt-1">Start logging daily to see your health trends</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[
                    { title: "Water Intake",    key: "water",    unit: "L",   color: "#06b6d4", icon: Droplets,   type: "bar",  gradient: "from-cyan-400 to-sky-400" },
                    { title: "Sleep Hours",     key: "sleep",    unit: "h",   color: "#8b5cf6", icon: Moon,       type: "line", gradient: "from-violet-400 to-indigo-400" },
                    { title: "Steps",           key: "steps",    unit: "",    color: "#10b981", icon: Footprints, type: "bar",  gradient: "from-emerald-400 to-teal-400" },
                    { title: "Exercise",        key: "exercise", unit: "min", color: "#0ea5e9", icon: Dumbbell,   type: "bar",  gradient: "from-sky-400 to-cyan-400" },
                    { title: "Mood Score",      key: "mood",     unit: "/5",  color: "#f59e0b", icon: Activity,   type: "line", gradient: "from-amber-400 to-orange-400" },
                    { title: "Blood Pressure",  key: "systolic", unit: "mmHg",color: "#ef4444", icon: Heart,      type: "line", gradient: "from-red-400 to-rose-400" },
                  ].map(chart => {
                    const Icon = chart.icon;
                    const latest = chartData[chartData.length - 1]?.[chart.key];
                    return (
                      <motion.div
                        key={chart.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-lg p-5 hover:shadow-xl hover:shadow-sky-100/50 transition-all hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${chart.gradient} shadow-md`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <p className="font-bold text-slate-800 text-sm">{chart.title}</p>
                          </div>
                          {latest != null && latest > 0 && (
                            <span className="text-xs font-bold text-slate-500">
                              {latest}{chart.unit}
                            </span>
                          )}
                        </div>
                        <TrendChart
                          data={chartData}
                          valueKey={chart.key}
                          labelKey="day"
                          color={chart.color}
                          type={chart.type}
                          unit={chart.unit}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
