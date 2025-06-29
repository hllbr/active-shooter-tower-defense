import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../models/store';
import { playSound } from '../../../utils/sound';
import { OverviewTab } from './OverviewTab';
import { BuildsTab } from './BuildsTab';
import { StatisticsTab } from './StatisticsTab';
import { StrategyTab } from './StrategyTab';
import { AchievementsTab } from './AchievementsTab';
import './CommandCenter.css';

const TABS: { [key: string]: string } = {
  overview: 'Genel Bakış',
  builds: 'Mevcut Build',
  achievements: 'Başarımlar',
  statistics: 'İstatistikler',
  strategy: 'Strateji Danışmanı'
};

export const CommandCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const gameState = useGameStore();

  useEffect(() => {
    if (isOpen) {
      playSound('levelupwav'); // Temporary - will use command-center-open.wav
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, onClose]);

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    playSound('levelupwav'); // Temporary - will use ui-tab-switch.wav
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'builds':
        return <BuildsTab />;
      case 'achievements':
        return <AchievementsTab />;
      case 'statistics':
        return <StatisticsTab />;
      case 'strategy':
        return <StrategyTab />;
      default:
        return <div>Bu sekme henüz geliştiriliyor...</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-center-overlay">
      <div className="command-center-window">
        <div className="command-center-header">
          <div className="command-center-title">
            <span>🎯</span>
            KOMUTA MERKEZİ
            <span className="wave-indicator">🌊 Dalga {gameState.currentWave}</span>
          </div>
          <button className="close-button" onClick={onClose} title="Kapat (ESC)">
            ✕
          </button>
        </div>

        <div className="tab-navigation">
          {Object.entries(TABS).map(([key, label]) => (
            <button
              key={key}
              className={`tab-button ${activeTab === key ? 'active' : ''}`}
              onClick={() => switchTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}; 