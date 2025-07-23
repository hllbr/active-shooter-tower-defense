import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerRenderProps } from '../types';

/**
 * Specialized Tower Renderer
 * Provides unique visual designs for each tower class with distinct characteristics
 * Optimized for performance and visual clarity
 */
export const SpecializedTowerRenderer: React.FC<TowerRenderProps> = ({ slot, towerLevel }) => {
  if (!slot.tower?.towerClass) {
    return null; // Fall back to standard renderer for non-specialized towers
  }

  const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
  const towerClass = slot.tower.towerClass;

  switch (towerClass) {
    case 'sniper':
      return <SniperTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'gatling':
      return <GatlingTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'laser':
      return <LaserTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'mortar':
      return <MortarTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'flamethrower':
      return <FlamethrowerTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'radar':
      return <RadarTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'supply_depot':
      return <SupplyDepotTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'shield_generator':
      return <ShieldGeneratorTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'repair_station':
      return <RepairStationTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'emp':
      return <EMPTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'stealth_detector':
      return <StealthDetectorTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    case 'air_defense':
      return <AirDefenseTower slot={slot} towerLevel={towerLevel} baseWidth={baseWidth} />;
    default:
      return null;
  }
};

// Sniper Tower - High precision, long range, critical hit focused
const SniperTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel, baseWidth }) => {
  const isElite = towerLevel >= 3;
  
  return (
    <g>
      {/* Stealth Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#2d3748"
        stroke="#1a202c"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Stealth Black */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#4a5568"
        stroke="#2d3748"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Sniper Scope */}
      <circle
        cx={slot.x}
        cy={slot.y - 8}
        r={8}
        fill="#1a202c"
        stroke="#e2e8f0"
        strokeWidth={2}
      />
      <circle
        cx={slot.x}
        cy={slot.y - 8}
        r={4}
        fill="#e2e8f0"
        stroke="#1a202c"
        strokeWidth={1}
      />
      
      {/* Crosshair */}
      <line x1={slot.x - 6} y1={slot.y - 8} x2={slot.x + 6} y2={slot.y - 8} stroke="#e2e8f0" strokeWidth={1} />
      <line x1={slot.x} y1={slot.y - 14} x2={slot.x} y2={slot.y - 2} stroke="#e2e8f0" strokeWidth={1} />
      
      {/* Barrel (ateşleme çıkış noktası için data attribute) */}
      <rect
        x={slot.x - 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 15}
        width={4}
        height={15}
        fill="#2d3748"
        stroke="#1a202c"
        strokeWidth={1}
        rx={2}
        data-fire-origin="true"
      />
      
      {/* Elite Sniper - Additional barrel */}
      {isElite && (
        <rect
          x={slot.x - 6}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 12}
          width={3}
          height={12}
          fill="#2d3748"
          stroke="#1a202c"
          strokeWidth={1}
          rx={1.5}
        />
      )}
      
      {/* Stealth Coating */}
      <rect x={slot.x - 12} y={slot.y - 12} width={24} height={2} fill="#718096" opacity={0.4} />
      <rect x={slot.x - 12} y={slot.y - 6} width={24} height={2} fill="#718096" opacity={0.4} />
      <rect x={slot.x - 12} y={slot.y} width={24} height={2} fill="#718096" opacity={0.4} />
      <rect x={slot.x - 12} y={slot.y + 6} width={24} height={2} fill="#718096" opacity={0.4} />
      
      {/* Critical Hit Indicator */}
      <circle
        cx={slot.x + 10}
        cy={slot.y - 10}
        r={3}
        fill="#f56565"
        stroke="#c53030"
        strokeWidth={1}
      />
    </g>
  );
};

// Gatling Tower - Rapid fire, multiple barrels, spin-up mechanic
const GatlingTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel, baseWidth }) => {
  const barrelCount = Math.min(towerLevel + 2, 6);
  
  return (
    <g>
      {/* Heavy Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#4a5568"
        stroke="#2d3748"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Military Green */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#68d391"
        stroke="#38a169"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Multiple Barrels (dönen grup) */}
      <g style={{ transformOrigin: `${slot.x}px ${slot.y - 8}px`, animation: 'spin 0.7s linear infinite' }}>
        {Array.from({ length: barrelCount }, (_, i) => {
          const angle = (i * 360) / barrelCount;
          const radius = 8;
          const x = slot.x + radius * Math.cos((angle * Math.PI) / 180);
          const y = slot.y - 8 + radius * Math.sin((angle * Math.PI) / 180);
          return (
            <rect
              key={i}
              x={x - 1.5}
              y={y - GAME_CONSTANTS.TOWER_SIZE / 2 - 12}
              width={3}
              height={12}
              fill="#2d3748"
              stroke="#1a202c"
              strokeWidth={1}
              rx={1.5}
              data-fire-origin={i === 0 ? 'true' : undefined}
            />
          );
        })}
      </g>
      
      {/* Ammo Belt */}
      <rect
        x={slot.x - 8}
        y={slot.y + 8}
        width={16}
        height={8}
        fill="#2d3748"
        stroke="#1a202c"
        strokeWidth={1}
        rx={2}
      />
      
      {/* Ammo Links */}
      <circle cx={slot.x - 6} cy={slot.y + 12} r={1.5} fill="#e2e8f0" />
      <circle cx={slot.x - 2} cy={slot.y + 12} r={1.5} fill="#e2e8f0" />
      <circle cx={slot.x + 2} cy={slot.y + 12} r={1.5} fill="#e2e8f0" />
      <circle cx={slot.x + 6} cy={slot.y + 12} r={1.5} fill="#e2e8f0" />
      
      {/* Spin-up Indicator */}
      <circle
        cx={slot.x - 10}
        cy={slot.y - 10}
        r={3}
        fill="#f6ad55"
        stroke="#ed8936"
        strokeWidth={1}
      />
    </g>
  );
};

// Laser Tower - Energy weapon, beam focus, armor penetration
const LaserTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel, baseWidth }) => {
  const isElite = towerLevel >= 3;
  
  return (
    <g>
      {/* Energy Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#3182ce"
        stroke="#2c5282"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Energy Blue */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#63b3ed"
        stroke="#3182ce"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Energy Core */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={8}
        fill="#ebf8ff"
        stroke="#3182ce"
        strokeWidth={2}
      />
      <circle
        cx={slot.x}
        cy={slot.y}
        r={4}
        fill="#3182ce"
        stroke="#2c5282"
        strokeWidth={1}
      />
      
      {/* Laser Emitter (ateşleme çıkış noktası için data attribute, animasyonlu grup) */}
      <g style={{ transformOrigin: `${slot.x}px ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}px`, animation: 'pulse 1.2s infinite alternate' }}>
        <rect
          x={slot.x - 2}
          y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
          width={4}
          height={20}
          fill="#3182ce"
          stroke="#2c5282"
          strokeWidth={1}
          rx={2}
          data-fire-origin="true"
        />
      </g>
      
      {/* Energy Rings */}
      <circle
        cx={slot.x}
        cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}
        r={6}
        fill="none"
        stroke="#3182ce"
        strokeWidth={2}
        strokeDasharray="2 2"
      />
      
      {/* Elite Laser - Dual emitters */}
      {isElite && (
        <>
          <rect
            x={slot.x - 6}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 15}
            width={3}
            height={15}
            fill="#3182ce"
            stroke="#2c5282"
            strokeWidth={1}
            rx={1.5}
          />
          <rect
            x={slot.x + 3}
            y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 15}
            width={3}
            height={15}
            fill="#3182ce"
            stroke="#2c5282"
            strokeWidth={1}
            rx={1.5}
          />
        </>
      )}
      
      {/* Energy Pulse */}
      <circle
        cx={slot.x + 10}
        cy={slot.y - 10}
        r={3}
        fill="#3182ce"
        stroke="#2c5282"
        strokeWidth={1}
      />
    </g>
  );
};

// Mortar (Mancınık) Tower - Area control, AOE
const MortarTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel: _towerLevel, baseWidth }) => {
  // Pervane için animasyonlu grup
  return (
    <g>
      {/* Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#a0522d"
        stroke="#7b341e"
        strokeWidth={2}
        rx={4}
      />
      {/* Main Body */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#deb887"
        stroke="#a0522d"
        strokeWidth={3}
        rx={6}
      />
      {/* Dönen Pervane */}
      <g style={{ transformOrigin: `${slot.x}px ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 8}px`, animation: 'spin 1.2s linear infinite' }}>
        {/* Pervane kolları */}
        {[0, 90, 180, 270].map((angle, i) => {
          const isFireOrigin = i === 0;
          return (
            <rect
              key={i}
              x={slot.x - 2}
              y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
              width={4}
              height={18}
              fill="#8b5e3c"
              stroke="#7b341e"
              strokeWidth={1}
              rx={2}
              style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${slot.x}px ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 8}px` }}
              data-fire-origin={isFireOrigin ? 'true' : undefined}
            />
          );
        })}
        {/* Pervane merkezi */}
        <circle
          cx={slot.x}
          cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 8}
          r={6}
          fill="#a0522d"
          stroke="#7b341e"
          strokeWidth={2}
        />
      </g>
      {/* Taş mermi efekti (örnek, gerçek ateşleme sırasında dinamik eklenmeli) */}
      {/* <circle cx={slot.x} cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 28} r={Math.random() * 4 + 4} fill="#7b6d5a" opacity={0.7} /> */}
    </g>
  );
};

// Flamethrower Tower - Close range, area control, burning damage
const FlamethrowerTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel: _towerLevel, baseWidth }) => {
  return (
    <g>
      {/* Industrial Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#c53030"
        stroke="#9b2c2c"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Fire Red */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#fc8181"
        stroke="#f56565"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Fuel Tank */}
      <rect
        x={slot.x - 6}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 15}
        width={12}
        height={15}
        fill="#c53030"
        stroke="#9b2c2c"
        strokeWidth={2}
        rx={3}
      />
      
      {/* Fuel Gauge */}
      <rect
        x={slot.x - 4}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 13}
        width={8}
        height={11}
        fill="#fed7d7"
        stroke="#c53030"
        strokeWidth={1}
        rx={2}
      />
      
      {/* Nozzle (ateşleme çıkış noktası için data attribute) */}
      <rect
        x={slot.x - 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
        width={4}
        height={5}
        fill="#2d3748"
        stroke="#1a202c"
        strokeWidth={1}
        rx={2}
        data-fire-origin="true"
      />
      
      {/* Fuel Lines */}
      <rect
        x={slot.x - 8}
        y={slot.y + 8}
        width={16}
        height={6}
        fill="#c53030"
        stroke="#9b2c2c"
        strokeWidth={1}
        rx={2}
      />
      
      {/* Fuel Pump */}
      <circle cx={slot.x - 5} cy={slot.y + 11} r={2} fill="#fed7d7" />
      <circle cx={slot.x + 5} cy={slot.y + 11} r={2} fill="#fed7d7" />
      
      {/* Heat Indicator */}
      <circle
        cx={slot.x + 10}
        cy={slot.y - 10}
        r={3}
        fill="#f56565"
        stroke="#c53030"
        strokeWidth={1}
      />
    </g>
  );
};

// Radar Tower - Support tower, detection, accuracy bonus
const RadarTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel: _towerLevel, baseWidth }) => {
  // Dönen radar için animasyonlu grup
  return (
    <g>
      {/* Tech Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#805ad5"
        stroke="#553c9a"
        strokeWidth={2}
        rx={4}
      />
      {/* Main Tower Body - Tech Purple */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#b794f4"
        stroke="#805ad5"
        strokeWidth={3}
        rx={6}
      />
      {/* Radar Dish (Dönen) */}
      <g style={{ transformOrigin: `${slot.x}px ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}px`, animation: 'spin 2s linear infinite' }}>
        <circle
          cx={slot.x}
          cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}
          r={12}
          fill="#e9d8fd"
          stroke="#805ad5"
          strokeWidth={2}
        />
        {/* Radar Sweep (Dönen çizgi, ateşleme çıkış noktası için data attribute) */}
        <line
          x1={slot.x}
          y1={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 10}
          x2={slot.x}
          y2={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 22}
          stroke="#805ad5"
          strokeWidth={3}
          strokeLinecap="round"
          data-fire-origin="true"
        />
      </g>
      {/* Tech Display */}
      <rect
        x={slot.x - 6}
        y={slot.y - 4}
        width={12}
        height={8}
        fill="#2d3748"
        stroke="#805ad5"
        strokeWidth={1}
        rx={2}
      />
      {/* Signal Indicators */}
      <circle cx={slot.x - 3} cy={slot.y} r={1} fill="#805ad5" />
      <circle cx={slot.x} cy={slot.y} r={1} fill="#805ad5" />
      <circle cx={slot.x + 3} cy={slot.y} r={1} fill="#805ad5" />
      {/* Detection Range */}
      <circle
        cx={slot.x + 10}
        cy={slot.y - 10}
        r={3}
        fill="#805ad5"
        stroke="#553c9a"
        strokeWidth={1}
      />
      {/* Menzil Bonusunu Gösteren Parlayan Halka */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE * 2}
        fill="none"
        stroke="#b794f4"
        strokeWidth={2}
        opacity={0.25}
        style={{ filter: 'blur(1px)', animation: 'pulse 2s infinite alternate' }}
      />
    </g>
  );
};

// Supply Depot Tower - Support tower, ammo supply, reload speed
const SupplyDepotTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel: _towerLevel, baseWidth }) => {
  // Kutu titreşim/pulse animasyonu
  return (
    <g>
      {/* Warehouse Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#d69e2e"
        stroke="#b7791f"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Supply Yellow */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#faf089"
        stroke="#d69e2e"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Supply Crates (ateşleme çıkış noktası için data attribute) */}
      <rect
        x={slot.x - 8}
        y={slot.y - 8}
        width={16}
        height={12}
        fill="#d69e2e"
        stroke="#b7791f"
        strokeWidth={2}
        rx={2}
        data-fire-origin="true"
        style={{
          animation: 'supply-pulse 1.2s infinite alternate',
          filter: 'drop-shadow(0 0 6px #faf08988)'
        }}
      />
      
      {/* Crate Details */}
      <line x1={slot.x - 8} y1={slot.y - 2} x2={slot.x + 8} y2={slot.y - 2} stroke="#b7791f" strokeWidth={1} />
      <line x1={slot.x} y1={slot.y - 8} x2={slot.x} y2={slot.y + 4} stroke="#b7791f" strokeWidth={1} />
      
      {/* Supply Icon */}
      <text
        x={slot.x}
        y={slot.y + 2}
        textAnchor="middle"
        fontSize={12}
        fill="#b7791f"
        fontWeight="bold"
      >
        📦
      </text>
      
      {/* Supply Indicator */}
      <circle
        cx={slot.x + 10}
        cy={slot.y - 10}
        r={3}
        fill="#d69e2e"
        stroke="#b7791f"
        strokeWidth={1}
      />
    </g>
  );
};

// Shield Generator Tower - Defensive tower, shield generation
const ShieldGeneratorTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel, baseWidth }) => {
  // Hasar çemberi için animasyonlu SVG
  const [active, setActive] = React.useState(true); // Kule aktif mi
  const [fade, setFade] = React.useState(false); // Güç kaybı animasyonu
  // Yükseltme/onarım ile güçlenme matematiği
  const maxLevel = 5;
  const level = Math.max(1, Math.min(towerLevel || 1, maxLevel));
  const baseDuration = 8000;
  const fadeDuration = 2000;
  const duration = baseDuration + (level - 1) * 3000; // Seviye başına +3sn
  const stroke = fade ? 2 + level : 5 + level * 2;
  const opacity = fade ? 0.2 + level * 0.1 : 0.5 + level * 0.1;
  React.useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setFade(true), duration);
    if (fade) {
      setTimeout(() => setActive(false), fadeDuration);
    }
    return () => { clearTimeout(timer); };
  }, [active, fade, duration]);
  if (!active) return null;
  return (
    <g>
      {/* Shield Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#38b2ac"
        stroke="#2c7a7b"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Shield Blue */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#81e6d9"
        stroke="#38b2ac"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Shield Generator (ateşleme çıkış noktası için data attribute) */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={10}
        fill="#e6fffa"
        stroke="#38b2ac"
        strokeWidth={2}
        data-fire-origin="true"
      />
      
      {/* Shield Pulse */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={8}
        fill="none"
        stroke="#38b2ac"
        strokeWidth={2}
        strokeDasharray="4 2"
      />
      
      {/* Shield Icon */}
      <text
        x={slot.x}
        y={slot.y + 4}
        textAnchor="middle"
        fontSize={14}
        fill="#38b2ac"
        fontWeight="bold"
      >
        🛡️
      </text>
      
      {/* Shield Indicator */}
      <circle
        cx={slot.x + 10}
        cy={slot.y - 10}
        r={3}
        fill="#38b2ac"
        stroke="#2c7a7b"
        strokeWidth={1}
      />
      {/* Hasar çemberi animasyonu */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 18}
        fill="none"
        stroke="#38b2ac"
        strokeWidth={stroke}
        opacity={opacity}
        style={{
          filter: 'blur(1px)',
          transition: 'stroke-width 1.5s, opacity 1.5s',
          strokeDasharray: '8 6',
          animation: 'defense-circle-pulse 2s infinite alternate',
        }}
      />
    </g>
  );
};

// Repair Station Tower - Support tower, healing, repair
const RepairStationTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel, baseWidth }) => {
  // Hasar çemberi için animasyonlu SVG
  const [active, setActive] = React.useState(true);
  const [fade, setFade] = React.useState(false);
  // Yükseltme/onarım ile güçlenme matematiği
  const maxLevel = 5;
  const level = Math.max(1, Math.min(towerLevel || 1, maxLevel));
  const baseDuration = 8000;
  const fadeDuration = 2000;
  const duration = baseDuration + (level - 1) * 3000;
  const stroke = fade ? 2 + level : 5 + level * 2;
  const opacity = fade ? 0.2 + level * 0.1 : 0.5 + level * 0.1;
  React.useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setFade(true), duration);
    if (fade) {
      setTimeout(() => setActive(false), fadeDuration);
    }
    return () => { clearTimeout(timer); };
  }, [active, fade, duration]);
  if (!active) return null;
  return (
    <g>
      {/* Medical Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#38a169"
        stroke="#2f855a"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Medical Green */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#68d391"
        stroke="#38a169"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Medical Cross (ateşleme çıkış noktası için data attribute) */}
      <rect
        x={slot.x - 8}
        y={slot.y - 4}
        width={16}
        height={8}
        fill="#38a169"
        stroke="#2f855a"
        strokeWidth={2}
        rx={2}
        data-fire-origin="true"
      />
      
      {/* Cross Symbol */}
      <rect x={slot.x - 1} y={slot.y - 6} width={2} height={12} fill="#e6fffa" />
      <rect x={slot.x - 6} y={slot.y - 1} width={12} height={2} fill="#e6fffa" />
      
      {/* Healing Pulse */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={6}
        fill="none"
        stroke="#38a169"
        strokeWidth={2}
        strokeDasharray="2 2"
      />
      
      {/* Repair Indicator */}
      <circle
        cx={slot.x + 10}
        cy={slot.y - 10}
        r={3}
        fill="#38a169"
        stroke="#2f855a"
        strokeWidth={1}
      />
      {/* Hasar çemberi animasyonu */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 18}
        fill="none"
        stroke="#38a169"
        strokeWidth={stroke}
        opacity={opacity}
        style={{
          filter: 'blur(1px)',
          transition: 'stroke-width 1.5s, opacity 1.5s',
          strokeDasharray: '8 6',
          animation: 'defense-circle-pulse 2s infinite alternate',
        }}
      />
    </g>
  );
};

// EMP Tower - Specialist tower, electronic disruption
const EMPTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel: _towerLevel, baseWidth }) => {
  // Patlayan halka animasyonu
  return (
    <g>
      {/* Tech Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#ed8936"
        stroke="#c05621"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Tech Orange */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#f6ad55"
        stroke="#ed8936"
        strokeWidth={3}
        rx={6}
      />
      
      {/* EMP Generator (ateşleme çıkış noktası için data attribute) */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={10}
        fill="#fed7aa"
        stroke="#ed8936"
        strokeWidth={2}
        data-fire-origin="true"
      />
      
      {/* Lightning Bolts */}
      <path
        d={`M ${slot.x - 8} ${slot.y - 8} L ${slot.x - 4} ${slot.y - 4} L ${slot.x - 6} ${slot.y} L ${slot.x - 2} ${slot.y + 4}`}
        stroke="#ed8936"
        strokeWidth={2}
        fill="none"
      />
      <path
        d={`M ${slot.x + 8} ${slot.y - 8} L ${slot.x + 4} ${slot.y - 4} L ${slot.x + 6} ${slot.y} L ${slot.x + 2} ${slot.y + 4}`}
        stroke="#ed8936"
        strokeWidth={2}
        fill="none"
      />
      
      {/* Disruption Field */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={8}
        fill="none"
        stroke="#ed8936"
        strokeWidth={2}
        strokeDasharray="3 3"
      />
      
      {/* EMP Indicator */}
      <circle
        cx={slot.x + 10}
        cy={slot.y - 10}
        r={3}
        fill="#ed8936"
        stroke="#c05621"
        strokeWidth={1}
      />
      {/* EMP patlama halkası */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE + 10}
        fill="none"
        stroke="#ed8936"
        strokeWidth={3}
        opacity={0.5}
        style={{
          strokeDasharray: '12 8',
          animation: 'emp-burst 1.5s infinite',
          filter: 'blur(1px)'
        }}
      />
    </g>
  );
};

// Stealth Detector Tower - Specialist tower, stealth detection
const StealthDetectorTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel: _towerLevel, baseWidth }) => {
  // Radar tarama animasyonu
  return (
    <g>
      {/* Detection Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#9f7aea"
        stroke="#553c9a"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Detection Purple */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#b794f4"
        stroke="#9f7aea"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Detection Scanner (ateşleme çıkış noktası için data attribute) */}
      <circle
        cx={slot.x}
        cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 8}
        r={10}
        fill="#e9d8fd"
        stroke="#9f7aea"
        strokeWidth={2}
        data-fire-origin="true"
      />
      
      {/* Scanner Beam */}
      <path
        d={`M ${slot.x} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 8} L ${slot.x - 6} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 16}`}
        stroke="#9f7aea"
        strokeWidth={2}
        strokeDasharray="2 2"
      />
      <path
        d={`M ${slot.x} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 8} L ${slot.x + 6} ${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 16}`}
        stroke="#9f7aea"
        strokeWidth={2}
        strokeDasharray="2 2"
      />
      
      {/* Detection Icon */}
      <text
        x={slot.x}
        y={slot.y + 4}
        textAnchor="middle"
        fontSize={12}
        fill="#9f7aea"
        fontWeight="bold"
      >
        👁️
      </text>
      
      {/* Detection Indicator */}
      <circle
        cx={slot.x + 10}
        cy={slot.y - 10}
        r={3}
        fill="#9f7aea"
        stroke="#553c9a"
        strokeWidth={1}
      />
      {/* Radar tarama animasyonu */}
      <circle
        cx={slot.x}
        cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 8}
        r={14}
        fill="none"
        stroke="#9f7aea"
        strokeWidth={2}
        opacity={0.3}
        style={{
          strokeDasharray: '6 6',
          animation: 'radar-sweep 2s linear infinite'
        }}
      />
    </g>
  );
};

// Air Defense Tower - Specialist tower, anti-air
const AirDefenseTower: React.FC<TowerRenderProps & { baseWidth: number }> = ({ slot, towerLevel: _towerLevel, baseWidth }) => {
  // Füze ateşleme animasyonu
  return (
    <g>
      {/* Military Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#2d3748"
        stroke="#1a202c"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Military Gray */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#718096"
        stroke="#2d3748"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Anti-Air Missiles (ateşleme çıkış noktası için data attribute) */}
      <rect
        x={slot.x - 4}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
        width={8}
        height={20}
        fill="#2d3748"
        stroke="#1a202c"
        strokeWidth={2}
        rx={4}
        data-fire-origin="true"
        style={{
          animation: 'missile-fire 1.1s infinite',
          filter: 'drop-shadow(0 0 8px #fff8)'
        }}
      />
      
      {/* Missile Launcher */}
      <rect
        x={slot.x - 6}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 5}
        width={12}
        height={10}
        fill="#4a5568"
        stroke="#2d3748"
        strokeWidth={2}
        rx={3}
      />
      
      {/* Targeting System */}
      <circle
        cx={slot.x}
        cy={slot.y - 4}
        r={6}
        fill="#e2e8f0"
        stroke="#2d3748"
        strokeWidth={1}
      />
      
      {/* Crosshair */}
      <line x1={slot.x - 4} y1={slot.y - 4} x2={slot.x + 4} y2={slot.y - 4} stroke="#2d3748" strokeWidth={1} />
      <line x1={slot.x} y1={slot.y - 8} x2={slot.x} y2={slot.y} stroke="#2d3748" strokeWidth={1} />
      
      {/* Air Defense Indicator */}
      <circle
        cx={slot.x + 10}
        cy={slot.y - 10}
        r={3}
        fill="#2d3748"
        stroke="#1a202c"
        strokeWidth={1}
      />
    </g>
  );
}; 