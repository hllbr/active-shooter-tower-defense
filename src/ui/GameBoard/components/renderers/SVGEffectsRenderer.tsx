import React, { useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../../../../models/store';
import { GAME_CONSTANTS } from '../../../../utils/constants';
import type { Enemy, Bullet, Effect, Mine } from '../../../../models/gameTypes';

// ⚠️ FIXED: SVG Animation Memory Leak Prevention
// Enhanced effects renderer with proper animation lifecycle management
export const SVGEffectsRenderer: React.FC = () => {
  const { enemies, bullets, effects, mines } = useGameStore();
  const animationElementsRef = useRef<Set<Element>>(new Set());
  const componentMountedRef = useRef(true);
  const viewportRef = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0, y: 0, width: window.innerWidth, height: window.innerHeight
  });

  // Track animation elements for cleanup
  const trackAnimationElement = (element: Element) => {
    if (componentMountedRef.current) {
      animationElementsRef.current.add(element);
    }
  };

  // Optimized visibility check with viewport culling
  const isInViewport = (x: number, y: number, radius: number = 50): boolean => {
    const margin = radius + 100; // Extra margin for smooth transitions
    return (
      x >= viewportRef.current.x - margin &&
      x <= viewportRef.current.x + viewportRef.current.width + margin &&
      y >= viewportRef.current.y - margin &&
      y <= viewportRef.current.y + viewportRef.current.height + margin
    );
  };

  // Memoized filtered arrays for performance
  const visibleEnemies = useMemo(() => 
    enemies.filter(enemy => isInViewport(enemy.position.x, enemy.position.y, enemy.size / 2)),
    [enemies]
  );

  const visibleBullets = useMemo(() => 
    bullets.filter(bullet => isInViewport(bullet.position.x, bullet.position.y, bullet.size)),
    [bullets]
  );

  const visibleEffects = useMemo(() => 
    effects.filter(effect => isInViewport(effect.position.x, effect.position.y, effect.radius)),
    [effects]
  );

  const visibleMines = useMemo(() => 
    mines.filter(mine => isInViewport(mine.position.x, mine.position.y, mine.size)),
    [mines]
  );

  // Update viewport on scroll/resize
  useEffect(() => {
    const updateViewport = () => {
      viewportRef.current = {
        x: window.scrollX,
        y: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight
      };
    };

    window.addEventListener('scroll', updateViewport, { passive: true });
    window.addEventListener('resize', updateViewport, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  // Cleanup animations on unmount
  useEffect(() => {
    componentMountedRef.current = true;
    
    return () => {
      componentMountedRef.current = false;
      
      // Stop all CSS animations on tracked elements
      animationElementsRef.current.forEach(element => {
        if (element && (element as HTMLElement).style) {
          const htmlElement = element as HTMLElement;
          htmlElement.style.animation = 'none';
          htmlElement.style.animationPlayState = 'paused';
        }
      });
      
      // Clear the tracking set
      animationElementsRef.current.clear();
      
      if (GAME_CONSTANTS.DEBUG_MODE) {
        console.log('🎨 SVGEffectsRenderer: Animation cleanup completed');
      }
    };
  }, []);

  // Enhanced pulse animation component with cleanup
  const AnimatedPulseCircle: React.FC<{
    cx: number;
    cy: number;
    r: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity?: number;
  }> = ({ cx, cy, r, fill, stroke, strokeWidth, opacity = 0.6 }) => {
    const elementRef = useRef<SVGCircleElement>(null);
    
    useEffect(() => {
      if (elementRef.current && componentMountedRef.current) {
        trackAnimationElement(elementRef.current);
      }
    }, []);
    
    return (
      <circle
        ref={elementRef}
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
        style={{
          animation: componentMountedRef.current ? 'pulse 1.5s ease-in-out infinite alternate' : 'none'
        }}
      />
    );
  };

  // Enhanced mine light with cleanup
  const AnimatedMineLight: React.FC<{
    size: number;
  }> = ({ size }) => {
    const elementRef = useRef<SVGCircleElement>(null);
    
    useEffect(() => {
      if (elementRef.current && componentMountedRef.current) {
        trackAnimationElement(elementRef.current);
      }
    }, []);
    
    return (
      <circle
        ref={elementRef}
        cx="0"
        cy="0"
        r={size * 0.3}
        fill={GAME_CONSTANTS.MINE_VISUALS.lightColor}
        style={{
          animation: componentMountedRef.current ? 'mine-light-pulse 2s ease-in-out infinite' : 'none'
        }}
      />
    );
  };

  return (
    <>
      {/* Enemies - Only render visible ones */}
      {visibleEnemies.map((enemy: Enemy) => (
        <g key={enemy.id}>
          {/* Health bar */}
          <rect
            x={enemy.position.x - enemy.size / 2}
            y={enemy.position.y - enemy.size / 2 - 10}
            width={enemy.size}
            height={GAME_CONSTANTS.ENEMY_HEALTHBAR_HEIGHT}
            fill={GAME_CONSTANTS.HEALTHBAR_BG}
            rx={3}
          />
          <rect
            x={enemy.position.x - enemy.size / 2}
            y={enemy.position.y - enemy.size / 2 - 10}
            width={enemy.size * (enemy.health / enemy.maxHealth)}
            height={GAME_CONSTANTS.ENEMY_HEALTHBAR_HEIGHT}
            fill={enemy.health > enemy.maxHealth * 0.3 ? GAME_CONSTANTS.HEALTHBAR_GOOD : GAME_CONSTANTS.HEALTHBAR_BAD}
            rx={3}
          />
          {enemy.isSpecial ? (
            // Special microbe enemy with managed pulsing effect
            <>
              <AnimatedPulseCircle
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size / 2 + 4}
                fill="none"
                stroke={GAME_CONSTANTS.MICROBE_ENEMY.pulseColor}
                strokeWidth={2}
                opacity={0.6}
              />
              <circle
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size / 2}
                fill={enemy.color}
                stroke={GAME_CONSTANTS.MICROBE_ENEMY.borderColor}
                strokeWidth={3}
              />
              {/* Microbe indicator */}
              <text
                x={enemy.position.x}
                y={enemy.position.y + enemy.size / 2 + 15}
                textAnchor="middle"
                fill={GAME_CONSTANTS.MICROBE_ENEMY.color}
                fontSize="12"
                fontWeight="bold"
              >
                💰
              </text>
            </>
          ) : (
            // Normal enemy
            <circle
              cx={enemy.position.x}
              cy={enemy.position.y}
              r={enemy.size / 2}
              fill={enemy.color}
              stroke="#b30000"
              strokeWidth={4}
            />
          )}
        </g>
      ))}

      {/* Bullets - Only render visible ones */}
      {visibleBullets.map((bullet: Bullet) => (
        <line
          key={bullet.id}
          x1={bullet.position.x - bullet.direction.x * bullet.size}
          y1={bullet.position.y - bullet.direction.y * bullet.size}
          x2={bullet.position.x + bullet.direction.x * bullet.size}
          y2={bullet.position.y + bullet.direction.y * bullet.size}
          stroke={bullet.color}
          strokeWidth={2}
        />
      ))}

      {/* Effects - Only render visible ones */}
      {visibleEffects.map((effect: Effect) => (
        <circle
          key={effect.id}
          cx={effect.position.x}
          cy={effect.position.y}
          r={(effect.radius * effect.life) / effect.maxLife}
          fill={effect.color}
          fillOpacity={effect.life / effect.maxLife}
          stroke="none"
        />
      ))}

      {/* Mines with managed animations - Only render visible ones */}
      {visibleMines.map((mine: Mine) => (
        <g key={mine.id} transform={`translate(${mine.position.x}, ${mine.position.y})`} style={{ pointerEvents: 'none' }}>
          {/* The horns of the mine */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <circle
              key={angle}
              cx={mine.size * 0.8 * Math.cos(angle * Math.PI / 180)}
              cy={mine.size * 0.8 * Math.sin(angle * Math.PI / 180)}
              r={mine.size * 0.25}
              fill={GAME_CONSTANTS.MINE_VISUALS.bodyColor}
            />
          ))}
          {/* The main body of the mine */}
          <circle
            cx="0"
            cy="0"
            r={mine.size * 0.75}
            fill={GAME_CONSTANTS.MINE_VISUALS.bodyColor}
            stroke={GAME_CONSTANTS.MINE_VISUALS.borderColor}
            strokeWidth={3}
          />
          {/* The managed pulsing light */}
          <AnimatedMineLight size={mine.size} />
        </g>
      ))}
    </>
  );
}; 