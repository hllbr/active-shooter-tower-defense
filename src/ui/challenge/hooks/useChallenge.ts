import { useContext } from 'react';
import { ChallengeContext } from '../context/ChallengeContext';

export function useChallenge() {
  return useContext(ChallengeContext);
} 