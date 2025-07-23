import React, { useState, useEffect } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { VisualExtrasProps } from '../types';

/**
 * Tower Effects Renderer
 * Provides dynamic visual effects and animations for different tower types
 * Optimized for performance with conditional rendering
 */
export const TowerEffectsRenderer: React.FC<VisualExtrasProps> = ({ slot }) => {
  if (!slot.tower) return null;

  const towerClass = slot.tower.towerClass;

  // Render effects based on tower class
  switch (towerClass) {
    case 'sniper':
      return <SniperEffects slot={slot} />;
    case 'gatling':
      return <GatlingEffects slot={slot} />;
    case 'laser':
      return <LaserEffects slot={slot} />;
    case 'mortar':
      return <MortarEffects slot={slot} />;
    case 'flamethrower':
      return <FlamethrowerEffects slot={slot} />;
    case 'radar':
      return <RadarEffects slot={slot} />;
    case 'supply_depot':
      return <SupplyDepotEffects slot={slot} />;
    case 'shield_generator':
      return <ShieldGeneratorEffects slot={slot} />;
    case 'repair_station':
      return <RepairStationEffects slot={slot} />;
    case 'emp':
      return <EMPEffects slot={slot} />;
    case 'stealth_detector':
      return <StealthDetectorEffects slot={slot} />;
    case 'air_defense':
      return <AirDefenseEffects slot={slot} />;
    default:
      return <StandardEffects slot={slot} />;
  }
};

// Sniper Effects - Precision targeting, critical hit indicators
const SniperEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  const isElite = (slot.tower?.level || 1) >= 3;
  
  return (
    <g>
      {/* Precision Targeting Reticle */}
      <circle
        cx={slot.x}
        cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 25}
        r={15}
        fill="none"
        stroke="#f56565"
        strokeWidth={1}
        strokeDasharray="2 2"
        opacity={0.6}
      />
      
      {/* Critical Hit Aura */}
      {isElite && (
        <circle
          cx={slot.x}
          cy={slot.y}
          r={GAME_CONSTANTS.TOWER_SIZE + 5}
          fill="none"
          stroke="#f56565"
          strokeWidth={2}
          opacity={0.3}
        />
      )}
      
      {/* Scope Glint */}
      <circle
        cx={slot.x}
        cy={slot.y - 8}
        r={2}
        fill="#e2e8f0"
        opacity={0.8}
      />
    </g>
  );
};

// Gatling Effects - Rapid fire, spin-up animation, ammo indicators
const GatlingEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  const barrelCount = Math.min((slot.tower?.level || 1) + 2, 6);
  
  return (
    <g>
      {/* Spin-up Animation */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 8}
        fill="none"
        stroke="#f6ad55"
        strokeWidth={2}
        strokeDasharray="4 4"
        opacity={0.4}
      />
      
      {/* Ammo Counter */}
      <text
        x={slot.x + 15}
        y={slot.y - 15}
        textAnchor="middle"
        fontSize={10}
        fill="#f6ad55"
        fontWeight="bold"
      >
        {barrelCount}🔫
      </text>
      
      {/* Heat Indicator */}
      <circle
        cx={slot.x - 15}
        cy={slot.y - 15}
        r={3}
        fill="#f56565"
        stroke="#c53030"
        strokeWidth={1}
      />
    </g>
  );
};

// Laser Effects - Energy beams, focus indicators, penetration effects
const LaserEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  const isElite = (slot.tower?.level || 1) >= 3;
  
  return (
    <g>
      {/* Energy Field */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 10}
        fill="none"
        stroke="#3182ce"
        strokeWidth={2}
        opacity={0.3}
      />
      
      {/* Beam Focus Lines */}
      <line
        x1={slot.x}
        y1={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
        x2={slot.x}
        y2={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 35}
        stroke="#3182ce"
        strokeWidth={2}
        strokeDasharray="3 2"
      />
      
      {/* Elite Laser - Dual beams */}
      {isElite && (
        <>
          <line
            x1={slot.x - 6}
            y1={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 15}
            x2={slot.x - 6}
            y2={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 30}
            stroke="#3182ce"
            strokeWidth={2}
            strokeDasharray="3 2"
          />
          <line
            x1={slot.x + 6}
            y1={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 15}
            x2={slot.x + 6}
            y2={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 30}
            stroke="#3182ce"
            strokeWidth={2}
            strokeDasharray="3 2"
          />
        </>
      )}
      
      {/* Energy Pulse */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={4}
        fill="#3182ce"
        opacity={0.6}
      />
    </g>
  );
};

// Mortar Effects - Artillery range, shell trajectory, explosion indicators
const MortarEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  return (
    <g>
      {/* Artillery Range */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 20}
        fill="none"
        stroke="#f6ad55"
        strokeWidth={1}
        strokeDasharray="5 5"
        opacity={0.4}
      />
      
      {/* Shell Trajectory */}
      <path
        d={`M ${slot.x} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 25} Q ${slot.x + 20} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 45} ${slot.x + 40} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 35}`}
        stroke="#f6ad55"
        strokeWidth={2}
        fill="none"
        strokeDasharray="3 2"
        opacity={0.6}
      />
      
      {/* Explosion Indicator */}
      <circle
        cx={slot.x + 40}
        cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 35}
        r={8}
        fill="none"
        stroke="#f56565"
        strokeWidth={2}
        opacity={0.5}
      />
    </g>
  );
};

// Flamethrower Effects - Fire particles, heat waves, burn indicators
const FlamethrowerEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  const scale = usePulseAnimation(1100, 0.93, 1.09);
  const r = (slot.tower?.areaEffectRadius || (GAME_CONSTANTS.TOWER_SIZE + 15)) * scale;
  return (
    <g>
      {/* Fire Aura (animated, red/orange) */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={r}
        fill="#f56565"
        opacity={0.13}
        style={{ filter: 'blur(2.5px)' }}
      />
      <circle
        cx={slot.x}
        cy={slot.y}
        r={r}
        fill="none"
        stroke="#f56565"
        strokeWidth={2}
        strokeDasharray="2 3"
        opacity={0.38}
      />
      {/* Fire Cone */}
      <path
        d={`M ${slot.x - 8} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} L ${slot.x - 15} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 35} L ${slot.x + 15} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 35} L ${slot.x + 8} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} Z`}
        fill="#f56565"
        opacity={0.2}
      />
      {/* Fuel Gauge */}
      <rect
        x={slot.x - 10}
        y={slot.y + 20}
        width={20}
        height={4}
        fill="#2d3748"
        stroke="#1a202c"
        strokeWidth={1}
        rx={2}
      />
      <rect
        x={slot.x - 9}
        y={slot.y + 21}
        width={18}
        height={2}
        fill="#f56565"
        rx={1}
      />
    </g>
  );
};

// Radar Effects - Detection waves, scanning animation, signal indicators
const RadarEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  return (
    <g>
      {/* Detection Waves */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 25}
        fill="none"
        stroke="#805ad5"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.3}
      />
      
      {/* Scanning Beam */}
      <path
        d={`M ${slot.x} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10} L ${slot.x - 20} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 30}`}
        stroke="#805ad5"
        strokeWidth={2}
        strokeDasharray="2 2"
        opacity={0.6}
      />
      
      {/* Signal Strength */}
      <text
        x={slot.x + 15}
        y={slot.y - 15}
        textAnchor="middle"
        fontSize={10}
        fill="#805ad5"
        fontWeight="bold"
      >
        📡
      </text>
    </g>
  );
};

// Supply Depot Effects - Ammo indicators, supply lines, reload animations
const SupplyDepotEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  return (
    <g>
      {/* Supply Lines */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 20}
        fill="none"
        stroke="#d69e2e"
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.4}
      />
      
      {/* Ammo Supply */}
      <text
        x={slot.x + 15}
        y={slot.y - 15}
        textAnchor="middle"
        fontSize={10}
        fill="#d69e2e"
        fontWeight="bold"
      >
        📦
      </text>
      
      {/* Supply Pulse */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={6}
        fill="#d69e2e"
        opacity={0.3}
      />
    </g>
  );
};

// Shield Generator Effects - Shield bubbles, protection indicators, barrier effects
const ShieldGeneratorEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  const scale = usePulseAnimation(1200, 0.95, 1.08);
  const r = (slot.tower?.areaEffectRadius || (GAME_CONSTANTS.TOWER_SIZE + 30)) * scale;
  return (
    <g>
      {/* Shield Aura (animated, blue) */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={r}
        fill="#38b2ac"
        opacity={0.12}
        style={{ filter: 'blur(3px)' }}
      />
      <circle
        cx={slot.x}
        cy={slot.y}
        r={r}
        fill="none"
        stroke="#38b2ac"
        strokeWidth={2}
        strokeDasharray="6 3"
        opacity={0.38}
      />
      {/* Protection Field */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 15}
        fill="none"
        stroke="#38b2ac"
        strokeWidth={1}
        opacity={0.6}
      />
      {/* Shield Icon */}
      <text
        x={slot.x + 15}
        y={slot.y - 15}
        textAnchor="middle"
        fontSize={12}
        fill="#38b2ac"
        fontWeight="bold"
      >
        🛡️
      </text>
    </g>
  );
};

// Repair Station Effects - Healing pulses, repair indicators, medical effects
const RepairStationEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  const scale = usePulseAnimation(1400, 0.92, 1.08);
  const r = (slot.tower?.areaEffectRadius || (GAME_CONSTANTS.TOWER_SIZE + 25)) * scale;
  return (
    <g>
      {/* Healing Pulse (animated, green) */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={r}
        fill="#38a169"
        opacity={0.13}
        style={{ filter: 'blur(2.5px)' }}
      />
      <circle
        cx={slot.x}
        cy={slot.y}
        r={r}
        fill="none"
        stroke="#38a169"
        strokeWidth={2}
        strokeDasharray="4 4"
        opacity={0.38}
      />
      {/* Medical Cross */}
      <text
        x={slot.x + 15}
        y={slot.y - 15}
        textAnchor="middle"
        fontSize={12}
        fill="#38a169"
        fontWeight="bold"
      >
        ⚕️
      </text>
      {/* Healing Aura */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={8}
        fill="#38a169"
        opacity={0.3}
      />
    </g>
  );
};

// EMP Effects - Disruption waves, electronic interference, lightning effects
const EMPEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  return (
    <g>
      {/* Disruption Field */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 20}
        fill="none"
        stroke="#ed8936"
        strokeWidth={2}
        strokeDasharray="2 2"
        opacity={0.4}
      />
      
      {/* Lightning Bolts */}
      <path
        d={`M ${slot.x - 15} ${slot.y - 15} L ${slot.x - 8} ${slot.y - 8} L ${slot.x - 12} ${slot.y} L ${slot.x - 5} ${slot.y + 7}`}
        stroke="#ed8936"
        strokeWidth={2}
        fill="none"
        opacity={0.6}
      />
      <path
        d={`M ${slot.x + 15} ${slot.y - 15} L ${slot.x + 8} ${slot.y - 8} L ${slot.x + 12} ${slot.y} L ${slot.x + 5} ${slot.y + 7}`}
        stroke="#ed8936"
        strokeWidth={2}
        fill="none"
        opacity={0.6}
      />
      
      {/* EMP Icon */}
      <text
        x={slot.x + 15}
        y={slot.y - 15}
        textAnchor="middle"
        fontSize={10}
        fill="#ed8936"
        fontWeight="bold"
      >
        ⚡
      </text>
    </g>
  );
};

// Stealth Detector Effects - Detection waves, stealth reveal, scanning effects
const StealthDetectorEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  return (
    <g>
      {/* Detection Waves */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 30}
        fill="none"
        stroke="#9f7aea"
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.3}
      />
      
      {/* Scanning Beam */}
      <path
        d={`M ${slot.x} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 8} L ${slot.x - 25} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 28}`}
        stroke="#9f7aea"
        strokeWidth={2}
        strokeDasharray="2 2"
        opacity={0.6}
      />
      <path
        d={`M ${slot.x} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 8} L ${slot.x + 25} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 28}`}
        stroke="#9f7aea"
        strokeWidth={2}
        strokeDasharray="2 2"
        opacity={0.6}
      />
      
      {/* Detection Icon */}
      <text
        x={slot.x + 15}
        y={slot.y - 15}
        textAnchor="middle"
        fontSize={10}
        fill="#9f7aea"
        fontWeight="bold"
      >
        👁️
      </text>
    </g>
  );
};

// Air Defense Effects - Anti-air targeting, missile indicators, sky defense
const AirDefenseEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  return (
    <g>
      {/* Anti-Air Range */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 35}
        fill="none"
        stroke="#2d3748"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.4}
      />
      
      {/* Missile Trajectories */}
      <path
        d={`M ${slot.x} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} L ${slot.x - 15} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40}`}
        stroke="#2d3748"
        strokeWidth={2}
        strokeDasharray="3 2"
        opacity={0.6}
      />
      <path
        d={`M ${slot.x} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20} L ${slot.x + 15} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 40}`}
        stroke="#2d3748"
        strokeWidth={2}
        strokeDasharray="3 2"
        opacity={0.6}
      />
      
      {/* Air Defense Icon */}
      <text
        x={slot.x + 15}
        y={slot.y - 15}
        textAnchor="middle"
        fontSize={10}
        fill="#2d3748"
        fontWeight="bold"
      >
        🚀
      </text>
    </g>
  );
};

// Standard Effects - Default effects for non-specialized towers
const StandardEffects: React.FC<VisualExtrasProps> = ({ slot }) => {
  const visual = GAME_CONSTANTS.TOWER_VISUALS.find(v => v.level === (slot.tower?.level || 1));
  if (!visual) return null;
  
  return (
    <g>
      {visual.glow && (
        <circle 
          cx={slot.x} 
          cy={slot.y} 
          r={GAME_CONSTANTS.TOWER_SIZE} 
          fill="none" 
          stroke="#aef" 
          strokeWidth={3} 
          opacity={0.6} 
        />
      )}
      {visual.effect === 'electric_aura' && (
        <circle 
          cx={slot.x} 
          cy={slot.y} 
          r={GAME_CONSTANTS.TOWER_SIZE + 10} 
          fill="none" 
          stroke="#33f" 
          strokeDasharray="4 2" 
        />
      )}
    </g>
  );
}; 

// Utility for animated pulsing
function usePulseAnimation(duration = 1200, min = 0.7, max = 1.1) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    let running = true;
    const start = performance.now();
    function animate(now: number) {
      if (!running) return;
      const t = ((now - start) % duration) / duration;
      const s = min + (max - min) * 0.5 * (1 + Math.sin(2 * Math.PI * t));
      setScale(s);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    return () => { running = false; };
  }, [duration, min, max]);
  return scale;
} 