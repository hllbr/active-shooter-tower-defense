// Enhanced Audio System
export { enhancedAudioManager, updateSFXVolume, updateMusicVolume, toggleMute, getAudioState, forceVolumeUpdate } from './EnhancedAudioManager';

// Legacy exports for backward compatibility
export { playSound, playSoundForTest, playContextualSound, updateAllSoundVolumes } from './soundEffects';
export { musicManager, startBackgroundMusic, stopBackgroundMusic, transitionMusic, getMusicStatus, updateMusicSettings } from './musicManager';

// Convenience exports
export const playTowerBuildSound = () => import('./soundEffects').then(m => m.playTowerBuildSound());
export const playTowerUpgradeSound = () => import('./soundEffects').then(m => m.playTowerUpgradeSound());
export const playDeathSound = () => import('./soundEffects').then(m => m.playDeathSound());
export const playVictorySound = () => import('./soundEffects').then(m => m.playVictorySound());
export const playDefeatSound = () => import('./soundEffects').then(m => m.playDefeatSound());
export const playPurchaseSound = () => import('./soundEffects').then(m => m.playPurchaseSound());
export const playUnlockSound = () => import('./soundEffects').then(m => m.playUnlockSound());
export const playDiceRollSound = () => import('./soundEffects').then(m => m.playDiceRollSound());
