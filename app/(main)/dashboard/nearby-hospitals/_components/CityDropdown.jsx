"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Check } from "lucide-react";
import { CITIES } from "@/lib/hospitals-data";

export default function CityDropdown({ selectedCity, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const city = CITIES.find(c => c.id === selectedCity) ?? CITIES[0];

  return (
    <div ref={ref} className="relative z-30">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all shadow-sm backdrop-blur-sm ${
          open
            ? "border-sky-400 bg-sky-50 text-sky-700 shadow-sky-100"
            : "border-sky-200 bg-white/80 text-slate-600 hover:border-sky-300 hover:bg-sky-50"
        }`}
      >
        <MapPin className="h-4 w-4 text-sky-500" />
        {city.name}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:-8, scale:0.96 }}
            animate={{ opacity:1, y:0,  scale:1 }}
            exit={{   opacity:0, y:-8, scale:0.96 }}
            transition={{ duration:0.18 }}
            className="absolute top-full mt-2 left-0 min-w-[180px] rounded-2xl border border-sky-100 bg-white/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(14,165,233,0.15)] overflow-hidden"
          >
            {CITIES.map(c => (
              <button
                key={c.id}
                onClick={() => { onChange(c.id); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                  c.id === selectedCity
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-slate-600 hover:bg-sky-50/60 hover:text-sky-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  {c.name}
                </span>
                {c.id === selectedCity && <Check className="h-3.5 w-3.5 text-sky-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
