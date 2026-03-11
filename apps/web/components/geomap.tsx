"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const countryCoords: Record<string, [number, number]> = {
  IN: [78.9629, 20.5937],
  US: [-95.7129, 37.0902],
  DE: [10.4515, 51.1657],
  FR: [2.2137, 46.2276],
  GB: [-3.435973, 55.378051],
  CA: [-106.3468, 56.1304],
  AU: [133.7751, -25.2744],
  BR: [-51.9253, -14.235],
  SG: [103.8198, 1.3521],
};

type CountryStat = {
  country: string;
  clicks: number;
};

type Pulse = {
  id: string;
  coords: [number, number];
};

export default function GeoMap({
  data,
  liveCountry,
}: {
  data: CountryStat[];
  liveCountry?: string;
}) {
  const [pulses, setPulses] = useState<Pulse[]>([]);

  useEffect(() => {
    if (!liveCountry) return;

    const coords = countryCoords[liveCountry];
    if (!coords) return;

    const pulse = {
      id: crypto.randomUUID(),
      coords,
    };

    setPulses((prev) => [...prev, pulse]);

    setTimeout(() => {
      setPulses((prev) => prev.filter((p) => p.id !== pulse.id));
    }, 3000);
  }, [liveCountry]);

  return (
    <div className="w-full h-full">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 160 }}
        width={900}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>

        {data.map((country) => {
          const coords = countryCoords[country.country];
          if (!coords) return null;

          return (
            <Marker key={country.country} coordinates={coords}>
              <circle r={4} fill="#3b82f6" />
            </Marker>
          );
        })}

        {pulses.map((pulse) => (
          <Marker key={pulse.id} coordinates={pulse.coords}>
            <motion.circle
              r={6}
              fill="#3b82f6"
              opacity={0.4}
              animate={{
                r: [6, 25],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 2,
                ease: "easeOut",
              }}
            />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
