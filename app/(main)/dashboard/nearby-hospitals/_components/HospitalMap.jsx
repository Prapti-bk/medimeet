"use client";

import { useEffect, useRef } from "react";

export default function HospitalMap({
  center, hospitals, userLocation, onSelect, selectedId,
}) {
  const mapRef      = useRef(null);
  const leafletRef  = useRef(null);
  const markersRef  = useRef([]);
  const userMarkerRef = useRef(null);
  const containerRef  = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || leafletRef.current) return;

    import("leaflet").then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 13,
        zoomControl: false,
      });

      // Futuristic light tile
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      leafletRef.current = { map, L };
      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; leafletRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([center.lat, center.lng], 13, { duration: 1.4 });
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!leafletRef.current) return;
    const { map, L } = leafletRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    hospitals.forEach(h => {
      const isSelected  = h.id === selectedId;
      const isEmergency = h.emergency;
      const isAI        = h.aiRecommended;

      const color = isEmergency ? "#ef4444" : isAI ? "#8b5cf6" : "#0ea5e9";
      const glow  = isEmergency ? "drop-shadow(0 0 8px #ef4444)" : isAI ? "drop-shadow(0 0 8px #8b5cf6)" : "drop-shadow(0 0 6px #0ea5e9)";
      const size  = isSelected ? 40 : 32;

      const svgIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:${size}px;height:${size}px">
            ${isEmergency ? `<div style="position:absolute;inset:-4px;border-radius:50%;background:${color};opacity:0.2;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>` : ""}
            <div style="
              width:${size}px;height:${size}px;
              background:${color};
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:2.5px solid white;
              filter:${glow};
              box-shadow:0 4px 12px ${color}55;
              transition:all 0.2s;
              cursor:pointer;
            ">
              <div style="
                width:${Math.round(size*0.32)}px;height:${Math.round(size*0.32)}px;
                background:white;border-radius:50%;
                position:absolute;top:50%;left:50%;
                transform:translate(-50%,-50%) rotate(45deg);
              "></div>
            </div>
          </div>
          <style>
            @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
          </style>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
      });

      const marker = L.marker([h.lat, h.lng], { icon: svgIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:180px;padding:2px">
            <div style="font-weight:700;color:#0e7490;font-size:13px;margin-bottom:4px">${h.name}</div>
            <div style="font-size:11px;color:#6b7280;margin-bottom:4px">${h.specialties[0]}</div>
            <div style="font-size:11px;display:flex;gap:8px;align-items:center">
              <span>⭐ ${h.rating}</span>
              <span>📍 ${h.distance} km</span>
              ${h.open ? '<span style="color:#10b981;font-weight:600">● Open</span>' : '<span style="color:#ef4444;font-weight:600">● Closed</span>'}
            </div>
            ${h.emergency ? '<div style="color:#ef4444;font-size:11px;font-weight:700;margin-top:4px">🚨 Emergency Available</div>' : ""}
            ${h.aiRecommended ? '<div style="color:#8b5cf6;font-size:11px;font-weight:700;margin-top:2px">✨ AI Recommended</div>' : ""}
          </div>`, { maxWidth: 240 })
        .on("click", () => onSelect(h));

      markersRef.current.push(marker);
    });
  }, [hospitals, selectedId, onSelect]);

  useEffect(() => {
    if (!leafletRef.current || !userLocation) return;
    const { map, L } = leafletRef.current;
    if (userMarkerRef.current) userMarkerRef.current.remove();

    const pulseIcon = L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:28px;height:28px">
          <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;opacity:0.25;animation:userPulse 2s infinite"></div>
          <div style="position:absolute;inset:4px;background:#3b82f6;border-radius:50%;opacity:0.15;animation:userPulse 2s 0.3s infinite"></div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;background:#3b82f6;border:2.5px solid white;border-radius:50%;box-shadow:0 0 10px #3b82f6"></div>
        </div>
        <style>
          @keyframes userPulse{0%,100%{transform:scale(1);opacity:0.25}50%{transform:scale(2.5);opacity:0.05}}
        </style>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: pulseIcon })
      .addTo(map)
      .bindPopup("<strong style='color:#3b82f6'>📍 You are here</strong>");
  }, [userLocation]);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: 340 }} />
  );
}
