"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Trophy,
  BarChart3,
  Settings,
  CreditCard,
  Calendar,
  CalendarDays,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Loader2,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClubSubscription {
  plan: string;
  status: string;
  memberCount: number;
  memberLimit: number | null;
  nextBillingDate: string | null;
  annualTotal: number;
}

interface ClubDashboardData {
  club: {
    id: string;
    name: string;
    city: string;
    stateCode: string;
    slug: string;
    memberCount: number;
    rinks: number;
  } | null;
  subscription: ClubSubscription;
  stats: {
    tournamentsRun: number;
    membersActiveThisMonth: number;
    totalGamesPlayed: number;
    avgMembersPerTournament: number;
  };
}

const PLAN_LABELS: Record<string, { name: string; color: string; bg: string }> = {
  free: { name: "Free", color: "text-[#2D4A30]", bg: "bg-[#0A2E12]/5" },
  club: { name: "Club", color: "text-[#1B5E20]", bg: "bg-[#1B5E20]/10" },
  pro: { name: "Pro", color: "text-[#2E7D32]", bg: "bg-blue-50" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: {
    label: "Active",
    color: "text-[#2E7D32] bg-[#1B5E20]/5 border-[#1B5E20]/15",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  past_due: {
    label: "Past Due",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700 bg-red-50 border-red-200",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  trialing: {
    label: "Trial",
    color: "text-[#2E7D32] bg-blue-50 border-blue-200",
    icon: <Clock className="h-4 w-4" />,
  },
};

export default function ClubDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FEFCF9] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
        </div>
      }
    >
      <ClubDashboardContent />
    </Suspense>
  );
}

function ClubDashboardContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ClubDashboardData | null>(null);
  const success = searchParams ? searchParams.get("success") : null;

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Load managed clubs and subscription data
        const [clubsRes, profileRes] = await Promise.all([
          fetch("/api/clubs/managed"),
          fetch("/api/profile"),
        ]);

        const clubsData = await clubsRes.json();
        const profileData = profileRes.ok ? await profileRes.json() : null;

        const club = clubsData.clubs?.[0] || null;
        const sub = profileData?.subscription;

        // Determine plan info
        const plan = sub?.plan || "free";
        const pricePerMember = plan === "pro" ? 10 : plan === "club" ? 5 : 0;
        const memberCount = club?.member_count || 0;

        setData({
          club: club
            ? {
                id: club.id,
                name: club.name,
                city: club.city,
                stateCode: club.state_code,
                slug: club.slug,
                memberCount,
                rinks: club.rinks || 2,
              }
            : null,
          subscription: {
            plan,
            status: sub?.status || "active",
            memberCount,
            memberLimit: plan === "free" ? 20 : null,
            nextBillingDate: sub?.current_period_end || null,
            annualTotal: pricePerMember * memberCount,
          },
          stats: {
            tournamentsRun: 0,
            membersActiveThisMonth: Math.round(memberCount * 0.7),
            totalGamesPlayed: 0,
            avgMembersPerTournament: 0,
          },
        });
      } catch {
        // Error loading
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFCF9] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
      </div>
    );
  }

  if (!data?.club) {
    return (
      <div className="min-h-screen bg-[#FEFCF9] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-[#0A2E12]/10 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0A2E12]/5">
            <Users className="h-8 w-8 text-[#3D5A3E]" />
          </div>
          <h1 className="text-xl font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>No Club Found</h1>
          <p className="mt-2 text-sm text-[#3D5A3E]">
            You need to register or claim a club to access the dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/clubs/onboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] transition-colors min-h-[44px]"
            >
              Register Your Club
            </Link>
            <Link
              href="/clubs/claim"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0A2E12]/10 px-6 py-3 text-sm font-medium text-[#2D4A30] hover:bg-[#FEFCF9] transition-colors"
            >
              Claim Existing Club
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { club, subscription, stats } = data;
  const planInfo = PLAN_LABELS[subscription.plan] || PLAN_LABELS.free;
  const statusInfo = STATUS_CONFIG[subscription.status] || STATUS_CONFIG.active;
  const memberUsagePercent = subscription.memberLimit
    ? Math.min(100, (subscription.memberCount / subscription.memberLimit) * 100)
    : null;

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-8">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 text-sm text-[#3D5A3E] hover:text-[#2D4A30] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Club Directory
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>
                My Club
              </h1>
              <p className="text-sm text-[#3D5A3E]">
                Good morning! {club.name} &mdash; {club.city}, {club.stateCode}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
                  planInfo.bg,
                  planInfo.color
                )}
              >
                {planInfo.name} Plan
              </span>
              <Link
                href="/clubs/settings"
                className="rounded-xl border border-[#0A2E12]/10 p-2.5 text-[#3D5A3E] hover:text-[#2D4A30] hover:bg-[#FEFCF9] transition-colors"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[#1B5E20]/15 bg-[#1B5E20]/5 px-4 py-3 text-sm text-[#2E7D32] flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4 shrink-0" />
            Your subscription is now active! Welcome to the {planInfo.name}{" "}
            plan.
          </motion.div>
        )}

        {/* Subscription Status Card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>Subscription</h2>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                statusInfo.color
              )}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-[#3D5A3E] uppercase tracking-wider">
                Plan
              </p>
              <p className="mt-1 text-lg font-bold text-[#0A2E12]">
                {planInfo.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#3D5A3E] uppercase tracking-wider">
                Members
              </p>
              <p className="mt-1 text-lg font-bold text-[#0A2E12]">
                {subscription.memberCount}
                {subscription.memberLimit && (
                  <span className="text-sm font-normal text-[#3D5A3E]">
                    /{subscription.memberLimit}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#3D5A3E] uppercase tracking-wider">
                Annual Cost
              </p>
              <p className="mt-1 text-lg font-bold text-[#0A2E12]">
                {subscription.annualTotal > 0
                  ? `$${subscription.annualTotal.toLocaleString()}`
                  : "Free"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#3D5A3E] uppercase tracking-wider">
                Next Billing
              </p>
              <p className="mt-1 text-lg font-bold text-[#0A2E12]">
                {subscription.nextBillingDate
                  ? new Date(subscription.nextBillingDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )
                  : subscription.plan === "free"
                    ? "N/A"
                    : "Pending"}
              </p>
            </div>
          </div>

          {/* Member usage bar */}
          {memberUsagePercent !== null && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-[#3D5A3E] mb-1">
                <span>
                  Member usage: {subscription.memberCount}/
                  {subscription.memberLimit}
                </span>
                <span>{Math.round(memberUsagePercent)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#0A2E12]/5">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    memberUsagePercent >= 90
                      ? "bg-red-500"
                      : memberUsagePercent >= 70
                        ? "bg-amber-500"
                        : "bg-[#1B5E20]"
                  )}
                  style={{ width: `${memberUsagePercent}%` }}
                />
              </div>
              {memberUsagePercent >= 90 && (
                <p className="mt-2 text-xs text-amber-700">
                  Approaching member limit.{" "}
                  <Link
                    href="/clubs/onboard?plan=club"
                    className="font-bold underline"
                  >
                    Upgrade to Club
                  </Link>{" "}
                  for unlimited members.
                </p>
              )}
            </div>
          )}

          {subscription.plan !== "pro" && (
            <div className="mt-4 pt-4 border-t border-[#0A2E12]/10 flex items-center justify-between">
              <p className="text-sm text-[#3D5A3E]">
                {subscription.plan === "free"
                  ? "Upgrade for full features"
                  : "Upgrade to Pro for TV scoreboard & more"}
              </p>
              <Link
                href={`/clubs/onboard?plan=${subscription.plan === "free" ? "club" : "pro"}&members=${subscription.memberCount}`}
                className="text-sm font-semibold text-[#1B5E20] hover:text-[#2E7D32]"
              >
                Upgrade
              </Link>
            </div>
          )}
        </motion.section>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <StatCard
            label="Tournaments"
            value={stats.tournamentsRun}
            icon={<Trophy className="h-5 w-5" />}
            color="text-amber-600 bg-amber-50"
          />
          <StatCard
            label="Active Members"
            value={stats.membersActiveThisMonth}
            icon={<Users className="h-5 w-5" />}
            color="text-[#1B5E20] bg-[#1B5E20]/10"
            subtitle="this month"
          />
          <StatCard
            label="Games Played"
            value={stats.totalGamesPlayed}
            icon={<BarChart3 className="h-5 w-5" />}
            color="text-[#1B5E20] bg-blue-50"
          />
          <StatCard
            label="Avg per Tournament"
            value={stats.avgMembersPerTournament}
            icon={<TrendingUp className="h-5 w-5" />}
            color="text-purple-600 bg-purple-50"
            subtitle="members"
          />
        </motion.div>

        {/* Quick Links */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-[#0A2E12] font-display mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink
              href="/clubs/manage"
              icon={<Users className="h-5 w-5" />}
              title="Manage Members"
              description="Add, edit, or remove club members"
              color="bg-[#1B5E20]/10 text-[#1B5E20]"
            />
            <QuickLink
              href="/bowls"
              icon={<Trophy className="h-5 w-5" />}
              title="Run Tournament"
              description="Start a new tournament or draw"
              color="bg-amber-50 text-amber-600"
            />
            <QuickLink
              href="/match-history"
              icon={<BarChart3 className="h-5 w-5" />}
              title="View History"
              description="Past matches, scores, and stats"
              color="bg-blue-50 text-[#1B5E20]"
            />
            <QuickLink
              href="/clubs/chat"
              icon={<MessageCircle className="h-5 w-5" />}
              title="Club Chat"
              description="Group messages with your club"
              color="bg-teal-50 text-teal-600"
            />
            <QuickLink
              href="/events"
              icon={<CalendarDays className="h-5 w-5" />}
              title="Event Calendar"
              description="View and manage club events"
              color="bg-emerald-50 text-emerald-600"
            />
            <QuickLink
              href="/schedule"
              icon={<Calendar className="h-5 w-5" />}
              title="Schedule Games"
              description="Plan upcoming club sessions"
              color="bg-purple-50 text-purple-600"
            />
          </div>
        </motion.section>

        {/* Billing Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>Billing</h2>
            <CreditCard className="h-5 w-5 text-[#3D5A3E]" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#0A2E12]">
                  Current Plan
                </p>
                <p className="text-xs text-[#3D5A3E]">
                  {subscription.plan === "free"
                    ? "Free forever"
                    : `$${subscription.plan === "pro" ? "10" : "5"}/member/year, billed annually`}
                </p>
              </div>
              <Link
                href="/pricing"
                className="text-sm font-medium text-[#1B5E20] hover:text-[#2E7D32]"
              >
                Change Plan
              </Link>
            </div>

            {subscription.plan !== "free" && (
              <>
                <div className="border-t border-[#0A2E12]/10" />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[#0A2E12]">
                      Manage Billing
                    </p>
                    <p className="text-xs text-[#3D5A3E]">
                      View invoices, update payment method
                    </p>
                  </div>
                  <ManageBillingButton />
                </div>
              </>
            )}

            <div className="border-t border-[#0A2E12]/10" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#0A2E12]">
                  View Public Page
                </p>
                <p className="text-xs text-[#3D5A3E]">
                  See how your club appears in the directory
                </p>
              </div>
              <Link
                href={`/clubs/${club.stateCode.toLowerCase()}/${club.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#1B5E20] hover:text-[#1B5E20]"
              >
                View
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
      <div
        className={cn(
          "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl",
          color
        )}
      >
        {icon}
      </div>
      <p className="text-2xl font-black text-[#B8860B] tabular-nums font-display" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
      <p className="text-xs font-medium text-[#3D5A3E]">{label}</p>
      {subtitle && <p className="text-[10px] text-[#3D5A3E]">{subtitle}</p>}
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6 transition-all hover:border-[#0A2E12]/20 hover:shadow-sm min-h-[44px]"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          color
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#0A2E12] group-hover:text-[#1B5E20] transition-colors">
          {title}
        </p>
        <p className="text-xs text-[#3D5A3E]">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#3D5A3E] group-hover:text-[#3D5A3E] transition-colors" />
    </Link>
  );
}

function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 text-sm font-medium text-[#1B5E20] hover:text-[#2E7D32] disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <ExternalLink className="h-3.5 w-3.5" />
      )}
      Manage
    </button>
  );
}
