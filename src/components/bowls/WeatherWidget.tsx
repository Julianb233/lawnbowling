"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
}

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "sun" },
  1: { label: "Mainly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Foggy", icon: "cloud" },
  48: { label: "Fog (rime)", icon: "cloud" },
  51: { label: "Light drizzle", icon: "cloud-drizzle" },
  53: { label: "Moderate drizzle", icon: "cloud-drizzle" },
  55: { label: "Dense drizzle", icon: "cloud-drizzle" },
  61: { label: "Slight rain", icon: "cloud-rain" },
  63: { label: "Moderate rain", icon: "cloud-rain" },
  65: { label: "Heavy rain", icon: "cloud-rain" },
  71: { label: "Slight snow", icon: "cloud-snow" },
  73: { label: "Moderate snow", icon: "cloud-snow" },
  75: { label: "Heavy snow", icon: "cloud-snow" },
  80: { label: "Slight showers", icon: "cloud-rain" },
  81: { label: "Moderate showers", icon: "cloud-rain" },
  82: { label: "Violent showers", icon: "cloud-rain" },
  95: { label: "Thunderstorm", icon: "cloud-lightning" },
  96: { label: "T-storm w/ hail", icon: "cloud-lightning" },
  99: { label: "T-storm w/ heavy hail", icon: "cloud-lightning" },
};

function getWindDirectionLabel(degrees: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(degrees / 45) % 8];
}

function getWindWarning(speedKmh: number): string | null {
  if (speedKmh >= 40) return "Strong winds - play may be affected";
  if (speedKmh >= 25) return "Moderate wind - adjust your line";
  return null;
}

function WeatherIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const cls = cn("stroke-current", className);
  switch (type) {
    case "sun":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cls}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    case "cloud-sun":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cls}
        >
          <path d="M12 2v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="M20 12h2" />
          <path d="m19.07 4.93-1.41 1.41" />
          <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" />
          <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
        </svg>
      );
    case "cloud":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cls}
        >
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );
    case "cloud-drizzle":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cls}
        >
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M8 19v1" />
          <path d="M8 14v1" />
          <path d="M16 19v1" />
          <path d="M16 14v1" />
          <path d="M12 21v1" />
          <path d="M12 16v1" />
        </svg>
      );
    case "cloud-rain":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cls}
        >
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M16 14v6" />
          <path d="M8 14v6" />
          <path d="M12 16v6" />
        </svg>
      );
    case "cloud-snow":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cls}
        >
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M8 15h.01" />
          <path d="M8 19h.01" />
          <path d="M12 17h.01" />
          <path d="M12 21h.01" />
          <path d="M16 15h.01" />
          <path d="M16 19h.01" />
        </svg>
      );
    case "cloud-lightning":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cls}
        >
          <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
          <path d="m13 12-3 5h4l-3 5" />
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cls}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
  }
}

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  className?: string;
  compact?: boolean;
}

export function WeatherWidget({
  latitude,
  longitude,
  className,
  compact = false,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = useCallback(
    async (lat: number, lon: number) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather API error");
        const data = await res.json();

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          windDirection: data.current.wind_direction_10m,
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1,
        });
        setLoading(false);
      } catch {
        setError("Unable to load weather");
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      fetchWeather(latitude, longitude);
      setLocationName("Club Location");
      return;
    }

    // Try geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
          setLocationName("Current Location");
        },
        () => {
          // Default to a common lawn bowling location (Long Beach, CA)
          fetchWeather(33.77, -118.19);
          setLocationName("Long Beach, CA");
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(33.77, -118.19);
      setLocationName("Long Beach, CA");
    }
  }, [latitude, longitude, fetchWeather]);

  // Refresh every 10 minutes
  useEffect(() => {
    if (!weather) return;
    const interval = setInterval(() => {
      if (latitude !== undefined && longitude !== undefined) {
        fetchWeather(latitude, longitude);
      }
    }, 600000);
    return () => clearInterval(interval);
  }, [weather, latitude, longitude, fetchWeather]);

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-4",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-20 rounded skeleton" />
            <div className="h-3 w-32 rounded skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-4",
          className
        )}
      >
        <p className="text-sm text-zinc-400">
          {error ?? "Weather unavailable"}
        </p>
      </div>
    );
  }

  const weatherInfo = WMO_CODES[weather.weatherCode] ?? {
    label: "Unknown",
    icon: "sun",
  };
  const windWarning = getWindWarning(weather.windSpeed);
  const windDir = getWindDirectionLabel(weather.windDirection);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3",
          className
        )}
      >
        <WeatherIcon type={weatherInfo.icon} className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        <span className="text-lg font-bold text-zinc-900 tabular-nums">
          {weather.temperature}&deg;F
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Wind {weather.windSpeed} mph {windDir}
        </span>
        {windWarning && (
          <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            Windy
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden",
        className
      )}
    >
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
              <WeatherIcon
                type={weatherInfo.icon}
                className="h-8 w-8 text-sky-600"
              />
            </div>
            <div>
              <p className="text-3xl font-black text-zinc-900 tabular-nums">
                {weather.temperature}&deg;F
              </p>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {weatherInfo.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400">{locationName}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Wind info - critical for lawn bowling */}
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-400"
          >
            <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
            <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
            <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-700">
              Wind: {weather.windSpeed} mph {windDir}
            </p>
            <p className="text-xs text-zinc-400">
              Direction: {weather.windDirection}&deg;
            </p>
          </div>
          {/* Wind compass */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200"
            title={`Wind from ${windDir} (${weather.windDirection}°)`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-sky-500"
              style={{
                transform: `rotate(${weather.windDirection + 180}deg)`,
              }}
            >
              <path
                d="M12 2 L16 14 L12 11 L8 14 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* Wind warning for bowlers */}
        {windWarning && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-600 shrink-0"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <p className="text-xs font-medium text-amber-700">{windWarning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
