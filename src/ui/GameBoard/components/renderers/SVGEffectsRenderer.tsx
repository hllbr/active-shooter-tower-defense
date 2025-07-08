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
      
      // Copy the ref value to avoid stale closure
      const animationElements = animationElementsRef.current;
      
      // Stop all CSS animations on tracked elements
      animationElements.forEach(element => {
        if (element && (element as HTMLElement).style) {
          const htmlElement = element as HTMLElement;
          htmlElement.style.animation = 'none';
          htmlElement.style.animationPlayState = 'paused';
        }
      });
      
      // Clear the tracking set
      animationElements.clear();
      
      if (GAME_CONSTANTS.DEBUG_MODE) {
        // Debug logging for animation cleanup can be added here
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
      {/* Enemies - Enhanced visual rendering */}
      {visibleEnemies.map((enemy: Enemy) => {
        // Enhanced enemy visuals with type-specific rendering
        if (enemy.bossType) {
          // Boss enemies with advanced visual effects
          return (
            <g key={enemy.id}>
              {/* Enhanced health bar for bosses */}
              <rect
                x={enemy.position.x - enemy.size * 0.75}
                y={enemy.position.y - enemy.size / 2 - 15}
                width={enemy.size * 1.5}
                height={8}
                fill={GAME_CONSTANTS.HEALTHBAR_BG}
                stroke="#000"
                strokeWidth={1}
                rx={3}
              />
              <rect
                x={enemy.position.x - enemy.size * 0.75}
                y={enemy.position.y - enemy.size / 2 - 15}
                width={enemy.size * 1.5 * (enemy.health / enemy.maxHealth)}
                height={8}
                fill={enemy.health > enemy.maxHealth * 0.3 ? "#ff4444" : "#ff0000"}
                rx={3}
              />
              
              {/* Boss visual with glow effect */}
              <defs>
                <radialGradient id={`boss-gradient-${enemy.id}`} cx="0.3" cy="0.3">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor={enemy.color} />
                </radialGradient>
              </defs>
              
              {/* Boss outer glow */}
              <AnimatedPulseCircle
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size / 2 + 10}
                fill={enemy.color}
                stroke="none"
                strokeWidth={0}
                opacity={0.3}
              />
              
              {/* Boss main body */}
              <circle
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size / 2}
                fill={`url(#boss-gradient-${enemy.id})`}
                stroke="#000"
                strokeWidth={4}
              />
              
              {/* Boss decorative elements */}
              {[0, 60, 120, 180, 240, 300].map((angle, index) => (
                <circle
                  key={index}
                  cx={enemy.position.x + (enemy.size / 3) * Math.cos(angle * Math.PI / 180)}
                  cy={enemy.position.y + (enemy.size / 3) * Math.sin(angle * Math.PI / 180)}
                  r={enemy.size / 8}
                  fill={enemy.color}
                  stroke="#000"
                  strokeWidth={2}
                />
              ))}
              
              {/* Boss center core with pulse */}
              <AnimatedPulseCircle
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size / 4}
                fill="#fff"
                stroke="none"
                strokeWidth={0}
                opacity={0.8}
              />
              
              {/* Boss type indicator */}
              <text
                x={enemy.position.x}
                y={enemy.position.y + enemy.size / 2 + 25}
                textAnchor="middle"
                fill="#fff"
                fontSize="16"
                fontWeight="bold"
                stroke="#000"
                strokeWidth={1}
              >
                {enemy.bossType === 'legendary' ? '👑' : enemy.bossType === 'major' ? '⚔️' : '🛡️'}
              </text>
              
              {/* Boss phase indicator */}
              {enemy.bossPhase && (
                <text
                  x={enemy.position.x - enemy.size / 2}
                  y={enemy.position.y - enemy.size / 2 - 20}
                  textAnchor="middle"
                  fill="#ff6b35"
                  fontSize="12"
                  fontWeight="bold"
                >
                  Phase {enemy.bossPhase}
                </text>
              )}
            </g>
          );
        } else if (enemy.isSpecial) {
          // Special enemies with enhanced effects
          return (
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
              
              {/* Enhanced special enemy with pulsing effect */}
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
              
              {/* Inner details */}
              <circle
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size / 4}
                fill="#fff"
                opacity={0.4}
              />
              
              {/* Special enemy indicator */}
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
            </g>
          );
        } else {
          // Standard enemies with type-specific visuals
          const enemyType = enemy.type || 'Basic';
          return (
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
              
              {/* Type-specific visual elements */}
              {enemyType === 'Tank' && (
                <>
                  {/* Tank tracks */}
                  <rect
                    x={enemy.position.x - enemy.size / 2}
                    y={enemy.position.y - enemy.size / 4}
                    width={enemy.size}
                    height={enemy.size / 2}
                    fill="#4a5568"
                    stroke="#000"
                    strokeWidth={2}
                    rx={4}
                  />
                  {/* Tank cannon */}
                  <rect
                    x={enemy.position.x + enemy.size / 4}
                    y={enemy.position.y - 2}
                    width={enemy.size / 2}
                    height={4}
                    fill="#2d3748"
                    stroke="#000"
                    strokeWidth={1}
                  />
                </>
              )}
              
              {enemyType === 'Scout' && (
                <>
                  {/* Scout speed lines */}
                  {[0, 1, 2].map(i => (
                    <line
                      key={i}
                      x1={enemy.position.x - enemy.size / 2 - 5 - i * 3}
                      y1={enemy.position.y - 4 + i * 4}
                      x2={enemy.position.x - enemy.size / 2 + 2 - i * 3}
                      y2={enemy.position.y - 4 + i * 4}
                      stroke="#6ee7b7"
                      strokeWidth={2}
                      opacity={0.7 - i * 0.2}
                    />
                  ))}
                </>
              )}
              
              {enemyType === 'Ghost' && (
                <AnimatedPulseCircle
                  cx={enemy.position.x}
                  cy={enemy.position.y}
                  r={enemy.size / 2 + 3}
                  fill={enemy.color}
                  stroke="none"
                  strokeWidth={0}
                  opacity={0.3}
                />
              )}
              
              {/* Main enemy body */}
              <circle
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size / 2}
                fill={enemy.color}
                stroke="#b30000"
                strokeWidth={enemyType === 'Ghost' ? 2 : 4}
                opacity={enemyType === 'Ghost' ? 0.7 : 1}
              />
              
              {/* Type-specific overlays */}
              {enemyType === 'Assassin' && (
                <circle
                  cx={enemy.position.x}
                  cy={enemy.position.y}
                  r={enemy.size / 3}
                  fill="#000"
                  opacity={0.5}
                />
              )}
              
              {/* Type indicator emoji */}
              {(() => {
                let indicator = '';
                switch (enemyType) {
                  case 'Tank': indicator = '🛡️'; break;
                  case 'Scout': indicator = '⚡'; break;
                  case 'Ghost': indicator = '👻'; break;
                  case 'Assassin': indicator = '🗡️'; break;
                  case 'Berserker': indicator = '🔥'; break;
                  case 'Shaman': indicator = '🔮'; break;
                  case 'Archer': indicator = '🏹'; break;
                  case 'Demon': indicator = '😈'; break;
                  case 'Wraith': indicator = '💜'; break;
                  case 'Golem': indicator = '🗿'; break;
                  case 'Phoenix': indicator = '🔥'; break;
                  default: indicator = '';
                }
                
                return indicator ? (
                  <text
                    x={enemy.position.x}
                    y={enemy.position.y + enemy.size / 2 + 18}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12"
                    fontWeight="bold"
                    stroke="#000"
                    strokeWidth={0.5}
                  >
                    {indicator}
                  </text>
                ) : null;
              })()}
            </g>
          );
        }
      })}

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

      {/* Effects - Only render visible ones with reduced size */}
      {visibleEffects.map((effect: Effect) => {
        // 🎆 FIXED: Reduced explosion sizes for better gameplay visibility
        const scaleFactor = 0.4; // Reduce all effects to 40% of original size
        const adjustedRadius = Math.min(
          (effect.radius * effect.life * scaleFactor) / effect.maxLife,
          60 // Maximum explosion radius to prevent screen coverage
        );
        
        return (
          <circle
            key={effect.id}
            cx={effect.position.x}
            cy={effect.position.y}
            r={adjustedRadius}
            fill={effect.color}
            fillOpacity={Math.min(effect.life / effect.maxLife, 0.5)} // Max 50% opacity for better visibility
            stroke={effect.color}
            strokeOpacity={Math.min(effect.life / effect.maxLife, 0.3)} // Subtle border
            strokeWidth={1}
          />
        );
      })}

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