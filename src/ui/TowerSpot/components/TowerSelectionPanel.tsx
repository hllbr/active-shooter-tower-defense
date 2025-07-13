import React, { useState, useCallback, useMemo } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { formatProfessional } from '../../../utils/formatters';
import type { TowerClass } from '../../../models/gameTypes';

interface TowerSelectionPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectTower: (towerClass: TowerClass) => void;
  _slotIdx: number;
}

interface TowerIconProps {
  towerClass: TowerClass;
  towerData: typeof GAME_CONSTANTS.SPECIALIZED_TOWERS[TowerClass];
  isSelected: boolean;
  onSelect: () => void;
  onHover: (towerData: typeof GAME_CONSTANTS.SPECIALIZED_TOWERS[TowerClass], event: React.MouseEvent<HTMLDivElement>) => void;
  onLeave: () => void;
}

const TowerIcon: React.FC<TowerIconProps> = ({ 
  towerData, 
  isSelected, 
  onSelect, 
  onHover, 
  onLeave 
}) => {
  const getTowerIcon = (category: string) => {
    switch (category) {
      case 'assault': return '⚔️';
      case 'area_control': return '🎯';
      case 'support': return '🤝';
      case 'defensive': return '🛡️';
      case 'specialist': return '🔬';
      default: return '🏰';
    }
  };

  return (
    <div
      className={`tower-icon ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      onMouseEnter={(e) => onHover(towerData, e)}
      onMouseLeave={onLeave}
    >
      <div className="tower-icon-symbol">
        {getTowerIcon(towerData.category)}
      </div>
      <div className="tower-icon-name">
        {towerData.name}
      </div>
      <div className="tower-icon-cost">
        {formatProfessional(towerData.cost, 'currency')}
      </div>
    </div>
  );
};

const TowerTooltip: React.FC<{ 
  towerData: typeof GAME_CONSTANTS.SPECIALIZED_TOWERS[TowerClass] | null;
  position: { x: number; y: number } | null;
}> = ({ towerData, position }) => {
  if (!towerData || !position) return null;

  const getStatDisplay = () => {
    const stats = [];
    
    if (towerData.baseDamage > 0) {
      stats.push(`💥 Damage: ${towerData.baseDamage}`);
    }
    if (towerData.baseRange > 0) {
      stats.push(`📏 Range: ${towerData.baseRange}`);
    }
    if (towerData.baseFireRate > 0) {
      stats.push(`⚡ Fire Rate: ${towerData.baseFireRate}ms`);
    }
    if ('areaOfEffect' in towerData && towerData.areaOfEffect) {
      stats.push(`💥 AoE: ${towerData.areaOfEffect}`);
    }
    if ('supportRadius' in towerData && towerData.supportRadius) {
      stats.push(`🤝 Support: ${towerData.supportRadius}`);
    }
    if ('armorPenetration' in towerData && towerData.armorPenetration) {
      stats.push(`🛡️ Armor Pen: ${towerData.armorPenetration}`);
    }
    if ('criticalChance' in towerData && towerData.criticalChance) {
      stats.push(`🎯 Crit: ${(towerData.criticalChance * 100).toFixed(0)}%`);
    }
    if ('stealthDetectionRange' in towerData && towerData.stealthDetectionRange) {
      stats.push(`👁️ Detection: ${towerData.stealthDetectionRange}`);
    }
    if ('shieldStrength' in towerData && towerData.shieldStrength) {
      stats.push(`🛡️ Shield: ${towerData.shieldStrength}`);
    }
    if ('repairRate' in towerData && towerData.repairRate) {
      stats.push(`🔧 Repair: ${towerData.repairRate}/s`);
    }
    if ('empDuration' in towerData && towerData.empDuration) {
      stats.push(`⚡ EMP: ${towerData.empDuration}ms`);
    }
    if ('burnDuration' in towerData && towerData.burnDuration) {
      stats.push(`🔥 Burn: ${towerData.burnDuration}ms`);
    }
    
    return stats;
  };

  return (
    <div 
      className="tower-tooltip"
      style={{
        position: 'fixed',
        left: position.x + 10,
        top: position.y - 10,
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      <div className="tooltip-header">
        <h3>{towerData.name}</h3>
        <div className="tooltip-category">{towerData.category.replace('_', ' ')}</div>
      </div>
      <div className="tooltip-description">
        {towerData.description}
      </div>
      <div className="tooltip-stats">
        {getStatDisplay().map((stat, index) => (
          <div key={index} className="tooltip-stat">
            {stat}
          </div>
        ))}
      </div>
      <div className="tooltip-cost">
        Cost: {formatProfessional(towerData.cost, 'currency')}
      </div>
    </div>
  );
};

export const TowerSelectionPanel: React.FC<TowerSelectionPanelProps> = ({
  isVisible,
  onClose,
  onSelectTower,
  _slotIdx
}) => {
  const [selectedTower, setSelectedTower] = useState<TowerClass | null>(null);
  const [tooltipData, setTooltipData] = useState<typeof GAME_CONSTANTS.SPECIALIZED_TOWERS[TowerClass] | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const towerCategories = useMemo(() => ({
    assault: ['sniper', 'gatling', 'laser'] as TowerClass[],
    area_control: ['mortar', 'flamethrower'] as TowerClass[],
    support: ['radar', 'supply_depot'] as TowerClass[],
    defensive: ['shield_generator', 'repair_station'] as TowerClass[],
    specialist: ['emp', 'stealth_detector', 'air_defense'] as TowerClass[]
  }), []);

  const handleTowerSelect = useCallback((towerClass: TowerClass) => {
    setSelectedTower(towerClass);
    onSelectTower(towerClass);
    onClose();
  }, [onSelectTower, onClose]);

  const handleTowerHover = useCallback((towerData: typeof GAME_CONSTANTS.SPECIALIZED_TOWERS[TowerClass], event: React.MouseEvent<HTMLDivElement>) => {
    setTooltipData(towerData);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleTowerLeave = useCallback(() => {
    setTooltipData(null);
    setTooltipPosition(null);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="tower-selection-backdrop"
        onClick={handleBackdropClick}
      />
      
      {/* Panel */}
      <div className="tower-selection-panel">
        <div className="panel-header">
          <h2>Select Tower Type</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close tower selection"
          >
            ✕
          </button>
        </div>
        
        <div className="panel-content">
          {Object.entries(towerCategories).map(([category, towers]) => (
            <div key={category} className="tower-category">
              <h3 className="category-title">
                {category === 'assault' && '⚔️ Assault'}
                {category === 'area_control' && '🎯 Area Control'}
                {category === 'support' && '🤝 Support'}
                {category === 'defensive' && '🛡️ Defensive'}
                {category === 'specialist' && '🔬 Specialist'}
              </h3>
              <div className="tower-grid">
                {towers.map((towerClass) => {
                  const towerData = GAME_CONSTANTS.SPECIALIZED_TOWERS[towerClass];
                  return (
                    <TowerIcon
                      key={towerClass}
                      towerClass={towerClass}
                      towerData={towerData}
                      isSelected={selectedTower === towerClass}
                      onSelect={() => handleTowerSelect(towerClass)}
                      onHover={(data, e) => handleTowerHover(data, e)}
                      onLeave={handleTowerLeave}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tooltip */}
      <TowerTooltip 
        towerData={tooltipData}
        position={tooltipPosition}
      />
    </>
  );
}; 