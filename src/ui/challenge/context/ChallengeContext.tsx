import { createContext } from 'react';

export interface Challenge {
  id: number;
  text: string;
  type: 'build' | 'wave' | 'upgrade' | 'enemy' | 'boss';
  target: number;
  progress: number;
  completed: boolean;
  reward: Reward;
  weekly?: boolean;
}

export type Reward = { type: 'gold'; amount: number } | { type: 'skin'; name: string } | { type: 'tower'; towerType: string };

interface ClaimedRewardHistoryItem {
  id: number;
  date: number;
  reward: Reward;
}

interface ChallengeContextType {
  challenges: Challenge[];
  incrementChallenge: (type: Challenge['type']) => void;
  completeChallenge: (id: number) => void;
  claimReward: (id: number) => void;
  claimedRewards: number[];
  claimedRewardHistory: ClaimedRewardHistoryItem[];
}

export const ChallengeContext = createContext<ChallengeContextType>({
  challenges: [],
  incrementChallenge: () => {},
  completeChallenge: () => {},
  claimReward: () => {},
  claimedRewards: [],
  claimedRewardHistory: [],
});

export type { ClaimedRewardHistoryItem, ChallengeContextType }; 