"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function GeoMap({ data }: any) {
  const clicksMap: Record<string, number> = {};

  data.forEach((c: any) => {
    clicksMap[c.country] = c.clicks;
  });

  const getColor = (countryCode: string) => {
    const clicks = clicksMap[countryCode];

    if (!clicks) return "#111827";
    if (clicks < 3) return "#60a5fa";
    if (clicks < 10) return "#3b82f6";
    return "#1d4ed8";
  };

  return (
    <ComposableMap projectionConfig={{ scale: 160 }}>
      <Geographies geography={geoUrl}>
        {({ geographies }: any) =>
          geographies.map((geo: any) => {
            const code = geo.properties.ISO_A2;

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={getColor(code)}
                stroke="#1f2937"
                strokeWidth={0.5}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}
