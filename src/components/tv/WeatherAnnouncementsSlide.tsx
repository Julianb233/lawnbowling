"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain,
  Snowflake, CloudLightning, CloudSnow, Thermometer, Wind, type LucideIcon,
} from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  Icon: LucideIcon;
  windSpeed: number;
}

export interface Announcement {
  id: string;
  message: string;
  active: boolean;
  created_at: string;
}

interface WeatherAnnouncementsSlideProps {
  announcements: Announcement[];
}

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

export default function WeatherAnnouncementsSlide({ announcements }: WeatherAnnouncementsSlideProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit`
      );
      if (!res.ok) return;
      const data = await res.json();
      const current = data.current;
      const { condition, Icon } = weatherCodeToCondition(current.weather_code);
      setWeather({
        temperature: Math.round(current.temperature_2m),
        condition,
        Icon,
        windSpeed: Math.round(current.wind_speed_10m),
      });
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    const lat = 33.77;
    const lng = -118.19;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(lat, lng),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(lat, lng);
    }
  }, [fetchWeather]);

  const activeAnnouncements = announcements.filter((a) => a.active);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-[clamp(2rem,4vh,4rem)] px-[clamp(2rem,4vw,6rem)]">
      {weather && (
        <div className="flex items-center gap-[clamp(1rem,3vw,3rem)]">
          {weather.Icon && (
            <weather.Icon
              className="text-white"
              style={{ width: "clamp(4rem, 8vw, 8rem)", height: "clamp(4rem, 8vw, 8rem)" }}
              strokeWidth={1.2}
            />
          )}
          <div>
            <p className="text-[clamp(3rem,8vw,7rem)] font-black tabular-nums leading-none text-white">
              {weather.temperature}°F
            </p>
            <p className="mt-1 text-[clamp(1rem,2vw,1.5rem)] text-zinc-400">
              {weather.condition}
            </p>
          </div>
          <div className="ml-[clamp(1rem,2vw,3rem)] flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-800/50 px-[clamp(0.75rem,1.5vw,1.5rem)] py-[clamp(0.5rem,1vh,1rem)]">
            <Wind className="text-zinc-400" style={{ width: "clamp(1.5rem, 2vw, 2rem)", height: "clamp(1.5rem, 2vw, 2rem)" }} />
            <div>
              <p className="text-[clamp(1.25rem,2.5vw,2rem)] font-black tabular-nums text-white">{weather.windSpeed}</p>
              <p className="text-[clamp(0.6rem,1vw,0.75rem)] uppercase tracking-wider text-zinc-500">mph wind</p>
            </div>
          </div>
        </div>
      )}

      {activeAnnouncements.length > 0 && (
        <div className="w-full max-w-4xl space-y-[clamp(0.5rem,1vh,1rem)]">
          <h3 className="text-[clamp(0.7rem,1.2vw,1rem)] font-bold uppercase tracking-widest text-emerald-400">
            Announcements
          </h3>
          {activeAnnouncements.map((a) => (
            <div key={a.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-[clamp(1rem,2vw,2rem)] py-[clamp(0.75rem,1.5vh,1.25rem)]">
              <p className="text-[clamp(1rem,2vw,1.5rem)] font-semibold text-white">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {!weather && activeAnnouncements.length === 0 && (
        <p className="text-[clamp(1rem,2vw,1.5rem)] text-zinc-500">Weather data loading...</p>
      )}
    </div>
  );
}
