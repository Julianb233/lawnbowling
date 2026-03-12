"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { ClubProfileStep } from "./wizard/ClubProfileStep";
import { GreensSetupStep } from "./wizard/GreensSetupStep";
import { MemberImportStep } from "./wizard/MemberImportStep";
import { FirstTournamentStep } from "./wizard/FirstTournamentStep";
import { DoneStep } from "./wizard/DoneStep";

interface Green {
  name: string;
  rinkCount: number;
}

interface Member {
  name: string;
  email: string;
}

const WIZARD_STEPS = [
  { label: "Club Profile", key: "profile" },
  { label: "Greens", key: "greens" },
  { label: "Members", key: "members" },
  { label: "Tournament", key: "tournament" },
  { label: "Done", key: "done" },
] as const;

interface AdminWizardProps {
  onComplete: () => void;
}

export function AdminWizard({ onComplete }: AdminWizardProps) {
  const { markComplete, setWizardStep, wizardStep } = useOnboarding("admin_wizard");
  const prefersReducedMotion = useReducedMotion();

  const initialStep = wizardStep !== null && wizardStep >= 0 ? wizardStep : 0;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [clubProfile, setClubProfile] = useState({
    name: "",
    address: "",
    contactEmail: "",
    logoUrl: "",
  });
  const [greens, setGreens] = useState<Green[]>([{ name: "Green 1", rinkCount: 6 }]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tournament, setTournament] = useState({ name: "", date: "" });
  const [tournamentSkipped, setTournamentSkipped] = useState(false);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      switch (step) {
        case 0: // Club Profile
          if (!clubProfile.name.trim()) newErrors.name = "Club name is required";
          if (!clubProfile.address.trim()) newErrors.address = "Address is required";
          if (!clubProfile.contactEmail.trim()) {
            newErrors.contactEmail = "Contact email is required";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clubProfile.contactEmail)) {
            newErrors.contactEmail = "Please enter a valid email address";
          }
          break;
        case 1: // Greens
          if (greens.length === 0) {
            newErrors.greens = "Add at least one green";
          } else if (greens.some((g) => !g.name.trim())) {
            newErrors.greens = "All greens must have a name";
          }
          break;
        case 2: // Members
          if (members.length === 0) {
            newErrors.members = "Add at least one member to continue";
          } else if (members.some((m) => !m.name.trim())) {
            newErrors.members = "All members must have a name";
          }
          break;
        case 3: // Tournament (skippable, no validation)
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [clubProfile, greens, members]
  );

  function handleNext() {
    if (currentStep === WIZARD_STEPS.length - 1) {
      // Done step - complete wizard
      markComplete();
      onComplete();
      return;
    }

    if (!validateStep(currentStep)) return;

    const next = currentStep + 1;
    setCurrentStep(next);
    setWizardStep(next);
    setErrors({});
  }

  function handleBack() {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setErrors({});
    }
  }

  function handleSkipTournament() {
    setTournamentSkipped(true);
    const next = currentStep + 1;
    setCurrentStep(next);
    setWizardStep(next);
  }

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const isDone = currentStep === WIZARD_STEPS.length - 1;

  const slideVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, x: 60 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -60 },
      };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-[#3D5A3E]">
          <span>Setup Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#0A2E12]/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        {/* Step labels */}
        <div className="mt-3 flex justify-between">
          {WIZARD_STEPS.map((step, i) => (
            <span
              key={step.key}
              className={`text-xs font-medium ${
                i <= currentStep ? "text-green-600" : "text-[#3D5A3E]"
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {currentStep === 0 && (
            <ClubProfileStep
              data={clubProfile}
              onChange={setClubProfile}
              errors={errors}
            />
          )}
          {currentStep === 1 && (
            <GreensSetupStep
              greens={greens}
              onChange={setGreens}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <MemberImportStep
              members={members}
              onChange={setMembers}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <FirstTournamentStep
              data={tournament}
              onChange={setTournament}
              skippable
              onSkip={handleSkipTournament}
            />
          )}
          {currentStep === 4 && (
            <DoneStep
              completedItems={{
                clubProfile: !!clubProfile.name,
                greens: greens.length > 0,
                members: members.length > 0,
                tournament: !tournamentSkipped && !!tournament.name,
              }}
              clubName={clubProfile.name || "Your Club"}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center gap-1 rounded-xl px-5 py-3 text-sm font-medium text-[#3D5A3E] hover:text-[#2D4A30] disabled:invisible transition-colors min-h-[48px]"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-700 px-8 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-green-500/25 transition-all min-h-[48px]"
        >
          {isDone ? "Finish Setup" : "Continue"}{" "}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
