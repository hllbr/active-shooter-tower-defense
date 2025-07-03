import React from 'react';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { TowerSpotProps } from './types';
import { useTowerSpotLogic } from './hooks/useTowerSpotLogic';
import {
  TowerRenderer,
  WallRenderer,
  ModifierRenderer,
  VisualExtrasRenderer,
  TowerMenu,
  TowerInfoPanel,
  SlotUnlockDisplay,
  DebugInfo,
  ParticleSystem
} from './components';

export const TowerSpot: React.FC<TowerSpotProps> = ({ 
  slot, 
  slotIdx, 
  onTowerDragStart, 
  isDragTarget, 
  draggedTowerSlotIdx 
}) => {
  const {
    // State
    menuPos,
    isUnlocking,
    isRecentlyUnlocked,
    canUnlock,
    unlockCost,
    canUpgrade,
    upgradeInfo,
    canAffordUpgrade,
    upgradeMessage,
    currentTowerInfo,
    towerBottomY,
    debugInfo,
    shouldShowBuildText,
    wallLevel,
    
    // Handlers
    handleContextMenu,
    handleMenuClose,
    handleBuildTower,
    handlePerformTileAction,
    handleUpgrade,
    handleUnlock
  } = useTowerSpotLogic(slot, slotIdx);

  // --- YENİ: Build animasyonu için state ---
  const [showTowerVisible, setShowTowerVisible] = React.useState(true); // Kule görünür mü
  const [showDust, setShowDust] = React.useState(false); // Toz bulutu animasyonu
  const prevTower = React.useRef(slot.tower);

  React.useEffect(() => {
    // Kule yeni inşa edildiyse animasyonu tetikle
    if (!prevTower.current && slot.tower) {
      setShowTowerVisible(false);
      setShowDust(false);
      setTimeout(() => {
        setShowTowerVisible(true);
        setShowDust(true);
        setTimeout(() => setShowDust(false), 500);
      }, 400); // Kule düşme animasyonu süresi
    }
    // Kule yükseltildiyse de aynı animasyonu tetikle
    if (
      prevTower.current &&
      slot.tower &&
      prevTower.current.id === slot.tower.id &&
      prevTower.current.level !== slot.tower.level
    ) {
      setShowTowerVisible(false);
      setShowDust(false);
      setTimeout(() => {
        setShowTowerVisible(true);
        setShowDust(true);
        setTimeout(() => setShowDust(false), 500);
      }, 400);
    }
    prevTower.current = slot.tower;
  }, [slot.tower]);

  // Yükseltme animasyonu ile ilgili tüm state ve kodları kaldırıyorum
  // handleUpgradeWithEffect fonksiyonu doğrudan handleUpgrade'i çağıracak
  const handleUpgradeWithEffect = React.useCallback(
    (slotIdx: number) => {
      handleUpgrade(slotIdx);
    },
    [handleUpgrade]
  );

  return (
    <g onContextMenu={handleContextMenu}>
      {/* --- YENİ: Toz bulutu efekti --- */}
      {showDust && (
        <ParticleSystem slot={slot} isUnlocking={false} showDust={true} />
      )}
      {/* Slot or Tower */}
      {!slot.tower ? (
        <g>
          {/* Empty slot visualization */}
          {slot.unlocked ? (
            <>
              {/* Basic slot circle */}
              <circle
                cx={slot.x}
                cy={slot.y}
                r={GAME_CONSTANTS.TOWER_SIZE / 2}
                fill="rgba(100, 100, 100, 0.2)"
                stroke="#888888"
                strokeWidth={2}
                strokeDasharray="4 2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleBuildTower(slotIdx, 'attack')}
              />
              
              {/* Build indicator */}
              {shouldShowBuildText && (
                <text
                  x={slot.x}
                  y={slot.y + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#4ade80"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  İnşa Et
                </text>
              )}
              
              {/* Drag target highlight */}
              {isDragTarget && (
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r={GAME_CONSTANTS.TOWER_SIZE / 2 + 5}
                  fill="rgba(0, 255, 0, 0.3)"
                  stroke="#00FF00"
                  strokeWidth={3}
                />
              )}
            </>
          ) : (
            <SlotUnlockDisplay
              slot={slot}
              slotIdx={slotIdx}
              unlockCost={unlockCost}
              canUnlock={canUnlock}
              isUnlocking={isUnlocking}
              isRecentlyUnlocked={isRecentlyUnlocked}
              onUnlock={handleUnlock}
            />
          )}
        </g>
      ) : (
        <g>
          {/* Modifiers (behind tower) */}
          <ModifierRenderer slot={slot} />
          
          {/* Wall (behind tower) */}
          <WallRenderer slot={slot} wallLevel={wallLevel} />
          
          {/* Tower with enhanced drag & touch support */}
          <g
            style={{
              cursor: 'grab',
              opacity: showTowerVisible ? 1 : 0,
              filter: draggedTowerSlotIdx === slotIdx ? 'brightness(0.7)' : 'none',
              transform: showTowerVisible ? 'translateY(0)' : 'translateY(-40px)',
              transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s',
              touchAction: 'none'
            }}
            onMouseDown={(e) => {
              if (onTowerDragStart) {
                onTowerDragStart(slotIdx, e);
              }
            }}
            onTouchStart={(e) => {
              if (onTowerDragStart) {
                e.preventDefault();
                onTowerDragStart(slotIdx, e);
              }
            }}
          >
            <TowerRenderer slot={slot} towerLevel={slot.tower.level} />
          </g>
          
          {/* Visual extras (above tower) */}
          <VisualExtrasRenderer slot={slot} />
          
          {/* Debug information */}
          <DebugInfo slot={slot} debugInfo={debugInfo} />
          
          {/* Tower info panel */}
          <TowerInfoPanel
            slot={slot}
            slotIdx={slotIdx}
            currentTowerInfo={currentTowerInfo}
            towerBottomY={towerBottomY}
            canUpgrade={canUpgrade}
            upgradeInfo={upgradeInfo}
            upgradeMessage={upgradeMessage}
            canAffordUpgrade={canAffordUpgrade}
            onUpgrade={handleUpgradeWithEffect}
          />
        </g>
      )}
      
      {/* Context menu */}
      <TowerMenu
        menuPos={menuPos}
        slot={slot}
        slotIdx={slotIdx}
        onClose={handleMenuClose}
        onBuildTower={handleBuildTower}
        onPerformTileAction={handlePerformTileAction}
      />
    </g>
  );
};

<style>{`
@keyframes tower-upgrade-rotate {
  0% { transform: rotate(0deg); }
  20% { transform: rotate(30deg); }
  40% { transform: rotate(0deg); }
  60% { transform: rotate(-30deg); }
  80% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}
`}</style> 