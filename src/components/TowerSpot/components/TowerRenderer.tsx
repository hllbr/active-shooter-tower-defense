import React from 'react';
import type { TowerRenderProps } from '../types';
import {
  TowerLevel1Renderer,
  TowerLevel2Renderer,
  TowerLevel3Renderer,
  TowerLevel4Renderer,
  TowerLevel5Renderer,
  TowerLevel6PlusRenderer
} from './index';

export const TowerRenderer: React.FC<TowerRenderProps> = ({ slot, towerLevel }) => {
  // Level 1: Rustic Wooden Watchtower
  if (towerLevel === 1) {
    return <TowerLevel1Renderer slot={slot} towerLevel={towerLevel} />;
  }
  
  // Level 2: Medieval Stone Fortress
  if (towerLevel === 2) {
    return <TowerLevel2Renderer slot={slot} towerLevel={towerLevel} />;
  }
  
  // Level 3: Bronze Age Fortress
  if (towerLevel === 3) {
    return <TowerLevel3Renderer slot={slot} towerLevel={towerLevel} />;
  }
  
  // Level 4: Iron Age Stronghold
  if (towerLevel === 4) {
    return <TowerLevel4Renderer slot={slot} towerLevel={towerLevel} />;
  }
  
  // Level 5: Crystal Tower
  if (towerLevel === 5) {
    return <TowerLevel5Renderer slot={slot} towerLevel={towerLevel} />;
  }
  
  // Level 6+: Majestic Palace Tower (Enhanced)
  return <TowerLevel6PlusRenderer slot={slot} towerLevel={towerLevel} />;
}; 