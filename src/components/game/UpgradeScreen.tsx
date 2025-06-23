import React, { useState } from 'react';
import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/Constants';
import { DiceRoller } from './upgrades/DiceRoller';
import { FireUpgrades } from './upgrades/FireUpgrades';
import { UpgradePackages } from './upgrades/UpgradePackages';
import { ShieldUpgrades } from './upgrades/ShieldUpgrades';
import { DefenseUpgrades } from './upgrades/DefenseUpgrades';
import { PowerMarket } from './upgrades/PowerMarket';

type TabType = 'dice' | 'core' | 'packages' | 'advanced';

export const UpgradeScreen: React.FC = () => {
  const nextWave = useGameStore((s) => s.nextWave);
  const resetDice = useGameStore((s) => s.resetDice);
  const bulletLevel = useGameStore((s) => s.bulletLevel);
  const startPreparation = useGameStore(s => s.startPreparation);
  const setRefreshing = useGameStore(s => s.setRefreshing);
  const discountMultiplier = useGameStore((s) => s.discountMultiplier);
  const gold = useGameStore((s) => s.gold);
  
  const [activeTab, setActiveTab] = useState<TabType>('dice');

  const tabs = [
    { 
      id: 'dice' as TabType, 
      name: '🎲 İndirim Merkezi', 
      color: '#ef4444',
      priority: '🔥 ÖNCE BU'
    },
    { 
      id: 'core' as TabType, 
      name: '🏪 Temel Güçler', 
      color: '#4ade80'
    },
    { 
      id: 'packages' as TabType, 
      name: '🎁 Kombo Paketler', 
      color: '#fbbf24'
    },
    { 
      id: 'advanced' as TabType, 
      name: '⚡ Elite Sistemler', 
      color: '#8b5cf6'
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dice':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 30 }}>
            {/* Enhanced Dice System */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))',
              borderRadius: 20,
              padding: 30,
              border: '4px solid #ef4444',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ef4444', marginBottom: 20 }}>
                🎲 Evrensel İndirim Sistemi
              </div>
              
              <DiceRoller />
              
              <div style={{ 
                fontSize: 16, 
                color: '#ccc', 
                marginTop: 20,
                lineHeight: 1.6,
                maxWidth: 600,
                margin: '20px auto 0'
              }}>
                Zar at ve <strong style={{ color: '#fbbf24' }}>TÜM yükseltmelerde</strong> büyük indirimler kazan!<br/>
                İndirimler geçerli kategoriler: <span style={{ color: '#4ade80' }}>Temel Güçler</span>, 
                <span style={{ color: '#fbbf24' }}> Kombo Paketler</span>, 
                <span style={{ color: '#8b5cf6' }}> Elite Sistemler</span>
              </div>
            </div>

            {/* Current Discount Status */}
            <div style={{
              padding: 25,
              borderRadius: 16,
              border: `3px solid ${discountMultiplier === 0 ? '#ff4444' : discountMultiplier > 1 ? '#4ade80' : '#fbbf24'}`,
              background: `linear-gradient(135deg, ${discountMultiplier === 0 ? 'rgba(255, 68, 68, 0.2)' : discountMultiplier > 1 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)'}, rgba(0,0,0,0.1))`,
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: 20, 
                fontWeight: 'bold', 
                color: discountMultiplier === 0 ? '#ff4444' : discountMultiplier > 1 ? '#4ade80' : '#fbbf24',
                marginBottom: 16
              }}>
                {discountMultiplier === 0 ? '❌ Tüm İndirimler İptal!' : 
                 discountMultiplier > 1 ? `🎉 SÜPER İNDİRİM: +${Math.round((discountMultiplier - 1) * 100)}%` : 
                 '✅ Normal İndirimler Aktif'}
              </div>
              
              <div style={{ 
                fontSize: 14,
                color: '#ddd',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 15,
                marginTop: 20
              }}>
                <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
                  <div style={{ color: '#4ade80', fontWeight: 'bold' }}>🏪 Temel Güçler</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Ateş + Kalkan + Savunma</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
                  <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>🎁 Kombo Paketler</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Wave-özel kombolar</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
                  <div style={{ color: '#8b5cf6', fontWeight: 'bold' }}>⚡ Elite Sistemler</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Enerji + Aksiyon + Elite</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'core':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <FireUpgrades />
            <ShieldUpgrades />
            {bulletLevel >= GAME_CONSTANTS.BULLET_TYPES.length && <DefenseUpgrades />}
          </div>
        );
      case 'packages':
        return <UpgradePackages />;
      case 'advanced':
        return <PowerMarket />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
          color: '#ffffff',
          padding: 24,
          borderRadius: 20,
          width: '96%',
          maxWidth: 1200,
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          border: `3px solid ${GAME_CONSTANTS.GOLD_COLOR}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        }}
      >
        {/* Header with Gold Display */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          background: 'rgba(255,215,0,0.08)',
          borderRadius: 12,
          border: '2px solid rgba(255,215,0,0.3)'
        }}>
          <div style={{ 
            textAlign: 'center',
            flex: 1
          }}>
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: 30, 
              color: GAME_CONSTANTS.GOLD_COLOR,
              textShadow: '0 0 20px rgba(255,215,0,0.5)'
            }}>
              🛠️ Yükseltme Merkezi
            </span>
          </div>
          
          {/* Gold Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.1))',
            padding: '12px 20px',
            borderRadius: 12,
            border: '2px solid rgba(255,215,0,0.4)',
            boxShadow: '0 4px 12px rgba(255,215,0,0.3)'
          }}>
            <div style={{ fontSize: 24 }}>💰</div>
            <div style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: GAME_CONSTANTS.GOLD_COLOR,
              textShadow: '0 0 10px rgba(255,215,0,0.5)',
              minWidth: 80,
              textAlign: 'right'
            }}>
              {gold.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 12
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: tab.id === 'dice' ? '20px 24px' : '16px 20px',
                borderRadius: 12,
                border: `3px solid ${activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.1)'}`,
                background: activeTab === tab.id 
                  ? `linear-gradient(135deg, ${tab.color}40, ${tab.color}20)` 
                  : 'rgba(0,0,0,0.3)',
                color: activeTab === tab.id ? tab.color : '#ccc',
                cursor: 'pointer',
                fontSize: tab.id === 'dice' ? 16 : 14,
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                position: 'relative',
                transform: activeTab === tab.id ? 'translateY(-2px)' : 'none',
                boxShadow: activeTab === tab.id ? `0 8px 24px ${tab.color}40` : 'none',
              }}
            >
              {/* Priority Badge */}
              {tab.priority && (
                <div style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  background: '#ff4444',
                  color: 'white',
                  fontSize: 9,
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: 8,
                  animation: 'pulse 2s infinite'
                }}>
                  {tab.priority}
                </div>
              )}
              
              <div>{tab.name}</div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: 16,
            border: '2px solid rgba(255,255,255,0.1)',
          }}
        >
          {renderTabContent()}
        </div>

        {/* Simplified Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          paddingTop: 16, 
          borderTop: '2px solid rgba(255,215,0,0.3)',
          background: 'rgba(255,215,0,0.05)',
          borderRadius: 12,
          padding: 16
        }}>
          <button
            onClick={() => {
              setRefreshing(false);
              nextWave();
              startPreparation();
              resetDice();
            }}
            style={{
              padding: '18px 40px',
              fontSize: 24,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 8px 24px rgba(74, 222, 128, 0.4)',
              transition: 'all 0.3s ease',
              minWidth: 200,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(74, 222, 128, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 222, 128, 0.4)';
            }}
          >
            🚀 Savaşa Devam
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );
}; 