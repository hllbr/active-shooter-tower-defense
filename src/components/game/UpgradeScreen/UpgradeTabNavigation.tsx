import React from 'react';
import type { TabNavigationProps } from './types';
import { upgradeScreenStyles, getTabButtonStyle, getPriorityBadgeStyle } from './styles';

export const UpgradeTabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    e.currentTarget.style.transform = isActive ? 'translateY(-1px)' : 'translateY(0)';
  };

  return (
    <div style={upgradeScreenStyles.tabNavigation}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDiceTab = tab.id === 'dice';
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={getTabButtonStyle(isActive, tab.color, isDiceTab)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={(e) => handleMouseLeave(e, isActive)}
          >
            {/* Priority Badge */}
            {tab.priority && (
              <div style={getPriorityBadgeStyle()}>
                {tab.priority}
              </div>
            )}
            
            <div>{tab.name}</div>
          </button>
        );
      })}
    </div>
  );
}; 