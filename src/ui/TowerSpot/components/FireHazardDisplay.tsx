import React, { useState, useCallback, useEffect } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { FireHazardManager } from '../../../game-systems/FireHazardManager';
import type { TowerSlot } from '../../../models/gameTypes';

interface FireHazardDisplayProps {
  slot: TowerSlot;
  slotIdx: number;
}

export const FireHazardDisplay: React.FC<FireHazardDisplayProps> = ({ slot, slotIdx: _slotIdx }) => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isExtinguishing, setIsExtinguishing] = useState(false);

  const tower = slot.tower;

  // Update remaining time
  useEffect(() => {
    if (!tower || !FireHazardManager.isTowerBurning(tower)) {
      return;
    }

    const updateTime = () => {
      const time = FireHazardManager.getRemainingTime(tower);
      setRemainingTime(time);
      
      // Check if time expired
      if (time <= 0) {
        // Tower will be destroyed by the game loop
        return;
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, [tower]);

  const handleExtinguish = useCallback(() => {
    if (!tower || isExtinguishing) return;
    
    setIsExtinguishing(true);
    FireHazardManager.extinguishFire(tower);
    
    // Reset extinguishing state after animation
    setTimeout(() => setIsExtinguishing(false), 1000);
  }, [tower, isExtinguishing]);

  if (!tower || !FireHazardManager.isTowerBurning(tower)) {
    return null;
  }

  const timePercentage = (remainingTime / GAME_CONSTANTS.FIRE_HAZARD.TIME_LIMIT) * 100;
  const isCritical = timePercentage < 30;

  return (
    <>
      {/* Fire Animation */}
      <g className="fire-hazard-animation">
        {/* Main fire */}
        <g transform={`translate(${slot.x}, ${slot.y - 20})`}>
          {/* Fire base */}
          <ellipse
            cx="0"
            cy="0"
            rx="12"
            ry="8"
            fill="#ff6b35"
            opacity="0.8"
            className="fire-base"
          />
          
          {/* Fire flames */}
          <path
            d="M -8 0 Q -4 -15 0 -25 Q 4 -15 8 0 Z"
            fill="#ff8c42"
            opacity="0.9"
            className="fire-flame-1"
          />
          <path
            d="M -6 0 Q -2 -12 0 -20 Q 2 -12 6 0 Z"
            fill="#ffa726"
            opacity="0.8"
            className="fire-flame-2"
          />
          <path
            d="M -4 0 Q 0 -10 4 0 Z"
            fill="#ffcc02"
            opacity="0.7"
            className="fire-flame-3"
          />
        </g>
        
        {/* Smoke particles */}
        <g transform={`translate(${slot.x}, ${slot.y - 35})`}>
          <circle cx="-5" cy="0" r="2" fill="#666" opacity="0.6" className="smoke-particle-1" />
          <circle cx="3" cy="-3" r="1.5" fill="#888" opacity="0.5" className="smoke-particle-2" />
          <circle cx="0" cy="-8" r="1" fill="#aaa" opacity="0.4" className="smoke-particle-3" />
        </g>
      </g>

      {/* Time Limit Bar */}
      <g transform={`translate(${slot.x}, ${slot.y + 25})`}>
        {/* Background */}
        <rect
          x="-20"
          y="0"
          width="40"
          height="4"
          fill="#333"
          rx="2"
          opacity="0.8"
        />
        
        {/* Time remaining */}
        <rect
          x="-20"
          y="0"
          width={40 * (timePercentage / 100)}
          height="4"
          fill={isCritical ? '#ff4444' : '#ff8c42'}
          rx="2"
          opacity="0.9"
          className="time-bar"
        />
      </g>

      {/* Extinguisher Button */}
      <g 
        transform={`translate(${slot.x + 25}, ${slot.y - 15})`}
        className="extinguisher-button"
        style={{ cursor: 'pointer' }}
        onClick={handleExtinguish}
      >
        {/* Extinguisher icon */}
        <circle
          cx="0"
          cy="0"
          r="12"
          fill={isExtinguishing ? '#4ade80' : '#3b82f6'}
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.9"
          className={isExtinguishing ? 'extinguishing' : ''}
        />
        
        {/* Extinguisher symbol */}
        <text
          x="0"
          y="0"
          fontSize="14"
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="middle"
          fontWeight="bold"
        >
          🧯
        </text>
        
        {/* Hover effect */}
        <circle
          cx="0"
          cy="0"
          r="12"
          fill="transparent"
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0"
          className="extinguisher-hover"
        />
      </g>

      {/* Warning Text */}
      {isCritical && (
        <text
          x={slot.x}
          y={slot.y + 40}
          fontSize="12"
          fill="#ff4444"
          textAnchor="middle"
          fontWeight="bold"
          className="fire-warning"
        >
          CRITICAL!
        </text>
      )}
    </>
  );
}; 