import React, { useRef, useEffect } from 'react';
import type { Enemy } from '../../../../models/gameTypes';
// import { GAME_CONSTANTS } from '../../../../utils/constants'; // Unused but may be needed later
import {
  HealthBar,
  StatusIndicators,
  BossRenderer,
  SpecialEnemyRenderer,
  StandardEnemyRenderer,
  BossEffects,
  TypeIndicator
} from './helpers/enemyParts';

interface EnemyVisualRendererProps {
  enemy: Enemy;
  isVisible: boolean;
}

/**
 * Enhanced Enemy Visual Renderer with type-specific visuals
 */
export const EnemyVisualRenderer: React.FC<EnemyVisualRendererProps> = ({ enemy, isVisible }) => {
  const groupRef = useRef<SVGGElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isVisible) return;

    // Boss entrance animation
    if (enemy.bossType && enemy.cinematicState === 'entrance') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      startEntranceAnimation();
    }

    // Phase transition animation
    if (enemy.bossType && enemy.cinematicState === 'phase_transition') {
      startPhaseTransitionAnimation();
    }

    // Death animation
    if (enemy.cinematicState === 'defeat') {
      startDeathAnimation();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemy.cinematicState, enemy.bossType, isVisible]);

  const startEntranceAnimation = () => {
    if (!groupRef.current) return;
    
    const group = groupRef.current;
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 3000; // 3 seconds
      const progress = Math.min(elapsed / duration, 1);
      
      // Scale and opacity animation
      const scale = 0.1 + (progress * 0.9);
      const opacity = progress;
      
      group.style.transform = `scale(${scale})`;
      group.style.opacity = opacity.toString();
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const startPhaseTransitionAnimation = () => {
    if (!groupRef.current) return;
    
    const group = groupRef.current;
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 2000; // 2 seconds
      const progress = Math.min(elapsed / duration, 1);
      
      // Pulsing effect
      const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.2;
      group.style.transform = `scale(${scale})`;
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const startDeathAnimation = () => {
    if (!groupRef.current) return;
    
    const group = groupRef.current;
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 1500; // 1.5 seconds
      const progress = Math.min(elapsed / duration, 1);
      
      // Fade out and scale up
      const scale = 1 + (progress * 2);
      const opacity = 1 - progress;
      
      group.style.transform = `scale(${scale})`;
      group.style.opacity = opacity.toString();
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  if (!isVisible) return null;

  return (
    <g ref={groupRef} key={enemy.id} style={{ transformOrigin: `${enemy.position.x}px ${enemy.position.y}px` }}>
      {/* Health bar */}
      <HealthBar enemy={enemy} />
      
      {/* Status indicators */}
      <StatusIndicators enemy={enemy} />
      
      {/* Main enemy visual */}
      {enemy.bossType ? (
        <BossRenderer enemy={enemy} />
      ) : enemy.isSpecial ? (
        <SpecialEnemyRenderer enemy={enemy} />
      ) : (
        <StandardEnemyRenderer enemy={enemy} />
      )}
      
      {/* Boss-specific effects */}
      {enemy.bossType && <BossEffects enemy={enemy} />}
      
      {/* Type indicator */}
      <TypeIndicator enemy={enemy} />
    </g>
  );
};


export default EnemyVisualRenderer; 