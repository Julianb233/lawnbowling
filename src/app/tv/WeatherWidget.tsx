"use client";

import { useState, useEffect, useCallback } from "react";
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, Snowflake, CloudLightning, CloudSnow, Thermometer, type LucideIcon } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  Icon: LucideIcon;
  windSpeed: number;
}

const FALLBACK_LAT = 33.77;
const FALLBACK_LNG = -118.19;
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

function weatherCodeToCondition(code: number): { condition: string; Icon: LucideIcon } {
  if (code === 0) return { condition: "Clear", Icon: Sun };
  if (code === 1) return { condition: "Mostly Clear", Icon: CloudSun };
  if (code === 2) return { condition: "Partly Cloudy", Icon: CloudSun };
  if (code === 3) return { condition: "Overcast", Icon: Cloud };
  if (code >= 45 && code <= 48) return { condition: "Foggy", Icon: CloudFog };
  if (code >= 51 && code <= 55) return { condition: "Drizzle", Icon: CloudDrizzle };
  if (code >= 56 && code <= 57) return { condition: "Freezing Drizzle", Icon: CloudRain };
  if (code >= 61 && code <= 65) return { condition: "Rain", Icon: CloudRain };
  if (code >= 66 && code <= 67) return { condition: "Freezing Rain", Icon: CloudRain };
  if (code >= 71 && code <= 77) return { condition: "Snow", Icon: Snowflake };
  if (code >= 80 && code <= 82) return { condition: "Showers", Icon: CloudRain };
  if (code >= 85 && code <= 86) return { condition: "Snow Showers", Icon: CloudSnow };
  if (code >= 95 && code <= 99) return { condition: "Thunderstorm", Icon: CloudLightning };
  return { condition: "Unknown", Icon: Thermometer };
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit`
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const current = data.current;
      const { condition, Icon } = weatherCodeToCondition(current.weather_code);
      setWeather({
        temperature: Math.round(current.temperature_2m),
        condition,
        Icon,
        windSpeed: Math.round(current.wind_speed_10m),
      });
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    function startFetching(lat: number, lng: number) {
      fetchWeather(lat, lng);
      intervalId = setInterval(() => fetchWeather(lat, lng), REFRESH_INTERVAL);
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => startFetching(pos.coords.latitude, pos.coords.longitude),
        () => startFetching(FALLBACK_LAT, FALLBACK_LNG),
        { timeout: 5000 }
      );
    } else {
      startFetching(FALLBACK_LAT, FALLBACK_LNG);
    }

    return () => clearInterval(intervalId);
  }, [fetchWeather]);

  if (error || !weather) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0A2E12]/50 px-4 py-2">
      {weather.Icon && <weather.Icon className="w-6 h-6 text-white" strokeWidth={1.5} />}
      <div className="text-right">
        <p className="text-lg font-black tabular-nums leading-tight">
          {weather.temperature}°F
        </p>
        <p className="text-[11px] text-[#3D5A3E] leading-tight">
          {weather.condition} · {weather.windSpeed} mph
        </p>
      </div>
    </div>
  );
}
