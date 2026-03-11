export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "wins" | "social" | "tournament" | "skill";
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Wins
  { id: "first_win", name: "First Win", description: "Win your first match", icon: "🏆", category: "wins" },
  { id: "10_wins", name: "Ten Timer", description: "Win 10 matches", icon: "🔥", category: "wins" },
  { id: "50_wins", name: "Half Century", description: "Win 50 matches", icon: "⭐", category: "wins" },
  { id: "100_wins", name: "Centurion", description: "Win 100 matches", icon: "💎", category: "wins" },
  { id: "hat_trick", name: "Hat Trick", description: "Win 3 matches in a row", icon: "🎩", category: "wins" },

  // Skill
  { id: "perfect_end", name: "Perfect End", description: "Score 8 shots in a single end", icon: "🎯", category: "skill" },

  // Tournament
  { id: "first_tournament", name: "First Tournament", description: "Compete in your first tournament", icon: "🏅", category: "tournament" },
  { id: "tournament_organizer", name: "Tournament Organizer", description: "Organize a tournament", icon: "📋", category: "tournament" },

  // Social
  { id: "social_butterfly", name: "Social Butterfly", description: "Add 10 friends", icon: "🦋", category: "social" },
  { id: "club_member", name: "Club Member", description: "Join a team", icon: "🤝", category: "social" },
];

export const ACHIEVEMENTS_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export interface PlayerAchievement {
  id: string;
  player_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface PlayerAchievementWithDef extends PlayerAchievement {
  achievement: AchievementDef;
}
