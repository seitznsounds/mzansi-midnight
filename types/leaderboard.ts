import { EndingId, GameState } from './game';

export type LeaderboardTab = 'apex' | 'speedrun' | 'completionist' | 'regional';

export interface LeaderboardEntry {
  id: string;
  userId?: string;
  userEmail?: string;
  playerName: string;
  playerAvatar?: string;
  score: number;
  rankTitle: string;
  storyId: string;
  storyName: string;
  endingId: EndingId;
  endingTitle: string;
  completionSeconds: number; // Real-world elapsed speedrun time in seconds
  completionCycles: number; // In-game cycles/days survived
  endingsUnlockedCount: number; // Out of 25 total endings
  keystonesCount: number; // Out of 4 federal keystones
  composure: number;
  cash: number;
  isVerifiedCloud: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isGuest: boolean;
  totalRunsCompleted: number;
  highestScore: number;
  fastestRunSeconds: number;
  unlockedEndingsCount: number;
  lastSyncedAt?: string;
  customCallsign?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'speedrun' | 'completion' | 'mastery' | 'story';
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ScoreBreakdown {
  baseVictory: number;
  speedrunBonus: number;
  cycleEfficiency: number;
  composureBonus: number;
  cashRetained: number;
  evidenceKeystones: number;
  anthologyCompletion: number;
}

export interface ComprehensiveScoreResult {
  totalScore: number;
  rankTitle: string;
  rankGrade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  globalPercentile: number;
  breakdown: ScoreBreakdown;
  commendations: {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
  }[];
}
