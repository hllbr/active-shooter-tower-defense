import type { StateCreator } from 'zustand';
import type { Store } from '../index';

export interface MissionSlice {
  completeMission: (missionId: string) => void;
  isMissionCompleted: (missionId: string) => boolean;
}

export const createMissionSlice: StateCreator<Store, [], [], MissionSlice> = (set, get) => ({
  completeMission: (missionId) => set((state: Store) => {
    if (state.completedMissions.includes(missionId)) return {};
    return { completedMissions: [...state.completedMissions, missionId] };
  }),
  isMissionCompleted: (missionId) => {
    return get().completedMissions.includes(missionId);
  }
});
