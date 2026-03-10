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

    if (!clicks) return "#1f2937";
    if (clicks < 3) return "#60a5fa";
    if (clicks < 10) return "#3b82f6";
    return "#1d4ed8";
  };

  return (
    <ComposableMap
      projectionConfig={{ scale: 140 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }: { geographies: any[] }) =>
          geographies.map((geo: any) => {
            const code = geo.properties.ISO_A2;

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={getColor(code)}
                stroke="#374151"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: {
                    fill: "#4f46e5",
                    outline: "none",
                  },
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}
