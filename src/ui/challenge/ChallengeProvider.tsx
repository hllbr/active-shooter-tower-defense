import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useGameStore } from '../../models/store';
import { differenceInDays, differenceInWeeks, startOfDay, startOfWeek } from 'date-fns';
import { ChallengeContext, type Challenge, type ClaimedRewardHistoryItem } from './context/ChallengeContext';

// Challenge havuzu (daha fazla görev eklenebilir)
const challengePool: Challenge[] = [
  { id: 1, text: '10 kule inşa et', type: 'build', target: 10, progress: 0, completed: false, reward: { type: 'gold', amount: 500 } },
  { id: 2, text: '3 dalga tamamla', type: 'wave', target: 3, progress: 0, completed: false, reward: { type: 'gold', amount: 300 } },
  { id: 3, text: 'Bir kuleyi 3. seviyeye yükselt', type: 'upgrade', target: 1, progress: 0, completed: false, reward: { type: 'skin', name: 'Electric Aura' } },
  { id: 4, text: '20 düşman yok et', type: 'enemy', target: 20, progress: 0, completed: false, reward: { type: 'gold', amount: 400 } },
  { id: 5, text: '1 boss yok et', type: 'boss', target: 1, progress: 0, completed: false, reward: { type: 'tower', towerType: 'Artillery' } },
  { id: 6, text: 'Hafta boyunca 100 düşman yok et', type: 'enemy', target: 100, progress: 0, completed: false, reward: { type: 'gold', amount: 2000 }, weekly: true },
  { id: 7, text: '5 kule yükselt', type: 'upgrade', target: 5, progress: 0, completed: false, reward: { type: 'gold', amount: 800 } },
  { id: 8, text: 'Bir kuleyi 5. seviyeye yükselt', type: 'upgrade', target: 1, progress: 0, completed: false, reward: { type: 'skin', name: 'Fire Aura' } },
  { id: 9, text: 'Bir dalgada hiç kule kaybetmeden tamamla', type: 'wave', target: 1, progress: 0, completed: false, reward: { type: 'gold', amount: 600 } },
  { id: 10, text: 'Bir oyunda 3 farklı kule türü inşa et', type: 'build', target: 3, progress: 0, completed: false, reward: { type: 'tower', towerType: 'Mage' } },
];

const getRandomChallenges = (pool: Challenge[], count: number, filter?: (c: Challenge) => boolean) => {
  const filtered = filter ? pool.filter(c => filter(c) === true) : pool;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(c => ({ ...c, progress: 0, completed: false }));
}

const getInitialChallenges = () => {
  const saved = localStorage.getItem('challenges');
  const lastReset = localStorage.getItem('lastChallengeReset');
  const now = Date.now();
  let daily: Challenge[] = [];
  let weekly: Challenge[] = [];
  let needsReset = false;
  if (saved && lastReset) {
    const parsed: Challenge[] = JSON.parse(saved);
    const parsedLast = parseInt(lastReset, 10);
    const days = differenceInDays(startOfDay(now), startOfDay(parsedLast));
    const weeks = differenceInWeeks(startOfWeek(now), startOfWeek(parsedLast));
    daily = parsed.filter(c => !c.weekly);
    weekly = parsed.filter(c => c.weekly);
    if (days >= 1) needsReset = true;
    if (weeks >= 1) needsReset = true;
  } else {
    needsReset = true;
  }
  if (needsReset) {
    daily = getRandomChallenges(challengePool, 3, c => c.weekly === false || c.weekly === undefined);
    weekly = getRandomChallenges(challengePool, 1, c => c.weekly === true);
    localStorage.setItem('challenges', JSON.stringify([...daily, ...weekly]));
    localStorage.setItem('lastChallengeReset', now.toString());
  }
  return [...daily, ...weekly];
}

export const ChallengeProvider = ({ children }: { children: React.ReactNode }) => {
  const [challenges, setChallenges] = useState<Challenge[]>(getInitialChallenges());
  const [claimedRewards, setClaimedRewards] = useState<number[]>(() => {
    const saved = localStorage.getItem('claimedRewards');
    return saved ? JSON.parse(saved) : [];
  });
  const [claimedRewardHistory, setClaimedRewardHistory] = useState<ClaimedRewardHistoryItem[]>(() => {
    const saved = localStorage.getItem('claimedRewardHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const addGold = useGameStore(s => s.addGold);
  const unlockSkin = useGameStore(s => s.unlockSkin);
  const unlockTowerType = useGameStore(s => s.unlockTowerType);

  useEffect(() => {
    localStorage.setItem('claimedRewards', JSON.stringify(claimedRewards));
  }, [claimedRewards]);
  useEffect(() => {
    localStorage.setItem('claimedRewardHistory', JSON.stringify(claimedRewardHistory));
  }, [claimedRewardHistory]);
  useEffect(() => {
    // Her mount'ta günlük/haftalık görev reset kontrolü
    const lastReset = localStorage.getItem('lastChallengeReset');
    const now = Date.now();
    let needsReset = false;
    if (lastReset) {
      const days = differenceInDays(startOfDay(now), startOfDay(parseInt(lastReset, 10)));
      const weeks = differenceInWeeks(startOfWeek(now), startOfWeek(parseInt(lastReset, 10)));
      if (days >= 1) needsReset = true;
      if (weeks >= 1) needsReset = true;
    } else {
      needsReset = true;
    }
    if (needsReset) {
      const daily = getRandomChallenges(challengePool, 3, c => c.weekly === false || c.weekly === undefined);
      const weekly = getRandomChallenges(challengePool, 1, c => c.weekly === true);
      setChallenges([...daily, ...weekly]);
      localStorage.setItem('challenges', JSON.stringify([...daily, ...weekly]));
      localStorage.setItem('lastChallengeReset', now.toString());
    }
  }, []);

  const incrementChallenge = (type: Challenge['type']) => {
    setChallenges(challenges => challenges.map(c => {
      if (c.type === type && !c.completed) {
        const newProgress = c.progress + 1;
        if (newProgress >= c.target) {
          return { ...c, progress: c.target, completed: true };
        }
        return { ...c, progress: newProgress };
      }
      return c;
    }));
  };

  const completeChallenge = (id: number) => {
    setChallenges(challenges => challenges.map(c => c.id === id ? { ...c, completed: true, progress: c.target } : c));
  };

  const claimReward = (id: number) => {
    setClaimedRewards(rewards => [...rewards, id]);
    const challenge = challenges.find(c => c.id === id);
    if (!challenge) return;
    setClaimedRewardHistory(history => [...history, { id, date: Date.now(), reward: challenge.reward }]);
    if (challenge.reward.type === 'gold') {
      addGold(challenge.reward.amount);
    }
    if (challenge.reward.type === 'skin') {
      unlockSkin(challenge.reward.name);
    }
    if (challenge.reward.type === 'tower') {
      unlockTowerType(challenge.reward.towerType);
    }
  };

  return (
    <ChallengeContext.Provider value={{ challenges, incrementChallenge, completeChallenge, claimReward, claimedRewards, claimedRewardHistory }}>
      {children}
    </ChallengeContext.Provider>
  );
}; 