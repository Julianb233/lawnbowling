"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight, Loader2 } from "lucide-react";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

const ONBOARDING_STEPS = [
  {
    heading: "Welcome to LawnBowl",
    body: "Your all-in-one companion for lawn bowling. Track scores, join tournaments, and connect with your club -- all from one place.",
    image: "/images/scenery-golden-hour-green.jpg",
    imageAlt: "Lawn bowling green at golden hour",
  },
  {
    heading: "Find Your Club",
    body: "Join your local lawn bowling club, view match schedules, and stay connected with fellow bowlers in your community.",
    image: "/images/scenery-morning-dew-green.jpg",
    imageAlt: "Morning dew on the bowling green",
  },
  {
    heading: "Track Your Game",
    body: "Log your matches, track your stats, and watch your skills improve over time. Earn badges and climb the leaderboard.",
    image: "/images/scenery-clubhouse-dusk.jpg",
    imageAlt: "Bowling clubhouse at dusk",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  function handleNext() {
    if (isLastStep) {
      setLoading(true);
      router.push("/board");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleSkip() {
    setLoading(true);
    router.push("/board");
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#FEFCF9" }}>
      {/* Top bar with Skip */}
      <div className="flex items-center justify-between px-6 py-4">
        <Image
          src={bowlsIconImg}
          alt="LawnBowl"
          width={36}
          height={36}
          className="rounded-full"
        />
        <button
          onClick={handleSkip}
          className="text-sm font-medium min-h-[44px] px-3 flex items-center transition hover:opacity-70"
          style={{ color: "#3D5A3E" }}
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Illustration / Photo */}
          <div className="relative mx-auto mb-8 h-56 w-full overflow-hidden rounded-2xl shadow-lg">
            <Image
              src={step.image}
              alt={step.imageAlt}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2E12]/30 to-transparent" />
          </div>

          {/* Text */}
          <div className="text-center">
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              {step.heading}
            </h1>
            <p
              className="mt-4 text-base leading-relaxed"
              style={{ color: "#3D5A3E" }}
            >
              {step.body}
            </p>
          </div>

          {/* Pagination dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "w-8 bg-[#1B5E20]"
                    : "w-2 bg-[#0A2E12]/20"
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#145218] disabled:opacity-50 active:scale-[0.98] min-h-[44px]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isLastStep ? (
              "Get Started"
            ) : (
              <>
                Next
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
