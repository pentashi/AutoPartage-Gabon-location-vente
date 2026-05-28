"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  subLabel?: string;
  speed?: number;
  timestamp?: string;
}

interface MapViewProps {
  locations: MapLocation[];
  center?: [number, number];
  zoom?: number;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapView({ 
  locations, 
  center = [0.4162, 9.4673], // Default to Libreville, Gabon
  zoom = 13 
}: MapViewProps) {
  // If there are locations, calculate average center if not explicitly provided
  const mapCenter = locations.length > 0 
    ? [locations[0].latitude, locations[0].longitude] as [number, number]
    : center;

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-slate-900 m-0">{loc.label}</p>
                <p className="text-xs text-slate-500 m-0 mt-0.5">{loc.subLabel}</p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
                   {loc.speed !== undefined && (
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Vitesse:</span>
                       <span className="text-xs font-semibold text-emerald-600">{loc.speed} km/h</span>
                     </div>
                   )}
                   {loc.timestamp && (
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Dernier signal:</span>
                       <span className="text-[10px] text-slate-600 font-mono">{new Date(loc.timestamp).toLocaleString()}</span>
                     </div>
                   )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <RecenterMap center={mapCenter} />
      </MapContainer>
    </div>
  );
}
