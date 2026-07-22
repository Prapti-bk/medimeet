"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Plus, X, Droplets, Moon, Footprints, Flame, Dumbbell, Weight, Heart, Zap, Brain, StickyNote } from "lucide-react";
import { saveWellnessLog } from "@/actions/wellness";
import { toast } from "sonner";

const MOODS = [
  { key: "great",    emoji: "😄", label: "Great",    color: "bg-emerald-100 border-emerald-300 text-emerald-700" },
  { key: "good",     emoji: "🙂", label: "Good",     color: "bg-sky-100 border-sky-300 text-sky-700" },
  { key: "okay",     emoji: "😐", label: "Okay",     color: "bg-amber-100 border-amber-300 text-amber-700" },
  { key: "bad",      emoji: "😔", label: "Bad",      color: "bg-orange-100 border-orange-300 text-orange-700" },
  { key: "terrible", emoji: "😞", label: "Terrible", color: "bg-red-100 border-red-300 text-red-700" },
];

function SliderField({ label, icon: Icon, value, onChange, min, max, step = 1, unit, color = "sky" }) {
  const pct = ((value - min) / (max - min)) * 100;
  const colorMap = {
    sky:    { track: "#0ea5e9", bg: "bg-sky-50",    text: "text-sky-600" },
    cyan:   { track: "#06b6d4", bg: "bg-cyan-50",   text: "text-cyan-600" },
    violet: { track: "#8b5cf6", bg: "bg-violet-50", text: "text-violet-600" },
    emerald:{ track: "#10b981", bg: "bg-emerald-50",text: "text-emerald-600" },
    amber:  { track: "#f59e0b", bg: "bg-amber-50",  text: "text-amber-600" },
    red:    { track: "#ef4444", bg: "bg-red-50",    text: "text-red-600" },
  };
  const c = colorMap[color] ?? colorMap.sky;

  return (
    <div className={`${c.bg} rounded-2xl p-4 border border-white`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${c.text}`} />
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        </div>
        <span className={`text-sm font-bold ${c.text}`}>{value ?? min}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value ?? min}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${c.track} ${pct}%, #e2e8f0 ${pct}%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-400">{min}{unit}</span>
        <span className="text-[10px] text-slate-400">{max}{unit}</span>
      </div>
    </div>
  );
}

function NumberField({ label, icon: Icon, value, onChange, placeholder, unit, color = "sky" }) {
  const colorMap = {
    sky:    "bg-sky-50 border-sky-200 focus:border-sky-400",
    emerald:"bg-emerald-50 border-emerald-200 focus:border-emerald-400",
    amber:  "bg-amber-50 border-amber-200 focus:border-amber-400",
    red:    "bg-red-50 border-red-200 focus:border-red-400",
    violet: "bg-violet-50 border-violet-200 focus:border-violet-400",
  };
  const iconColorMap = {
    sky: "text-sky-500", emerald: "text-emerald-500", amber: "text-amber-500",
    red: "text-red-500", violet: "text-violet-500",
  };

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
        <Icon className={`h-3.5 w-3.5 ${iconColorMap[color]}`} />
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value ?? ""}
          onChange={e => onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all ${colorMap[color]}`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{unit}</span>
        )}
      </div>
    </div>
  );
}

function TagInput({ label, icon: Icon, tags, onChange, placeholder, color = "sky" }) {
  const [input, setInput] = useState("");
  const iconColorMap = { sky: "text-sky-500", violet: "text-violet-500", emerald: "text-emerald-500" };
  const tagColorMap  = { sky: "bg-sky-100 text-sky-700 border-sky-200", violet: "bg-violet-100 text-violet-700 border-violet-200", emerald: "bg-emerald-100 text-emerald-700 border-emerald-200" };

  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) { onChange([...tags, v]); setInput(""); }
  };

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
        <Icon className={`h-3.5 w-3.5 ${iconColorMap[color]}`} />
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-300 transition-all"
        />
        <button type="button" onClick={add}
          className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 hover:bg-sky-100 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${tagColorMap[color]}`}>
            {t}
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WellnessForm({ existing, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    waterIntake:     existing?.waterIntake     ?? 1.5,
    sleepHours:      existing?.sleepHours      ?? 7,
    steps:           existing?.steps           ?? 5000,
    exerciseMinutes: existing?.exerciseMinutes ?? 0,
    calories:        existing?.calories        ?? null,
    weight:          existing?.weight          ?? null,
    systolic:        existing?.systolic        ?? null,
    diastolic:       existing?.diastolic       ?? null,
    sugarLevel:      existing?.sugarLevel      ?? null,
    mood:            existing?.mood            ?? null,
    energyLevel:     existing?.energyLevel     ?? 5,
    stressLevel:     existing?.stressLevel     ?? 3,
    symptoms:        existing?.symptoms        ?? [],
    medications:     existing?.medications     ?? [],
    notes:           existing?.notes           ?? "",
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveWellnessLog(form);
      toast.success("Wellness log saved! 🎉");
      onSaved?.();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Mood selector */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span className="text-lg">😊</span> How are you feeling today?
        </p>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => set("mood", m.key)}
              className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl border-2 transition-all duration-200 ${
                form.mood === m.key
                  ? `${m.color} scale-105 shadow-md`
                  : "border-slate-100 bg-white hover:border-sky-200 hover:bg-sky-50"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] font-bold text-slate-600">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SliderField label="Water Intake"      icon={Droplets}   value={form.waterIntake}     onChange={v => set("waterIntake", v)}     min={0}  max={5}   step={0.1} unit="L"   color="cyan" />
        <SliderField label="Sleep Hours"       icon={Moon}       value={form.sleepHours}      onChange={v => set("sleepHours", v)}      min={0}  max={12}  step={0.5} unit="h"   color="violet" />
        <SliderField label="Steps Walked"      icon={Footprints} value={form.steps}           onChange={v => set("steps", v)}           min={0}  max={20000} step={500} unit=""  color="emerald" />
        <SliderField label="Exercise"          icon={Dumbbell}   value={form.exerciseMinutes} onChange={v => set("exerciseMinutes", v)} min={0}  max={180} step={5}   unit="min" color="sky" />
        <SliderField label="Energy Level"      icon={Zap}        value={form.energyLevel}     onChange={v => set("energyLevel", v)}     min={1}  max={10}  step={1}   unit="/10" color="amber" />
        <SliderField label="Stress Level"      icon={Brain}      value={form.stressLevel}     onChange={v => set("stressLevel", v)}     min={1}  max={10}  step={1}   unit="/10" color="red" />
      </div>

      {/* Number inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <NumberField label="Calories"     icon={Flame}   value={form.calories}   onChange={v => set("calories", v)}   placeholder="2000"  unit="kcal" color="amber" />
        <NumberField label="Weight"       icon={Weight}  value={form.weight}     onChange={v => set("weight", v)}     placeholder="70"    unit="kg"   color="sky" />
        <NumberField label="Sugar Level"  icon={Zap}     value={form.sugarLevel} onChange={v => set("sugarLevel", v)} placeholder="100"   unit="mg/dL" color="violet" />
      </div>

      {/* Blood pressure */}
      <div>
        <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-red-500" /> Blood Pressure
        </p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Systolic"  icon={Heart} value={form.systolic}  onChange={v => set("systolic", v)}  placeholder="120" unit="mmHg" color="red" />
          <NumberField label="Diastolic" icon={Heart} value={form.diastolic} onChange={v => set("diastolic", v)} placeholder="80"  unit="mmHg" color="red" />
        </div>
      </div>

      {/* Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TagInput label="Symptoms"    icon={Zap}        tags={form.symptoms}    onChange={v => set("symptoms", v)}    placeholder="e.g. headache" color="violet" />
        <TagInput label="Medications" icon={StickyNote} tags={form.medications} onChange={v => set("medications", v)} placeholder="e.g. Paracetamol" color="emerald" />
      </div>

      {/* Notes */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
          <StickyNote className="h-3.5 w-3.5 text-sky-500" /> Notes
        </label>
        <textarea
          value={form.notes}
          onChange={e => set("notes", e.target.value)}
          placeholder="How was your day? Any observations about your health…"
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 resize-none transition-all"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-sky-200/60 disabled:opacity-60 transition-all hover:-translate-y-0.5"
      >
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Today's Log</>}
      </button>
    </form>
  );
}
