import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import type { TowerRenderProps } from '../types';

export const TowerLevel6PlusRenderer: React.FC<TowerRenderProps> = ({ slot }) => {
  const baseWidth = GAME_CONSTANTS.TOWER_SIZE + 8;
  const topWidth = GAME_CONSTANTS.TOWER_SIZE - 4;
  
  return (
    <g>
      {/* Marble Foundation */}
      <rect
        x={slot.x - baseWidth / 2}
        y={slot.y + GAME_CONSTANTS.TOWER_SIZE / 2}
        width={baseWidth}
        height={12}
        fill="#F5F5DC"
        stroke="#DEB887"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Main Tower Body - Marble */}
      <rect
        x={slot.x - GAME_CONSTANTS.TOWER_SIZE / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2}
        width={GAME_CONSTANTS.TOWER_SIZE}
        height={GAME_CONSTANTS.TOWER_SIZE}
        fill="#FFF8DC"
        stroke="#DEB887"
        strokeWidth={3}
        rx={6}
      />
      
      {/* Marble Veins */}
      <path d={`M ${slot.x - 12} ${slot.y - 12} Q ${slot.x} ${slot.y - 8} ${slot.x + 12} ${slot.y - 12}`} stroke="#DEB887" strokeWidth={1} fill="none" opacity={0.6} />
      <path d={`M ${slot.x - 12} ${slot.y} Q ${slot.x} ${slot.y + 4} ${slot.x + 12} ${slot.y}`} stroke="#DEB887" strokeWidth={1} fill="none" opacity={0.6} />
      <path d={`M ${slot.x - 12} ${slot.y + 12} Q ${slot.x} ${slot.y + 8} ${slot.x + 12} ${slot.y + 12}`} stroke="#DEB887" strokeWidth={1} fill="none" opacity={0.6} />
      
      {/* Second Floor - Gold accents */}
      <rect
        x={slot.x - topWidth / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 20}
        width={topWidth}
        height={20}
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Third Floor - Royal Purple */}
      <rect
        x={slot.x - (topWidth - 8) / 2}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 36}
        width={topWidth - 8}
        height={16}
        fill="#9370DB"
        stroke="#4B0082"
        strokeWidth={2}
        rx={4}
      />
      
      {/* Golden Spire */}
      <polygon
        points={`${slot.x},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 52} ${
          slot.x - 8
        },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 36} ${
          slot.x + 8
        },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 36}`}
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth={2}
      />
      
      {/* Crown on top */}
      <polygon
        points={`${slot.x - 6},${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 52} ${
          slot.x - 3
        },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} ${
          slot.x
        },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 58} ${
          slot.x + 3
        },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} ${
          slot.x + 6
        },${slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 52}`}
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth={1}
      />
      
      {/* Crown Jewels */}
      <circle cx={slot.x - 3} cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} r={2} fill="#FF1493" />
      <circle cx={slot.x} cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 58} r={2} fill="#00CED1" />
      <circle cx={slot.x + 3} cy={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 56} r={2} fill="#32CD32" />
      
      {/* Ornate Windows with Stained Glass */}
      <rect
        x={slot.x - 6}
        y={slot.y - 8}
        width={12}
        height={16}
        fill="#000000"
        stroke="#FFD700"
        strokeWidth={1}
        rx={2}
      />
      <rect
        x={slot.x - 5}
        y={slot.y - 7}
        width={10}
        height={14}
        fill="#FF69B4"
        opacity={0.6}
        rx={1}
      />
      
      <rect
        x={slot.x - 5}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 18}
        width={10}
        height={14}
        fill="#000000"
        stroke="#FFD700"
        strokeWidth={1}
        rx={2}
      />
      <rect
        x={slot.x - 4}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 17}
        width={8}
        height={12}
        fill="#00CED1"
        opacity={0.6}
        rx={1}
      />
      
      <rect
        x={slot.x - 4}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 34}
        width={8}
        height={12}
        fill="#000000"
        stroke="#FFD700"
        strokeWidth={1}
        rx={2}
      />
      <rect
        x={slot.x - 3}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 33}
        width={6}
        height={10}
        fill="#32CD32"
        opacity={0.6}
        rx={1}
      />
      
      {/* Golden Door */}
      <rect
        x={slot.x - 8}
        y={slot.y + 8}
        width={16}
        height={12}
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth={2}
        rx={2}
      />
      
      {/* Door Handle */}
      <circle
        cx={slot.x + 4}
        cy={slot.y + 14}
        r={2}
        fill="#B8860B"
        stroke="#8B4513"
        strokeWidth={1}
      />
      
      {/* Royal Banners */}
      <rect
        x={slot.x - 10}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 2}
        width={4}
        height={8}
        fill="#FF0000"
        stroke="#8B0000"
        strokeWidth={1}
      />
      <rect
        x={slot.x + 6}
        y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 2}
        width={4}
        height={8}
        fill="#0000FF"
        stroke="#00008B"
        strokeWidth={1}
      />
      
      {/* Gemstone Decorations */}
      <circle
        cx={slot.x - 8}
        cy={slot.y - 4}
        r={3}
        fill="#FF1493"
        stroke="#C71585"
        strokeWidth={1}
      />
      <circle
        cx={slot.x + 8}
        cy={slot.y - 4}
        r={3}
        fill="#00BFFF"
        stroke="#0080FF"
        strokeWidth={1}
      />
      
      {/* Royal Aura Effect */}
      <circle
        cx={slot.x}
        cy={slot.y}
        r={GAME_CONSTANTS.TOWER_SIZE / 2 + 8}
        fill="none"
        stroke="#FFD700"
        strokeWidth={1}
        opacity={0.3}
      />
    </g>
  );
}; 