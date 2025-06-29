import React, { useCallback } from 'react';
import type { TabType, TabConfig } from './types';
import { tabStyles, getTabButtonStyle, getPriorityBadgeStyle } from './styles';

interface UpgradeTabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const UpgradeTabNavigation: React.FC<UpgradeTabNavigationProps> = ({ 
  activeTab,
  onTabChange 
}) => {
  // Tab configuration - Ana componentten taşındı
  const tabs: TabConfig[] = [
    { 
      id: 'dice', 
      name: '🎲 İndirim Merkezi', 
      color: '#ef4444',
      priority: '🔥 ÖNCE BU'
    },
    { 
      id: 'core', 
      name: '🏪 Temel Güçler', 
      color: '#4ade80'
    },
    { 
      id: 'packages', 
      name: '🎁 Kombo Paketler', 
      color: '#fbbf24'
    },
    { 
      id: 'advanced', 
      name: '⚡ Elite Sistemler', 
      color: '#8b5cf6'
    },
  ];

  // Tab change handler
  const handleTabChange = useCallback((tab: TabType) => {
    onTabChange(tab);
  }, [onTabChange]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    e.currentTarget.style.transform = isActive ? 'translateY(-1px)' : 'translateY(0)';
  };

  return (
    <div style={tabStyles.tabNavigation}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDiceTab = tab.id === 'dice';
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
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