import React from 'react';
import type { TowerClass } from '../../../models/gameTypes';

interface FirstTowerHighlightProps {
  _slotIndex: number;
  towerClass: TowerClass;
  towerName: string;
}

/**
 * First Tower Highlight Component
 * Shows a tutorial highlight for the first placed tower with animated tag
 */
export const FirstTowerHighlight = ({ _slotIndex, towerClass, towerName }: FirstTowerHighlightProps) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [animationPhase, setAnimationPhase] = React.useState(0);

  React.useEffect(() => {
    // Start animation sequence
    const timer1 = setTimeout(() => setAnimationPhase(1), 500);
    const timer2 = setTimeout(() => setAnimationPhase(2), 1500);
    const timer3 = setTimeout(() => setAnimationPhase(3), 3000);
    const timer4 = setTimeout(() => setIsVisible(false), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  if (!isVisible) return null;

  const getAnimationStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      top: '-60px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      pointerEvents: 'none',
      transition: 'all 0.5s ease-in-out',
    };

    switch (animationPhase) {
      case 0:
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'translateX(-50%) translateY(20px)',
        };
      case 1:
        return {
          ...baseStyle,
          opacity: 1,
          transform: 'translateX(-50%) translateY(0)',
        };
      case 2:
        return {
          ...baseStyle,
          opacity: 1,
          transform: 'translateX(-50%) translateY(0) scale(1.05)',
        };
      case 3:
        return {
          ...baseStyle,
          opacity: 0.8,
          transform: 'translateX(-50%) translateY(-10px)',
        };
      default:
        return baseStyle;
    }
  };

  const getTowerClassColor = (towerClass: TowerClass): string => {
    const colorMap: Record<TowerClass, string> = {
      sniper: '#ff6b6b',
      gatling: '#4ecdc4',
      laser: '#45b7d1',
      mortar: '#96ceb4',
      flamethrower: '#feca57',
      radar: '#ff9ff3',
      supply_depot: '#54a0ff',
      shield_generator: '#5f27cd',
      repair_station: '#00d2d3',
      emp: '#ff9f43',
      stealth_detector: '#10ac84',
      air_defense: '#ee5a24'
    };
    return colorMap[towerClass] || '#ffffff';
  };

  return (
    <div style={getAnimationStyle()}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 100%)',
          border: `2px solid ${getTowerClassColor(towerClass)}`,
          borderRadius: '12px',
          padding: '8px 16px',
          boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 20px ${getTowerClassColor(towerClass)}40`,
          backdropFilter: 'blur(10px)',
          minWidth: '120px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: getTowerClassColor(towerClass),
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '2px',
          }}
        >
          Your First Tower
        </div>
        <div
          style={{
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {towerName}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `8px solid ${getTowerClassColor(towerClass)}`,
          }}
        />
      </div>
    </div>
  );
}; 