import React from 'react';
import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { TowerSlot, Enemy } from '../models/gameTypes';
import { getNearestEnemy } from '../logic/TowerManager';

interface TowerSpotProps {
  slot: TowerSlot;
  slotIdx: number;
  onTowerDragStart?: (slotIdx: number, event: React.MouseEvent) => void;
  isDragTarget?: boolean;
  draggedTowerSlotIdx?: number | null;
}

export const TowerSpot: React.FC<TowerSpotProps> = ({ slot, slotIdx, onTowerDragStart, isDragTarget, draggedTowerSlotIdx }) => {
  const gold = useGameStore((s) => s.gold);
  const buildTower = useGameStore((s) => s.buildTower);
  const upgradeTower = useGameStore((s) => s.upgradeTower);
  const unlockSlot = useGameStore((s) => s.unlockSlot);
  const maxTowers = useGameStore((s) => s.maxTowers);
  const wallLevel = useGameStore((s) => s.wallLevel);
  const performTileAction = useGameStore(s => s.performTileAction);
  const energy = useGameStore(s => s.energy);
  const enemies = useGameStore(s => s.enemies);
  const towerSlots = useGameStore(s => s.towerSlots);
  
  // Animation States
  const unlockingSlots = useGameStore(s => s.unlockingSlots);
  // const recentlyUnlockedSlots = useGameStore(s => s.recentlyUnlockedSlots); // AŞAMA 3'te kullanılacak
  const isUnlocking = unlockingSlots.has(slotIdx);
  const recentlyUnlockedSlots = useGameStore(s => s.recentlyUnlockedSlots);
  const isRecentlyUnlocked = recentlyUnlockedSlots.has(slotIdx);
  
  const canBuild = slot.unlocked && !slot.tower &&
    gold >= GAME_CONSTANTS.TOWER_COST &&
    energy >= GAME_CONSTANTS.ENERGY_COSTS.buildTower &&
    towerSlots.filter(s => s.tower).length < maxTowers;

  // Slot unlock logic - ensure we get the right cost for each slot
  const unlockCost = GAME_CONSTANTS.TOWER_SLOT_UNLOCK_GOLD[slotIdx] ?? 2400;
  const canUnlock = !slot.unlocked &&
    gold >= unlockCost &&
    energy >= GAME_CONSTANTS.ENERGY_COSTS.buildTower;
  
  // Debug info for slot unlock (only log once when slot is locked)
  React.useEffect(() => {
    if (!slot.unlocked && slotIdx >= 4) { // Only debug paid slots
      console.log(`🔍 Slot ${slotIdx} unlock status:`, {
        slotIdx,
        unlocked: slot.unlocked,
        unlockCost,
        costArray: GAME_CONSTANTS.TOWER_SLOT_UNLOCK_GOLD,
        gold,
        energy,
        energyNeeded: GAME_CONSTANTS.ENERGY_COSTS.buildTower,
        canUnlock,
        hasEnoughGold: gold >= unlockCost,
        hasEnoughEnergy: energy >= GAME_CONSTANTS.ENERGY_COSTS.buildTower
      });
    }
  }, [slot.unlocked, slotIdx, canUnlock, energy, gold, unlockCost]);

  // Check if we should show build text - only show on empty slots when there are less than 2 towers total
  const totalTowers = towerSlots.filter(s => s.tower).length;
  const shouldShowBuildText = canBuild && totalTowers < 2;

  const [menuPos, setMenuPos] = React.useState<{x:number;y:number}|null>(null);
  
  // Get upgrade info for current tower
  const canUpgrade = slot.tower && slot.tower.level < GAME_CONSTANTS.TOWER_MAX_LEVEL;
  const upgradeInfo = canUpgrade && slot.tower ? GAME_CONSTANTS.TOWER_UPGRADES[slot.tower.level] : null;
  const energyCost = GAME_CONSTANTS.ENERGY_COSTS.upgradeTower;
  const hasEnoughGold = upgradeInfo ? gold >= upgradeInfo.cost : false;
  const hasEnoughEnergy = energy >= energyCost;
  const canAffordUpgrade = upgradeInfo && hasEnoughGold && hasEnoughEnergy;
  const upgradeMessage = upgradeInfo
    ? canAffordUpgrade
      ? `Yükselt (${upgradeInfo.cost}💰)`
      : !hasEnoughGold
        ? `Yetersiz Altın (${upgradeInfo.cost}💰)`
        : `Yetersiz Enerji (${energyCost})`
    : '';
  const currentTowerInfo = slot.tower ? GAME_CONSTANTS.TOWER_UPGRADES[slot.tower.level - 1] : null;

  const towerBottomY = slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 15;
  const debugInfo = React.useMemo(() => {
    if (!slot.tower || !GAME_CONSTANTS.DEBUG_MODE) return null;
    const { enemy } = getNearestEnemy(slot.tower.position, enemies);
    const firing = performance.now() - slot.tower.lastFired < 100;
    return enemy ? {
      enemy: enemy as Enemy,
      firing,
    } : null;
  }, [slot.tower, enemies]);

  // Health bar for tower
  const healthBar = slot.tower && (
    <rect
      x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
      y={towerBottomY + 28}
      width={GAME_CONSTANTS.TOWER_SIZE}
      height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
      fill={GAME_CONSTANTS.HEALTHBAR_BG}
      rx={4}
    />
  );
  const healthFill = slot.tower && slot.tower.maxHealth > 0 && (
    <rect
      x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
      y={towerBottomY + 28}
      width={GAME_CONSTANTS.TOWER_SIZE * (slot.tower.health / slot.tower.maxHealth)}
      height={GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT}
      fill={slot.tower.health > slot.tower.maxHealth * 0.4 ? GAME_CONSTANTS.HEALTHBAR_GOOD : GAME_CONSTANTS.HEALTHBAR_BAD}
      rx={4}
    />
  );

  // Tower design function - Artistic progression for each level
  const renderTower = (towerLevel: number) => {
    const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
    const topWidth = GAME_CONSTANTS.TOWER_SIZE - 4;
    
    // Level 1: Rustic Wooden Watchtower
    if (towerLevel === 1) {
      return (
        <g>
          {/* Stone Foundation */}
          <rect
            x={slot.x - baseWidth / 2}
            y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
            width={baseWidth}
            height={12}
            fill="#8B4513"
            stroke="#654321"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Main Tower Body - Weathered Wood */}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill="#CD853F"
            stroke="#8B7355"
            strokeWidth={3}
            rx={6}
          />
          
          {/* Wood Grain Pattern */}
          <rect x={slot.x - 12} y={slot.y - 10} width={24} height={2} fill="#8B7355" opacity={0.6} />
          <rect x={slot.x - 12} y={slot.y - 5} width={24} height={2} fill="#8B7355" opacity={0.6} />
          <rect x={slot.x - 12} y={slot.y} width={24} height={2} fill="#8B7355" opacity={0.6} />
          <rect x={slot.x - 12} y={slot.y + 5} width={24} height={2} fill="#8B7355" opacity={0.6} />
          
          {/* Thatched Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
              slot.x - 12
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2} ${
              slot.x + 12
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}`}
            fill="#8B4513"
            stroke="#654321"
            strokeWidth={2}
          />
          
          {/* Simple Window */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#333333"
            strokeWidth={1}
            rx={2}
          />
          
          {/* Wooden Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#654321"
            stroke="#8B4513"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Door Handle */}
          <circle
            cx={slot.x + 4}
            cy={slot.y + 14}
            r={2}
            fill="#8B4513"
            stroke="#654321"
            strokeWidth={1}
          />
        </g>
      );
    }
    
    // Level 2: Medieval Stone Fortress
    if (towerLevel === 2) {
      return (
        <g>
          {/* Stone Foundation */}
          <rect
            x={slot.x - baseWidth / 2}
            y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
            width={baseWidth}
            height={12}
            fill="#696969"
            stroke="#404040"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Main Tower Body - Stone Blocks */}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill="#A9A9A9"
            stroke="#696969"
            strokeWidth={3}
            rx={6}
          />
          
          {/* Stone Block Pattern */}
          <rect x={slot.x - 12} y={slot.y - 12} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          <rect x={slot.x - 4} y={slot.y - 12} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          <rect x={slot.x + 4} y={slot.y - 12} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          <rect x={slot.x - 12} y={slot.y - 6} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          <rect x={slot.x - 4} y={slot.y - 6} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          <rect x={slot.x + 4} y={slot.y - 6} width={8} height={6} fill="#8B8B8B" stroke="#696969" strokeWidth={1} />
          
          {/* Second Floor - Battlements */}
          <rect
            x={slot.x - topWidth / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
            width={topWidth}
            height={20}
            fill="#C0C0C0"
            stroke="#A9A9A9"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Stone Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x - 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
              slot.x + 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`}
            fill="#696969"
            stroke="#404040"
            strokeWidth={2}
          />
          
          {/* Battlements */}
          <rect x={slot.x - 12} y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 22} width={4} height={6} fill="#404040" />
          <rect x={slot.x + 8} y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 22} width={4} height={6} fill="#404040" />
          <rect x={slot.x - 4} y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 22} width={8} height={6} fill="#404040" />
          
          {/* Windows */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#333333"
            strokeWidth={1}
            rx={2}
          />
          <rect
            x={slot.x - 5}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
            width={10}
            height={14}
            fill="#000000"
            stroke="#333333"
            strokeWidth={1}
            rx={2}
          />
          
          {/* Stone Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#404040"
            stroke="#696969"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Iron Door Handle */}
          <rect
            x={slot.x + 4}
            y={slot.y + 12}
            width={3}
            height={6}
            fill="#2F2F2F"
            stroke="#1A1A1A"
            strokeWidth={1}
            rx={1}
          />
        </g>
      );
    }
    
    // Level 3: Bronze Age Fortress
    if (towerLevel === 3) {
      return (
        <g>
          {/* Bronze Foundation */}
          <rect
            x={slot.x - baseWidth / 2}
            y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
            width={baseWidth}
            height={12}
            fill="#CD7F32"
            stroke="#8B4513"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Main Tower Body - Bronze */}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill="#D2691E"
            stroke="#CD7F32"
            strokeWidth={3}
            rx={6}
          />
          
          {/* Bronze Plates */}
          <rect x={slot.x - 12} y={slot.y - 12} width={24} height={4} fill="#B8860B" stroke="#CD7F32" strokeWidth={1} />
          <rect x={slot.x - 12} y={slot.y - 4} width={24} height={4} fill="#B8860B" stroke="#CD7F32" strokeWidth={1} />
          <rect x={slot.x - 12} y={slot.y + 4} width={24} height={4} fill="#B8860B" stroke="#CD7F32" strokeWidth={1} />
          
          {/* Second Floor - Bronze */}
          <rect
            x={slot.x - topWidth / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
            width={topWidth}
            height={20}
            fill="#DAA520"
            stroke="#CD7F32"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Bronze Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x - 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
              slot.x + 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`}
            fill="#CD7F32"
            stroke="#8B4513"
            strokeWidth={2}
          />
          
          {/* Bronze Spikes */}
          <polygon points={`${slot.x - 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x - 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x - 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#8B4513" />
          <polygon points={`${slot.x + 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x + 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x + 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#8B4513" />
          
          {/* Windows with Bronze Frames */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#CD7F32"
            strokeWidth={2}
            rx={2}
          />
          <rect
            x={slot.x - 5}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
            width={10}
            height={14}
            fill="#000000"
            stroke="#CD7F32"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Bronze Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#CD7F32"
            stroke="#8B4513"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Bronze Door Handle */}
          <circle
            cx={slot.x + 4}
            cy={slot.y + 14}
            r={3}
            fill="#B8860B"
            stroke="#8B4513"
            strokeWidth={2}
          />
        </g>
      );
    }
    
    // Level 4: Iron Age Stronghold
    if (towerLevel === 4) {
      return (
        <g>
          {/* Iron Foundation */}
          <rect
            x={slot.x - baseWidth / 2}
            y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
            width={baseWidth}
            height={12}
            fill="#708090"
            stroke="#2F4F4F"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Main Tower Body - Iron */}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill="#778899"
            stroke="#708090"
            strokeWidth={3}
            rx={6}
          />
          
          {/* Iron Rivets */}
          <circle cx={slot.x - 8} cy={slot.y - 8} r={2} fill="#2F4F4F" />
          <circle cx={slot.x + 8} cy={slot.y - 8} r={2} fill="#2F4F4F" />
          <circle cx={slot.x - 8} cy={slot.y + 8} r={2} fill="#2F4F4F" />
          <circle cx={slot.x + 8} cy={slot.y + 8} r={2} fill="#2F4F4F" />
          <circle cx={slot.x} cy={slot.y} r={2} fill="#2F4F4F" />
          
          {/* Second Floor - Iron */}
          <rect
            x={slot.x - topWidth / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
            width={topWidth}
            height={20}
            fill="#B0C4DE"
            stroke="#778899"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Iron Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x - 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
              slot.x + 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`}
            fill="#708090"
            stroke="#2F4F4F"
            strokeWidth={2}
          />
          
          {/* Iron Spikes */}
          <polygon points={`${slot.x - 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x - 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x - 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#2F4F4F" />
          <polygon points={`${slot.x + 8},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x + 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x + 12},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#2F4F4F" />
          <polygon points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${slot.x - 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${slot.x + 4},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`} fill="#2F4F4F" />
          
          {/* Windows with Iron Bars */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#708090"
            strokeWidth={2}
            rx={2}
          />
          <rect x={slot.x - 6} y={slot.y - 4} width={12} height={2} fill="#2F4F4F" />
          <rect x={slot.x - 6} y={slot.y + 2} width={12} height={2} fill="#2F4F4F" />
          <rect x={slot.x - 6} y={slot.y + 8} width={12} height={2} fill="#2F4F4F" />
          
          <rect
            x={slot.x - 5}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
            width={10}
            height={14}
            fill="#000000"
            stroke="#708090"
            strokeWidth={2}
            rx={2}
          />
          <rect x={slot.x - 5} y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 12} width={10} height={2} fill="#2F4F4F" />
          <rect x={slot.x - 5} y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 6} width={10} height={2} fill="#2F4F4F" />
          
          {/* Iron Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#708090"
            stroke="#2F4F4F"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Iron Door Handle */}
          <rect
            x={slot.x + 4}
            y={slot.y + 12}
            width={4}
            height={8}
            fill="#2F4F4F"
            stroke="#1A1A1A"
            strokeWidth={1}
            rx={2}
          />
        </g>
      );
    }
    
    // Level 5: Crystal Tower
    if (towerLevel === 5) {
      return (
        <g>
          {/* Crystal Foundation */}
          <rect
            x={slot.x - baseWidth / 2}
            y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
            width={baseWidth}
            height={12}
            fill="#E6E6FA"
            stroke="#9370DB"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Main Tower Body - Crystal */}
          <rect
            x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
            width={GAME_CONSTANTS.TOWER_SIZE}
            height={GAME_CONSTANTS.TOWER_SIZE}
            fill="#F0F8FF"
            stroke="#E6E6FA"
            strokeWidth={3}
            rx={6}
          />
          
          {/* Crystal Facets */}
          <polygon points={`${slot.x - 12},${slot.y - 12} ${slot.x - 8},${slot.y - 8} ${slot.x - 12},${slot.y - 4}`} fill="#E6E6FA" opacity={0.7} />
          <polygon points={`${slot.x + 12},${slot.y - 12} ${slot.x + 8},${slot.y - 8} ${slot.x + 12},${slot.y - 4}`} fill="#E6E6FA" opacity={0.7} />
          <polygon points={`${slot.x - 12},${slot.y + 4} ${slot.x - 8},${slot.y + 8} ${slot.x - 12},${slot.y + 12}`} fill="#E6E6FA" opacity={0.7} />
          <polygon points={`${slot.x + 12},${slot.y + 4} ${slot.x + 8},${slot.y + 8} ${slot.x + 12},${slot.y + 12}`} fill="#E6E6FA" opacity={0.7} />
          
          {/* Second Floor - Crystal */}
          <rect
            x={slot.x - topWidth / 2}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
            width={topWidth}
            height={20}
            fill="#E0FFFF"
            stroke="#E6E6FA"
            strokeWidth={2}
            rx={4}
          />
          
          {/* Crystal Roof */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x - 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} ${
              slot.x + 10
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}`}
            fill="#E6E6FA"
            stroke="#9370DB"
            strokeWidth={2}
          />
          
          {/* Crystal Spire */}
          <polygon
            points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 50} ${
              slot.x - 6
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40} ${
              slot.x + 6
            },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40}`}
            fill="#E0FFFF"
            stroke="#9370DB"
            strokeWidth={2}
          />
          
          {/* Windows with Crystal Glow */}
          <rect
            x={slot.x - 6}
            y={slot.y - 8}
            width={12}
            height={16}
            fill="#000000"
            stroke="#9370DB"
            strokeWidth={2}
            rx={2}
          />
          <rect
            x={slot.x - 5}
            y={slot.y - 7}
            width={10}
            height={14}
            fill="#E0FFFF"
            opacity={0.6}
            rx={1}
          />
          
          <rect
            x={slot.x - 5}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
            width={10}
            height={14}
            fill="#000000"
            stroke="#9370DB"
            strokeWidth={2}
            rx={2}
          />
          <rect
            x={slot.x - 4}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 17}
            width={8}
            height={12}
            fill="#E0FFFF"
            opacity={0.6}
            rx={1}
          />
          
          {/* Crystal Door */}
          <rect
            x={slot.x - 8}
            y={slot.y + 8}
            width={16}
            height={12}
            fill="#E6E6FA"
            stroke="#9370DB"
            strokeWidth={2}
            rx={2}
          />
          
          {/* Crystal Door Handle */}
          <circle
            cx={slot.x + 4}
            cy={slot.y + 14}
            r={3}
            fill="#E0FFFF"
            stroke="#9370DB"
            strokeWidth={2}
          />
          
          {/* Crystal Aura */}
          <circle
            cx={slot.x}
            cy={slot.y}
            r={GAME_CONSTANTS.TOWER_SIZE / 2 + 5}
            fill="none"
            stroke="#E0FFFF"
            strokeWidth={1}
            opacity={0.4}
          />
        </g>
      );
    }
    
    // Level 6+: Majestic Palace Tower (Enhanced)
    return (
      <g>
        {/* Marble Foundation */}
        <rect
          x={slot.x - baseWidth / 2}
          y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
          width={baseWidth}
          height={12}
          fill="#F5F5DC"
          stroke="#DEB887"
          strokeWidth={2}
          rx={4}
        />
        
        {/* Main Tower Body - Marble */}
        <rect
          x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
          width={GAME_CONSTANTS.TOWER_SIZE}
          height={GAME_CONSTANTS.TOWER_SIZE}
          fill="#FFF8DC"
          stroke="#DEB887"
          strokeWidth={3}
          rx={6}
        />
        
        {/* Marble Veins */}
        <path d={`M ${slot.x - 12} ${slot.y - 12} Q ${slot.x} ${slot.y - 8} ${slot.x + 12} ${slot.y - 12}`} stroke="#DEB887" strokeWidth={1} fill="none" opacity={0.6} />
        <path d={`M ${slot.x - 12} ${slot.y} Q ${slot.x} ${slot.y + 4} ${slot.x + 12} ${slot.y}`} stroke="#DEB887" strokeWidth={1} fill="none" opacity={0.6} />
        <path d={`M ${slot.x - 12} ${slot.y + 12} Q ${slot.x} ${slot.y + 8} ${slot.x + 12} ${slot.y + 12}`} stroke="#DEB887" strokeWidth={1} fill="none" opacity={0.6} />
        
        {/* Second Floor - Gold accents */}
        <rect
          x={slot.x - topWidth / 2}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
          width={topWidth}
          height={20}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={2}
          rx={4}
        />
        
        {/* Third Floor - Royal Purple */}
        <rect
          x={slot.x - (topWidth - 8) / 2}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 36}
          width={topWidth - 8}
          height={16}
          fill="#9370DB"
          stroke="#4B0082"
          strokeWidth={2}
          rx={4}
        />
        
        {/* Golden Spire */}
        <polygon
          points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 52} ${
            slot.x - 8
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 36} ${
            slot.x + 8
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 36}`}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={2}
        />
        
        {/* Crown on top */}
        <polygon
          points={`${slot.x - 6},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 52} ${
            slot.x - 3
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} ${
            slot.x
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 58} ${
            slot.x + 3
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} ${
            slot.x + 6
          },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 52}`}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={1}
        />
        
        {/* Crown Jewels */}
        <circle cx={slot.x - 3} cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} r={2} fill="#FF1493" />
        <circle cx={slot.x} cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 58} r={2} fill="#00CED1" />
        <circle cx={slot.x + 3} cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} r={2} fill="#32CD32" />
        
        {/* Ornate Windows with Stained Glass */}
        <rect
          x={slot.x - 6}
          y={slot.y - 8}
          width={12}
          height={16}
          fill="#000000"
          stroke="#FFD700"
          strokeWidth={1}
          rx={2}
        />
        <rect
          x={slot.x - 5}
          y={slot.y - 7}
          width={10}
          height={14}
          fill="#FF69B4"
          opacity={0.6}
          rx={1}
        />
        
        <rect
          x={slot.x - 5}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
          width={10}
          height={14}
          fill="#000000"
          stroke="#FFD700"
          strokeWidth={1}
          rx={2}
        />
        <rect
          x={slot.x - 4}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 17}
          width={8}
          height={12}
          fill="#00CED1"
          opacity={0.6}
          rx={1}
        />
        
        <rect
          x={slot.x - 4}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 34}
          width={8}
          height={12}
          fill="#000000"
          stroke="#FFD700"
          strokeWidth={1}
          rx={2}
        />
        <rect
          x={slot.x - 3}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 33}
          width={6}
          height={10}
          fill="#32CD32"
          opacity={0.6}
          rx={1}
        />
        
        {/* Golden Door */}
        <rect
          x={slot.x - 8}
          y={slot.y + 8}
          width={16}
          height={12}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={2}
          rx={2}
        />
        
        {/* Door Handle */}
        <circle
          cx={slot.x + 4}
          cy={slot.y + 14}
          r={2}
          fill="#B8860B"
          stroke="#8B4513"
          strokeWidth={1}
        />
        
        {/* Royal Banners */}
        <rect
          x={slot.x - 10}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 2}
          width={4}
          height={8}
          fill="#FF0000"
          stroke="#8B0000"
          strokeWidth={1}
        />
        <rect
          x={slot.x + 6}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 2}
          width={4}
          height={8}
          fill="#0000FF"
          stroke="#00008B"
          strokeWidth={1}
        />
        
        {/* Gemstone Decorations */}
        <circle
          cx={slot.x - 8}
          cy={slot.y - 4}
          r={3}
          fill="#FF1493"
          stroke="#C71585"
          strokeWidth={1}
        />
        <circle
          cx={slot.x + 8}
          cy={slot.y - 4}
          r={3}
          fill="#00BFFF"
          stroke="#0080FF"
          strokeWidth={1}
        />
        
        {/* Royal Aura Effect */}
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2 + 8}
          fill="none"
          stroke="#FFD700"
          strokeWidth={1}
          opacity={0.3}
        />
      </g>
    );
  };

  // --- Yeni Sur Tasarım Fonksiyonu ---
  const renderWall = () => {
    if (!slot.tower || slot.tower.wallStrength <= 0) return null;

    const wallRadius = GAME_CONSTANTS.TOWER_SIZE / 2 + 35;
    const wallInfo = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[wallLevel - 1];

    if (!wallInfo) return null; // Sur yoksa çizim yapma

    // Seviye 1-2: Taş Duvar
    if (wallLevel <= 2) {
      const numStones = 12;
      return (
        <g>
          {Array.from({ length: numStones }).map((_, i) => {
            const angle = (i / numStones) * 2 * Math.PI;
            const x = slot.x + wallRadius * Math.cos(angle);
            const y = slot.y + wallRadius * Math.sin(angle);
            return (
              <rect
                key={i}
                x={x - 10}
                y={y - 10}
                width={20}
                height={20}
                fill={wallLevel === 1 ? '#C0C0C0' : '#A9A9A9'}
                stroke={wallLevel === 1 ? '#505050' : '#404040'}
                strokeWidth={3}
                rx={4}
                transform={`rotate(${angle * (180 / Math.PI) + 45}, ${x}, ${y})`}
              />
            );
          })}
        </g>
      );
    }

    // Seviye 3-4: Kale Duvarı
    if (wallLevel <= 4) {
      const numSegments = 16;
      return (
        <g>
          <circle cx={slot.x} cy={slot.y} r={wallRadius} fill="none" stroke={wallLevel === 3 ? '#A9A9A9' : '#808080'} strokeWidth={10} />
          {Array.from({ length: numSegments }).map((_, i) => {
            const angle = (i / numSegments) * 2 * Math.PI;
            const x = slot.x + (wallRadius + 5) * Math.cos(angle);
            const y = slot.y + (wallRadius + 5) * Math.sin(angle);
            return (
              <rect
                key={i}
                x={x - 5}
                y={y - 5}
                width={10}
                height={10}
                fill={wallLevel === 3 ? '#C0C0C0' : '#909090'}
              />
            );
          })}
        </g>
      );
    }
    
    // Seviye 5-6: Kristal Kalkan
    if (wallLevel <= 6) {
      const numCrystals = 9;
      return (
        <g opacity={0.9}>
          {/* Crystal Glow */}
           <circle cx={slot.x} cy={slot.y} r={wallRadius + 5} fill={wallLevel === 5 ? '#00E5FF' : '#B2EBF2'} opacity={0.3} />
          {Array.from({ length: numCrystals }).map((_, i) => {
            const angle = (i / numCrystals) * 2 * Math.PI;
            const x1 = slot.x + (wallRadius - 12) * Math.cos(angle);
            const y1 = slot.y + (wallRadius - 12) * Math.sin(angle);
            const x2 = slot.x + (wallRadius + 12) * Math.cos(angle + 0.15);
            const y2 = slot.y + (wallRadius + 12) * Math.sin(angle + 0.15);
            const x3 = slot.x + (wallRadius + 12) * Math.cos(angle - 0.15);
            const y3 = slot.y + (wallRadius + 12) * Math.sin(angle - 0.15);
            return (
              <polygon 
                key={i}
                points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} 
                fill={wallLevel === 5 ? '#00FFFF' : '#AFEEEE'}
                stroke="#00BCD4"
                strokeWidth={2.5}
              />
            );
          })}
        </g>
      );
    }
    
    // Seviye 7-8: Enerji Kalkanı
    return (
        <g>
            <defs>
                <pattern id="hex" patternUnits="userSpaceOnUse" width="25" height="25" x={0} y={0}>
                    <polygon points="12.5,0 25,6.25 25,18.75 12.5,25 0,18.75 0,6.25" fill="none" stroke={wallLevel === 7 ? '#00FF7F' : '#FFD700'} strokeWidth={1.5}/>
                </pattern>
                 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx={slot.x} cy={slot.y} r={wallRadius} fill="url(#hex)" stroke={wallLevel === 7 ? '#00FF7F' : '#FFD700'} strokeWidth={4} opacity={0.7} filter="url(#glow)"/>
            <circle cx={slot.x} cy={slot.y} r={wallRadius} fill="none" stroke={wallLevel === 7 ? 'white' : '#FFFACD'} strokeWidth={1.5} opacity={0.9}/>
        </g>
    );
  };

  const renderModifier = () => {
    if (!slot.modifier) return null;
    const { type, expiresAt } = slot.modifier;
    if (expiresAt && expiresAt < performance.now()) return null;
    if (type === 'wall') {
      return (
        <rect
          x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}
          width={GAME_CONSTANTS.TOWER_SIZE + 20}
          height={GAME_CONSTANTS.TOWER_SIZE + 20}
          fill="rgba(100,100,100,0.5)"
          stroke="#666"
          strokeWidth={2}
        />
      );
    }
    if (type === 'trench') {
      return (
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2 + 12}
          fill="rgba(0,0,0,0.3)"
          stroke="#222"
          strokeDasharray="4 2"
          strokeWidth={2}
        />
      );
    }
    if (type === 'buff') {
      return (
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE / 2 + 16}
          fill="none"
          stroke="#0ff"
          strokeWidth={3}
        />
      );
    }
    return null;
  };

  const renderVisualExtras = () => {
    if (!slot.tower) return null;
    if (slot.tower.towerType === 'economy') {
      return (
        <text x={slot.x} y={slot.y + 4} textAnchor="middle" fontSize={20} pointerEvents="none">💰</text>
      );
    }
    const visual = GAME_CONSTANTS.TOWER_VISUALS.find(v => v.level === slot.tower!.level);
    if (!visual) return null;
    return (
      <>
        {visual.glow && (
          <circle cx={slot.x} cy={slot.y} r={GAME_CONSTANTS.TOWER_SIZE} fill="none" stroke="#aef" strokeWidth={3} opacity={0.6} />
        )}
        {visual.effect === 'electric_aura' && (
          <circle cx={slot.x} cy={slot.y} r={GAME_CONSTANTS.TOWER_SIZE + 10} fill="none" stroke="#33f" strokeDasharray="4 2" />
        )}
      </>
    );
  };

  return (
    <g onContextMenu={(e) => { e.preventDefault(); setMenuPos({ x: e.clientX, y: e.clientY }); }}>
      {/* Slot or Tower */}
      {!slot.tower ? (
        <g>
          {/* Empty slot with foundation */}
          {renderModifier()}
          {slot.unlocked ? (
            // Unlocked slot - can build tower
            <rect
              x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2 - 4}
              y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 4}
              width={GAME_CONSTANTS.TOWER_SIZE + 8}
              height={GAME_CONSTANTS.TOWER_SIZE + 8}
              fill={isDragTarget ? '#4ade80' : (canBuild ? '#2d5016' : '#333333')}
              stroke={isDragTarget ? '#22c55e' : (canBuild ? (slot.type === 'dynamic' ? '#3b82f6' : '#4ade80') : '#666666')}
              strokeWidth={isDragTarget ? 4 : 3}
              rx={8}
              style={{ cursor: canBuild ? 'pointer' : 'not-allowed' }}
              onClick={() => canBuild && buildTower(slotIdx)}
            />
          ) : (
            // Locked slot - can unlock
            <rect
              x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2 - 4}
              y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 4}
              width={GAME_CONSTANTS.TOWER_SIZE + 8}
              height={GAME_CONSTANTS.TOWER_SIZE + 8}
              fill={canUnlock ? '#8B4513' : '#444444'}
              stroke={canUnlock ? '#CD853F' : '#666666'}
              strokeWidth={3}
              rx={8}
              style={{ cursor: canUnlock ? 'pointer' : 'not-allowed' }}
              onClick={() => canUnlock && unlockSlot(slotIdx)}
            />
          )}
          {/* Enlarged drop zone for better targeting */}
          {isDragTarget && (
            <circle
              cx={slot.x}
              cy={slot.y}
              r={GAME_CONSTANTS.TOWER_SIZE * 2}
              fill="rgba(68, 222, 128, 0.2)"
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="8 4"
              style={{ animation: 'pulse 1s ease-in-out infinite' }}
            />
          )}
          {slot.unlocked ? (
            // Unlocked slot content
            <>
              <rect
                x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
                y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
                width={GAME_CONSTANTS.TOWER_SIZE}
                height={GAME_CONSTANTS.TOWER_SIZE}
                fill={canBuild ? (slot.type === 'dynamic' ? GAME_CONSTANTS.BUILD_TILE_COLORS.dynamic : GAME_CONSTANTS.BUILD_TILE_COLORS.fixed) : '#444444'}
                stroke={canBuild ? (slot.type === 'dynamic' ? '#1e3a8a' : '#166534') : '#555555'}
                strokeWidth={2}
                rx={6}
                style={{ cursor: canBuild ? 'pointer' : 'not-allowed' }}
                onClick={() => canBuild && buildTower(slotIdx)}
              />
              {shouldShowBuildText && (
                <text
                  x={slot.x}
                  y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 35}
                  fill="#ffffff"
                  fontSize={14}
                  fontWeight="bold"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  Kule inşa et
                </text>
              )}
              <polygon
                points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 28} ${
                  slot.x - 6
                },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18} ${
                  slot.x + 6
                },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}`}
                fill="#ffffff"
                pointerEvents="none"
              />
            </>
          ) : (
            // Locked slot content
            <>
              <rect
                x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
                y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
                width={GAME_CONSTANTS.TOWER_SIZE}
                height={GAME_CONSTANTS.TOWER_SIZE}
                fill="#333333"
                stroke="#666666"
                strokeWidth={2}
                rx={6}
                strokeDasharray="4 2"
                style={{ cursor: canUnlock ? 'pointer' : 'not-allowed' }}
                onClick={() => canUnlock && unlockSlot(slotIdx)}
              />
              {/* 🎬 AŞAMA 1: Kilit Kırılması Animasyonu */}
              <g>
                {/* Çatlak çizgileri */}
                {isUnlocking && (
                  <>
                    <line
                      x1={slot.x - 12}
                      y1={slot.y - 8}
                      x2={slot.x + 12}
                      y2={slot.y + 8}
                      stroke="#FFD700"
                      strokeWidth={2}
                      style={{ animation: 'slot-crack 0.3s ease-out' }}
                    />
                    <line
                      x1={slot.x - 8}
                      y1={slot.y - 12}
                      x2={slot.x + 8}
                      y2={slot.y + 12}
                      stroke="#FFD700"
                      strokeWidth={2}
                      style={{ animation: 'slot-crack 0.3s ease-out 0.1s' }}
                    />
                  </>
                )}
                
                {/* Kilit ikonu */}
                <text
                  x={slot.x}
                  y={slot.y + 6}
                  fill={isUnlocking ? "#FFD700" : "#888888"}
                  fontSize={24}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ 
                    cursor: canUnlock ? 'pointer' : 'not-allowed',
                    animation: isUnlocking ? 'lock-shake 0.3s ease-in-out, lock-break 0.3s ease-out 0.3s' : 'none'
                  }}
                  onClick={() => canUnlock && unlockSlot(slotIdx)}
                >
                  🔒
                </text>
                
                {/* 🎆 AŞAMA 2: Parçacık Sistemi */}
                {isUnlocking && (
                  <>
                    {/* Ana patlama efekti */}
                    <circle
                      cx={slot.x}
                      cy={slot.y}
                      r={GAME_CONSTANTS.TOWER_SIZE}
                      style={{ animation: 'golden-burst 0.6s ease-out 0.3s' }}
                    />
                    
                    {/* Radial dalga efekti */}
                    <circle
                      cx={slot.x}
                      cy={slot.y}
                      r={10}
                      fill="none"
                      stroke="#FFD700"
                      style={{ animation: 'radial-wave 0.8s ease-out 0.5s' }}
                    />
                    <circle
                      cx={slot.x}
                      cy={slot.y}
                      r={10}
                      fill="none"
                      stroke="#FFA500"
                      style={{ animation: 'radial-wave 0.8s ease-out 0.7s' }}
                    />
                    
                    {/* Parçacık sistemi - 8 yönde parçacıklar */}
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <circle
                        key={i}
                        cx={slot.x}
                        cy={slot.y}
                        r={4}
                        fill="#FFD700"
                        style={{ 
                          animation: `particle-burst-${i} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s`,
                          filter: 'drop-shadow(0 0 6px #FFD700)',
                          transformOrigin: `${slot.x}px ${slot.y}px`
                        }}
                      />
                    ))}
                    
                    {/* İkinci dalga parçacıklar */}
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <circle
                        key={`second-${i}`}
                        cx={slot.x}
                        cy={slot.y}
                        r={2}
                        fill="#FFA500"
                        style={{ 
                          animation: `particle-burst-${i} 0.6s ease-out 0.8s`,
                          filter: 'drop-shadow(0 0 2px #FFA500)'
                        }}
                      />
                    ))}
                  </>
                )}
                
                {/* 🎊 AŞAMA 3: Slot Reveal & Celebration */}
                {isRecentlyUnlocked && (
                  <>
                    {/* Yerden çıkan çatlak efekti */}
                    <g>
                      <path
                        d={`M ${slot.x - 30} ${slot.y + 25} L ${slot.x - 10} ${slot.y + 15} L ${slot.x + 15} ${slot.y + 20} L ${slot.x + 35} ${slot.y + 10}`}
                        fill="none"
                        stroke="#8B4513"
                        strokeWidth={3}
                        style={{ animation: 'ground-crack 1s ease-out 0.9s' }}
                      />
                      <path
                        d={`M ${slot.x - 25} ${slot.y + 30} L ${slot.x + 5} ${slot.y + 25} L ${slot.x + 25} ${slot.y + 35}`}
                        fill="none"
                        stroke="#8B4513"
                        strokeWidth={2}
                        style={{ animation: 'ground-crack 0.8s ease-out 1.1s' }}
                      />
                    </g>
                    
                    {/* Slot emergence - Yerden çıkma efekti */}
                    <circle
                      cx={slot.x}
                      cy={slot.y}
                      r={GAME_CONSTANTS.TOWER_SIZE / 2 + 5}
                      fill="rgba(139, 69, 19, 0.3)"
                      stroke="#8B4513"
                      strokeWidth={2}
                      style={{ animation: 'slot-emerge 1.2s ease-out 1s' }}
                    />
                    
                    {/* Ready glow - İnşa edilebilir parıltısı */}
                    <circle
                      cx={slot.x}
                      cy={slot.y}
                      r={GAME_CONSTANTS.TOWER_SIZE / 2}
                      fill="none"
                      stroke="#00FF00"
                      style={{ animation: 'slot-ready-glow 2s ease-in-out 1.5s infinite' }}
                    />
                    
                    {/* Celebration text */}
                    <text
                      x={slot.x}
                      y={slot.y - 30}
                      textAnchor="middle"
                      fill="#FFD700"
                      fontSize={16}
                      fontWeight="bold"
                      style={{ 
                        animation: 'celebration-text 2s ease-out 1.2s',
                        filter: 'drop-shadow(0 0 4px #FFD700)'
                      }}
                    >
                      +1 Slot Unlocked! 🎉
                    </text>
                    
                    {/* Flying coins */}
                    {[0, 1, 2].map(i => (
                      <text
                        key={`coin-${i}`}
                        x={slot.x + (i - 1) * 20}
                        y={slot.y + 40}
                        textAnchor="middle"
                        fill="#FFD700"
                        fontSize={14}
                        style={{ 
                          animation: `coin-animation 1.5s ease-out ${1.3 + i * 0.2}s`,
                          filter: 'drop-shadow(0 0 2px #FFD700)'
                        }}
                      >
                        💰
                      </text>
                    ))}
                    
                    {/* Achievement badge */}
                    <g>
                      <circle
                        cx={slot.x + 25}
                        cy={slot.y - 25}
                        r={12}
                        fill="#4169E1"
                        stroke="#FFD700"
                        strokeWidth={2}
                        style={{ animation: 'achievement-badge 2s ease-out 1.4s' }}
                      />
                      <text
                        x={slot.x + 25}
                        y={slot.y - 20}
                        textAnchor="middle"
                        fill="#FFD700"
                        fontSize={12}
                        fontWeight="bold"
                        style={{ animation: 'achievement-badge 2s ease-out 1.4s' }}
                      >
                        ⭐
                      </text>
                    </g>
                  </>
                )}
              </g>
              <text
                x={slot.x}
                y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2 + 25}
                fill={canUnlock ? "#FFD700" : "#888888"}
                fontSize={12}
                fontWeight="bold"
                textAnchor="middle"
                style={{ cursor: canUnlock ? 'pointer' : 'not-allowed' }}
                onClick={() => canUnlock && unlockSlot(slotIdx)}
              >
                {canUnlock ? `Aç (${unlockCost}💰)` : `Yetersiz Altın (${unlockCost}💰)`}
              </text>
            </>
          )}
        </g>
      ) : (
        <g>
          {renderModifier()}
          {/* Render Wall first so it's behind the tower */}
          {renderWall()}
          {/* Render detailed tower */}
          <g 
            style={{ 
              cursor: 'grab',
              opacity: draggedTowerSlotIdx === slotIdx ? 0.5 : 1,
              filter: draggedTowerSlotIdx === slotIdx ? 'brightness(0.7)' : 'none'
            }}
            onMouseDown={(e) => {
              if (onTowerDragStart) {
                // Tower drag started
                onTowerDragStart(slotIdx, e);
              }
            }}
          >
            {renderTower(slot.tower.level)}
          </g>
          {renderVisualExtras()}
          {debugInfo && (
            <>
              <circle
                cx={slot.x}
                cy={slot.y}
                r={slot.tower.range * (slot.tower.rangeMultiplier ?? 1)}
                fill="none"
                stroke="#ff0000"
                strokeDasharray="4 2"
              />
              <line
                x1={slot.x}
                y1={slot.y}
                x2={debugInfo.enemy?.position ? debugInfo.enemy.position.x : slot.x}
                y2={debugInfo.enemy?.position ? debugInfo.enemy.position.y : slot.y}
                stroke="#ff0000"
                strokeWidth={1}
              />
              <text
                x={slot.x}
                y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 4}
                fill={debugInfo?.firing ? '#00ff00' : '#ff0000'}
                fontSize={10}
                textAnchor="middle"
              >
                {debugInfo?.firing ? 'FIRE' : 'IDLE'}
              </text>
            </>
          )}
          
          {/* Info panel below tower */}
          {currentTowerInfo && (
            <text
              x={slot.x}
              y={towerBottomY + 18}
              fill="#ffffff"
              fontSize={16}
              fontWeight="bold"
              textAnchor="middle"
            >
              {`${currentTowerInfo.name} (Lvl ${slot.tower.level})`}
            </text>
          )}

          {healthBar}
          {healthFill}
          
          {canUpgrade && upgradeInfo && (
            <text
              x={slot.x}
              y={towerBottomY + 50}
              fill={canAffordUpgrade ? '#4ade80' : '#ff4444'}
              fontSize={14}
              fontWeight="bold"
              textAnchor="middle"
              style={{ cursor: canAffordUpgrade ? 'pointer' : 'not-allowed' }}
              onClick={() => canAffordUpgrade && upgradeTower(slotIdx)}
            >
              {upgradeMessage}
            </text>
          )}
        </g>
      )}
      {menuPos && (
        <foreignObject x={menuPos.x} y={menuPos.y} width="140" height="110" style={{ pointerEvents: 'auto' }}>
          <div style={{ background: '#222', color: '#fff', border: '1px solid #555', fontSize: 12 }}>
            {!slot.tower && (
              <div style={{ padding: 4, cursor: 'pointer' }} onClick={() => { buildTower(slotIdx, false, 'economy'); setMenuPos(null); }}>
                Build Extractor
              </div>
            )}
            <div style={{ padding: 4, cursor: 'pointer' }} onClick={() => { performTileAction(slotIdx, 'wall'); setMenuPos(null); }}>
              Build Wall
            </div>
            <div style={{ padding: 4, cursor: 'pointer' }} onClick={() => { performTileAction(slotIdx, 'trench'); setMenuPos(null); }}>
              Dig Trench
            </div>
            <div style={{ padding: 4, cursor: 'pointer' }} onClick={() => { performTileAction(slotIdx, 'buff'); setMenuPos(null); }}>
              Buff Tile
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
};
