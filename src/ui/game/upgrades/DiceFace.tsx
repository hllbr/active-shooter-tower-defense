import React from 'react';

interface DiceFaceProps {
  roll: number | null;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  showShadow?: boolean;
}

export const DiceFace = ({ 
  roll, 
  size = 'medium', 
  color,
  showShadow = false 
}: DiceFaceProps) => {
  const getDiceFace = (rollValue: number | null): string => {
    if (!rollValue) return '';
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[rollValue - 1];
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: 28, lineHeight: 1 };
      case 'large':
        return { fontSize: 64, lineHeight: 1 };
      default:
        return { fontSize: 32, lineHeight: 1 };
    }
  };

  if (!roll) return <div style={{ width: 24 }} />;

  return (
    <span style={{
      ...getSizeStyles(),
      fontWeight: 'bold',
      color: color || '#fff',
      textShadow: showShadow ? `0 0 12px ${color || '#fff'}` : undefined,
      display: 'inline-block'
    }}>
      {getDiceFace(roll)}
    </span>
  );
}; 