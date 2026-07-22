"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Phone, MapPin, Star, Zap, Clock, ChevronDown, ChevronUp, Sparkles, BedDouble, Navigation } from "lucide-react";

export default function HospitalCard({ hospital, isSelected, onSelect, index }) {
  const [expanded, setExpanded] = useState(false);

  const handleCall       = e => { e.stopPropagation(); window.open(`tel:${hospital.phone}`); };
  const handleDirections = e => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`,"_blank"); };

  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.3, delay:index*0.05 }}
      onClick={() => onSelect(hospital)}
      className={`
        relative cursor-pointer rounded-2xl border transition-all duration-300 bg-white overflow-hidden
        ${isSelected
          ? "border-sky-300 shadow-[0_8px_32px_rgba(14,165,233,0.18)] ring-1 ring-sky-200"
          : "border-slate-100 shadow-sm hover:border-sky-200 hover:shadow-[0_8px_24px_rgba(14,165,233,0.10)] hover:-translate-y-0.5"
        }
      `}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${
        hospital.emergency
          ? "bg-gradient-to-r from-red-400 to-orange-400"
          : isSelected
            ? "bg-gradient-to-r from-sky-400 to-cyan-400"
            : "bg-gradient-to-r from-sky-200 to-cyan-200 opacity-0 group-hover:opacity-100"
      }`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              {hospital.aiRecommended && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
                  <Sparkles className="h-2.5 w-2.5" /> AI Pick
                </span>
              )}
              {hospital.emergency && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                  <Zap className="h-2.5 w-2.5" /> Emergency
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm text-slate-800 leading-tight line-clamp-2">{hospital.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-sky-400" />{hospital.address}
            </p>
          </div>

          {/* Distance */}
          <div className="shrink-0 text-center bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-xl px-2.5 py-1.5">
            <p className="text-lg font-extrabold text-sky-600 leading-none">{hospital.distance}</p>
            <p className="text-[9px] text-sky-400 font-semibold">km</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-700">{hospital.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className={`text-xs font-semibold ${hospital.open?"text-emerald-600":"text-red-500"}`}>
              {hospital.open?"Open Now":"Closed"}
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <BedDouble className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-xs text-slate-400">{hospital.beds}</span>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hospital.specialties.slice(0,3).map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200 font-medium">{s}</span>
          ))}
          {hospital.specialties.length>3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-200">+{hospital.specialties.length-3}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleCall}
            className="flex-1 h-8 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200/60 hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Call
          </button>
          <button onClick={handleDirections}
            className="flex-1 h-8 text-xs font-semibold rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm shadow-sky-200/60 hover:from-sky-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-1.5">
            <Navigation className="h-3.5 w-3.5" /> Directions
          </button>
          <button onClick={e=>{e.stopPropagation();setExpanded(v=>!v);}}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors border border-slate-100">
            {expanded?<ChevronUp className="h-4 w-4"/>:<ChevronDown className="h-4 w-4"/>}
          </button>
        </div>

        {/* Expanded */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22}} className="overflow-hidden">
              <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" />{hospital.phone}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {hospital.specialties.map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200">{s}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
