import React, { useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { formatProfessional } from '../../../utils/formatters';
import type { TowerClass } from '../../../models/gameTypes';
import { SpecializedTowerRenderer } from './SpecializedTowerRenderer';

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
  towerClass,
  towerData, 
  isSelected, 
  onSelect, 
  onHover, 
  onLeave 
}) => {
  // Prepare a mock slot for rendering SVG
  const slot = {
    x: 32,
    y: 32,
    unlocked: true,
    tower: {
      id: 'preview',
      position: { x: 32, y: 32 },
      size: 32,
      isActive: true,
      level: 1,
      range: towerData.baseRange || 100,
      damage: towerData.baseDamage || 10,
      fireRate: towerData.baseFireRate || 1000,
      lastFired: 0,
      health: 100,
      maxHealth: 100,
      wallStrength: 0,
      specialAbility: '',
      healthRegenRate: 0,
      lastHealthRegen: 0,
      specialCooldown: 5000,
      lastSpecialUse: 0,
      multiShotCount: 1,
      chainLightningJumps: 0,
      freezeDuration: 0,
      burnDuration: 0,
      acidStack: 0,
      quantumState: false,
      nanoSwarmCount: 0,
      psiRange: 0,
      timeWarpSlow: 0,
      spaceGravity: 0,
      legendaryAura: false,
      divineProtection: false,
      cosmicEnergy: 0,
      infinityLoop: false,
      godModeActive: false,
      attackSound: undefined,
      visual: undefined,
      rangeMultiplier: 1,
      towerType: 'attack' as const,
      towerCategory: towerData.category,
      towerClass: towerClass,
      criticalChance: 'criticalChance' in towerData ? (towerData as Partial<typeof towerData>).criticalChance ?? 0 : 0,
      criticalDamage: 'criticalDamage' in towerData ? (towerData as Partial<typeof towerData>).criticalDamage ?? 1 : 1,
      armorPenetration: 'armorPenetration' in towerData ? (towerData as Partial<typeof towerData>).armorPenetration ?? 0 : 0,
      areaOfEffect: 'areaOfEffect' in towerData ? (towerData as Partial<typeof towerData>).areaOfEffect ?? 0 : 0,
      projectilePenetration: 'projectilePenetration' in towerData ? (towerData as Partial<typeof towerData>).projectilePenetration ?? 0 : 0,
      spinUpLevel: 'spinUpLevel' in towerData ? (towerData as Partial<typeof towerData>).spinUpLevel ?? 0 : 0,
      maxSpinUpLevel: 'maxSpinUpLevel' in towerData ? (towerData as Partial<typeof towerData>).maxSpinUpLevel ?? 0 : 0,
      beamFocusMultiplier: 'beamFocusMultiplier' in towerData ? (towerData as Partial<typeof towerData>).beamFocusMultiplier ?? 1 : 1,
      beamLockTime: 'beamLockTime' in towerData ? (towerData as Partial<typeof towerData>).beamLockTime ?? 0 : 0,
      supportRadius: 'supportRadius' in towerData ? (towerData as Partial<typeof towerData>).supportRadius ?? 0 : 0,
      supportIntensity: 'supportIntensity' in towerData ? (towerData as Partial<typeof towerData>).supportIntensity ?? 1 : 1,
      shieldStrength: 'shieldStrength' in towerData ? (towerData as Partial<typeof towerData>).shieldStrength ?? 0 : 0,
      shieldRegenRate: 'shieldRegenRate' in towerData ? (towerData as Partial<typeof towerData>).shieldRegenRate ?? 0 : 0,
      repairRate: 'repairRate' in towerData ? (towerData as Partial<typeof towerData>).repairRate ?? 0 : 0,
      empDuration: 'empDuration' in towerData ? (towerData as Partial<typeof towerData>).empDuration ?? 0 : 0,
      stealthDetectionRange: 'stealthDetectionRange' in towerData ? (towerData as Partial<typeof towerData>).stealthDetectionRange ?? 0 : 0,
      manualTargeting: false,
      upgradePath: '',
      synergyBonuses: { damage: 0, range: 0, fireRate: 0 },
      areaEffectType: 'areaEffectType' in towerData ? (towerData as Partial<typeof towerData>).areaEffectType ?? null : null,
      areaEffectRadius: 'areaEffectRadius' in towerData ? (towerData as Partial<typeof towerData>).areaEffectRadius ?? 0 : 0,
      areaEffectPower: 'areaEffectPower' in towerData ? (towerData as Partial<typeof towerData>).areaEffectPower ?? 0 : 0,
      areaEffectDuration: 'areaEffectDuration' in towerData ? (towerData as Partial<typeof towerData>).areaEffectDuration ?? 0 : 0,
      areaEffectActive: 'areaEffectActive' in towerData ? (towerData as Partial<typeof towerData>).areaEffectActive ?? false : false,
      areaEffectLastTick: undefined,
      areaEffectDecayTimer: 'areaEffectDecayTimer' in towerData ? (towerData as Partial<typeof towerData>).areaEffectDecayTimer ?? 0 : 0,
    },
  };

  return (
    <div
      className={`tower-icon ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      onMouseEnter={(e) => onHover(towerData, e)}
      onMouseLeave={onLeave}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 14,
        background: 'rgba(44, 62, 80, 0.85)',
        boxShadow: isSelected ? '0 0 0 3px #27ae60' : '0 2px 8px rgba(0,0,0,0.12)',
        border: isSelected ? '2px solid #27ae60' : '2px solid #4a90e2',
        cursor: 'pointer',
        minHeight: 160,
        minWidth: 110,
        maxWidth: 140,
        margin: 'auto',
        transition: 'box-shadow 0.2s, border 0.2s',
      }}
    >
      <svg width={64} height={64} style={{ marginBottom: 10, display: 'block' }}>
        <SpecializedTowerRenderer slot={slot} towerLevel={1} />
      </svg>
      <div className="tower-icon-name" style={{ color: '#ecf0f1', fontWeight: 600, fontSize: 14, textAlign: 'center', marginBottom: 2 }}>
        {towerData.name}
      </div>
      <div className="tower-icon-cost" style={{ color: '#f39c12', fontSize: 12, fontWeight: 500, textAlign: 'center' }}>
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
        zIndex: 2000, // Ensure it's above other elements
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
      {/* Modal Backdrop */}
      <div 
        className="tower-selection-modal-backdrop"
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(20, 30, 60, 0.55)',
          backdropFilter: 'blur(6px)',
          zIndex: 1200
        }}
      />
      {/* Modal Panel */}
      <div
        className="tower-selection-modal-panel"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: 380,
          maxWidth: 600,
          width: '90vw',
          maxHeight: '80vh',
          background: 'rgba(34, 40, 60, 0.85)',
          borderRadius: 20,
          boxShadow: '0 8px 40px 0 rgba(0,0,0,0.35)',
          border: '2px solid #4a90e2',
          padding: 0,
          overflow: 'hidden',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 28px 10px 28px',
          background: 'rgba(44, 62, 80, 0.85)',
          borderBottom: '1.5px solid #4a90e2',
        }}>
          <h2 style={{
            margin: 0,
            color: '#ecf0f1',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 0.5,
            textShadow: '0 2px 4px rgba(0,0,0,0.25)'
          }}>Kule Seçimi</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Kapat"
            style={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              color: 'white',
              fontSize: 18,
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(231, 76, 60, 0.3)',
              transition: 'all 0.2s',
              marginLeft: 12
            }}
          >✕</button>
        </div>
        {/* Content */}
        <div style={{
          padding: 24,
          overflowY: 'auto',
          flex: 1,
          background: 'rgba(26, 26, 46, 0.85)'
        }}>
          {Object.entries(towerCategories).map(([category, towers]) => (
            <div key={category} style={{ marginBottom: 24 }}>
              <h3 style={{
                margin: '0 0 10px 0',
                color: '#b3e5fc',
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: 0.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.18)',
                borderBottom: '1px solid #4a90e2',
                paddingBottom: 4
              }}>
                {category === 'assault' && '⚔️ Saldırı'}
                {category === 'area_control' && '🎯 Alan Kontrolü'}
                {category === 'support' && '🤝 Destek'}
                {category === 'defensive' && '🛡️ Savunma'}
                {category === 'specialist' && '🔬 Uzman'}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 14,
                justifyItems: 'center',
                alignItems: 'stretch',
              }}>
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
      {tooltipData && tooltipPosition &&
        ReactDOM.createPortal(
          <TowerTooltip towerData={tooltipData} position={tooltipPosition} />,
          document.body
        )
      }
    </>
  );
}; 