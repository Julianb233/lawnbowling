"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type OnboardingFlow = "player" | "drawmaster" | "admin_wizard";

interface OnboardingState {
  player: boolean;
  player_dismiss_count: number;
  drawmaster: boolean;
  drawmaster_dismiss_count: number;
  admin_wizard_step: number | null;
}

const DEFAULT_STATE: OnboardingState = {
  player: false,
  player_dismiss_count: 0,
  drawmaster: false,
  drawmaster_dismiss_count: 0,
  admin_wizard_step: null,
};

const LOCAL_STORAGE_KEY = "onboarding_state";

function getLocalState(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) return { ...DEFAULT_STATE, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULT_STATE;
}

function setLocalState(state: OnboardingState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useOnboarding(flow: OnboardingFlow) {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load state from Supabase or localStorage
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (cancelled) return;

      if (user) {
        setUserId(user.id);
        const { data: player } = await supabase
          .from("players")
          .select("onboarding_state")
          .eq("user_id", user.id)
          .single();

        if (!cancelled) {
          if (player?.onboarding_state) {
            const merged = { ...DEFAULT_STATE, ...player.onboarding_state };
            setState(merged);
            setLocalState(merged);
          } else {
            setState(getLocalState());
          }
          setLoading(false);
        }
      } else {
        setState(getLocalState());
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const persistState = useCallback(async (newState: OnboardingState) => {
    setLocalState(newState);
    if (userId) {
      const supabase = createClient();
      await supabase
        .from("players")
        .update({ onboarding_state: newState })
        .eq("user_id", userId);
    }
  }, [userId]);

  const isComplete = flow === "admin_wizard"
    ? state.admin_wizard_step === -1 // -1 means wizard completed
    : state[flow] === true;

  const isDismissedPermanently = (() => {
    if (flow === "admin_wizard") return false;
    const dismissKey = `${flow}_dismiss_count` as keyof OnboardingState;
    return (state[dismissKey] as number) >= 2;
  })();

  const shouldShow = !loading && !isComplete && !isDismissedPermanently;

  const markComplete = useCallback(async () => {
    const newState = { ...state };
    if (flow === "admin_wizard") {
      newState.admin_wizard_step = -1;
    } else {
      newState[flow] = true;
    }
    setState(newState);
    await persistState(newState);
  }, [state, flow, persistState]);

  const dismiss = useCallback(async () => {
    const newState = { ...state };
    if (flow !== "admin_wizard") {
      const key = `${flow}_dismiss_count` as "player_dismiss_count" | "drawmaster_dismiss_count";
      newState[key] = (newState[key] || 0) + 1;
    }
    setState(newState);
    await persistState(newState);
  }, [state, flow, persistState]);

  const resetFlow = useCallback(async () => {
    const newState = { ...state };
    if (flow === "admin_wizard") {
      newState.admin_wizard_step = null;
    } else {
      newState[flow] = false;
      const key = `${flow}_dismiss_count` as "player_dismiss_count" | "drawmaster_dismiss_count";
      newState[key] = 0;
    }
    setState(newState);
    await persistState(newState);
  }, [state, flow, persistState]);

  const setWizardStep = useCallback(async (step: number) => {
    const newState = { ...state, admin_wizard_step: step };
    setState(newState);
    await persistState(newState);
  }, [state, persistState]);

  return {
    isComplete,
    shouldShow,
    loading,
    markComplete,
    dismiss,
    resetFlow,
    wizardStep: state.admin_wizard_step,
    setWizardStep,
  };
}
