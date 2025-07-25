import React from 'react';
import { createPortal } from 'react-dom';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { TowerSpotProps } from './types';
import { useTowerSpotLogic } from './hooks/useTowerSpotLogic';
import { useGameStore } from '../../models/store';
import { useTowerMoveManager } from '../GameBoard/hooks/useTowerMoveManager';
import {
  TowerRenderer,
  WallRenderer,
  ModifierRenderer,
  VisualExtrasRenderer,
  SlotUnlockDisplay,
  DebugInfo,
  ParticleSystem,
  FirstTowerHighlight,
  TowerHealthDisplay,
  TowerSelectionPanel,
  SimplifiedTowerControls,
  FireHazardDisplay,
  TowerMoveIcon,
  TileActionIcon,
  TileActionMenu
} from './components';

export const TowerSpot: React.FC<TowerSpotProps> = ({ 
  slot, 
  slotIdx, 
  onTowerDragStart, 
  isDragTarget, 
  draggedTowerSlotIdx 
}) => {
  // Move manager for hand icon functionality
  const { getMoveStateForSlot, initiateMoveMode } = useTowerMoveManager();
  const moveState = getMoveStateForSlot(slotIdx);
  const selectedSlot = useGameStore(s => s.selectedSlot);
  const selectSlot = useGameStore(s => s.selectSlot);
  const {
    // State
    showTowerSelection,
    isUnlocking,
    isRecentlyUnlocked,
    canUnlock,
    unlockCost,
    canUpgrade,
    upgradeInfo,
    canAffordUpgrade,
    canRepair,
    canAffordRepair,
    debugInfo,
    shouldShowBuildText,
    wallLevel,
    
    // Handlers
    handleShowTowerSelection,
    handleCloseTowerSelection,
    handleSelectTower,
    handlePerformTileAction,
    handleUpgrade,
    handleRepair,
    handleUnlock,
    handleDelete
  } = useTowerSpotLogic(slot, slotIdx);

  // Tile action state
  const [showTileActionMenu, setShowTileActionMenu] = React.useState(false);
  const actionsRemaining = useGameStore(s => s.actionsRemaining);
  const canPerformAction = actionsRemaining > 0;

  // Check if this is the first tower for tutorial highlight
  const firstTowerInfo = useGameStore((s) => s.firstTowerInfo);
  const isFirstTower = firstTowerInfo?.slotIndex === slotIdx;

  // Health display hover state
  const [showHealthDisplay, setShowHealthDisplay] = React.useState(false);
  const [isTowerHovered, setIsTowerHovered] = React.useState(false);
  const isSelected = selectedSlot === slotIdx;

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

  // --- YENİ: Fire origin ref ---
  const svgGroupRef = React.useRef<SVGGElement>(null);

  // Kule ateşleme için: data-fire-origin noktasının ekran pozisyonunu bul
  React.useImperativeHandle(slot.fireOriginRef, () => ({
    getFireOriginPosition: () => {
      if (!svgGroupRef.current) return null;
      const fireOrigin = svgGroupRef.current.querySelector('[data-fire-origin="true"]');
      if (!fireOrigin) return null;
      const bbox = (fireOrigin as SVGGraphicsElement).getBBox();
      // SVG koordinatlarını döndür
      return {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2
      };
    }
  }), [slot.tower]);

  return (
    <>
    <g
      ref={svgGroupRef}
      onMouseDown={(e) => {
        selectSlot(slotIdx);
        e.stopPropagation();
      }}
    >
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
                onClick={() => {
                  console.log('DEBUG: handleShowTowerSelection called');
                  handleShowTowerSelection();
                }}
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
                  Kule Seç
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
            onMouseEnter={() => {
              setShowHealthDisplay(true);
              setIsTowerHovered(true);
            }}
            onMouseLeave={() => {
              setShowHealthDisplay(false);
              setIsTowerHovered(false);
            }}
          >
            <TowerRenderer slot={slot} towerLevel={slot.tower.level} />
          </g>
          
          {/* First tower tutorial highlight */}
          {isFirstTower && firstTowerInfo && (
            <FirstTowerHighlight
              slotIndex={slotIdx}
              towerClass={firstTowerInfo.towerClass}
              towerName={firstTowerInfo.towerName}
            />
          )}
          
          {/* Visual extras (above tower) */}
          <VisualExtrasRenderer slot={slot} />
          
          {/* Health display on hover */}
          <TowerHealthDisplay slot={slot} isVisible={showHealthDisplay} />
          
          {/* Fire hazard display */}
          <FireHazardDisplay slot={slot} slotIdx={slotIdx} />
          
          {/* Move icon */}
          <TowerMoveIcon
            slot={slot}
            slotIdx={slotIdx}
            onMoveInitiate={initiateMoveMode}
            isHovered={isTowerHovered}
            isSelected={isSelected}
            canMove={moveState.canMove}
            moveCost={moveState.moveCost}
            canAffordMove={moveState.canAffordMove}
            cooldownRemaining={moveState.cooldownRemaining}
          />
          
          {/* Debug information */}
          <DebugInfo slot={slot} debugInfo={debugInfo} />
          
          {/* Simplified tower controls */}
          <SimplifiedTowerControls
            slot={slot}
            slotIdx={slotIdx}
            canUpgrade={canUpgrade}
            upgradeInfo={upgradeInfo}
            canAffordUpgrade={canAffordUpgrade}
            onUpgrade={handleUpgrade}
            canRepair={canRepair}
            canAffordRepair={canAffordRepair}
            repairCost={Math.ceil(GAME_CONSTANTS.TOWER_REPAIR_BASE_COST * (1 - (slot.tower.health / slot.tower.maxHealth)))}
            onRepair={handleRepair}
            onDelete={handleDelete}
            isHovered={isTowerHovered}
            isSelected={isSelected}
          />
        </g>
      )}
      
      {/* Tile Action Icon */}
      <TileActionIcon
        slot={slot}
        _slotIdx={slotIdx}
        _onTileAction={handlePerformTileAction}
        onShowMenu={() => setShowTileActionMenu(true)}
        isHovered={isTowerHovered}
        isSelected={isSelected}
        canPerformAction={canPerformAction}
        actionsRemaining={actionsRemaining}
      />
      
      {/* Tile Action Menu */}
      <TileActionMenu
        slot={slot}
        slotIdx={slotIdx}
        onTileAction={handlePerformTileAction}
        onClose={() => setShowTileActionMenu(false)}
        isVisible={showTileActionMenu}
        actionsRemaining={actionsRemaining}
      />
      
      
      {/* Tower Selection Panel is rendered via portal */}
    </g>
    {showTowerSelection &&
      createPortal(
        <TowerSelectionPanel
          isVisible={showTowerSelection}
          onClose={handleCloseTowerSelection}
          onSelectTower={handleSelectTower}
          _slotIdx={slotIdx}
        />,
        document.body
      )}
    </>
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