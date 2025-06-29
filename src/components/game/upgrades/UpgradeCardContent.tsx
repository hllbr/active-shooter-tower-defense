import React from 'react';

interface UpgradeCardContentProps {
  description: string;
  additionalInfo?: string;
  color: string;
}

export const UpgradeCardContent: React.FC<UpgradeCardContentProps> = ({
  description,
  additionalInfo,
  color
}) => {
  return (
    <div style={{ 
      fontSize: 13, 
      color: '#ddd', 
      lineHeight: 1.4,
      flex: 1
    }}>
      {description}
      {additionalInfo && (
        <div style={{ 
          marginTop: 8, 
          fontSize: 11, 
          color: color, 
          opacity: 0.8,
          fontStyle: 'italic' 
        }}>
          {additionalInfo}
        </div>
      )}
    </div>
  );
}; 