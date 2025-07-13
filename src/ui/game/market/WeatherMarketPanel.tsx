/**
 * 🌦️ Weather Effects Market Panel
 * Clean and simple UI for purchasing weather effect cards
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../models/store';
import { weatherEffectMarket, type WeatherEffectCard } from '../../../game-systems/market/WeatherEffectMarket';
import { playSound } from '../../../utils/sound/soundEffects';

interface WeatherMarketPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherMarketPanel: React.FC<WeatherMarketPanelProps> = ({ isOpen, onClose }) => {
  const { gold } = useGameStore();
  const [availableCards, setAvailableCards] = useState<WeatherEffectCard[]>([]);
  const [ownedCards, setOwnedCards] = useState<WeatherEffectCard[]>([]);
  const [activeTab, setActiveTab] = useState<'market' | 'owned'>('market');
  const [activeEffects, setActiveEffects] = useState<Array<{ card: WeatherEffectCard; timeRemaining: number }>>([]);

  // Update cards and effects
  useEffect(() => {
    if (isOpen) {
      setAvailableCards(weatherEffectMarket.getAvailableCards());
      setOwnedCards(weatherEffectMarket.getOwnedCards());
      setActiveEffects(weatherEffectMarket.getActiveEffects());
    }
  }, [isOpen]);

  // Update active effects timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEffects(weatherEffectMarket.getActiveEffects());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePurchaseCard = (cardId: string) => {
    const success = weatherEffectMarket.purchaseCard(cardId);
    if (success) {
      setAvailableCards(weatherEffectMarket.getAvailableCards());
      setOwnedCards(weatherEffectMarket.getOwnedCards());
      playSound('coin-collect');
    } else {
      playSound('error');
    }
  };


  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };



  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1A202C',
          border: '2px solid #4A5568',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '800px',
          maxHeight: '80vh',
          width: '90%',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            🌦️ Hava Durumu Mağazası
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ color: '#F59E0B', fontSize: '18px', fontWeight: 'bold' }}>
              💰 {gold.toLocaleString()}
            </div>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#EF4444',
                color: '#FFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Active Effects Bar */}
        {activeEffects.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#2D3748', borderRadius: '8px' }}>
            <h3 style={{ color: '#FFF', fontSize: '16px', margin: '0 0 8px 0' }}>⚡ Aktif Efektler:</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {activeEffects.map(({ card, timeRemaining }) => (
                <div 
                  key={card.id}
                  style={{
                    backgroundColor: '#4A5568',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{card.icon}</span>
                  <span style={{ color: '#FFF', fontSize: '14px' }}>{card.name}</span>
                  <span style={{ color: '#F59E0B', fontSize: '12px' }}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '20px', backgroundColor: '#2D3748', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setActiveTab('market')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === 'market' ? '#4A5568' : 'transparent',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.2s'
            }}
          >
            🛒 Mağaza ({availableCards.length})
          </button>
          <button
            onClick={() => setActiveTab('owned')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === 'owned' ? '#4A5568' : 'transparent',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.2s'
            }}
          >
            📦 Sahip Olunan ({ownedCards.length})
          </button>
        </div>

        {/* Content */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '4px' }}>
          {activeTab === 'market' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
              {availableCards.map((card) => (
                <WeatherEffectCard
                  key={card.id}
                  card={card}
                  gold={gold}
                  onPurchase={() => handlePurchaseCard(card.id)}
                  mode="purchase"
                />
              ))}
              {availableCards.length === 0 && (
                <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px', fontSize: '18px' }}>
                  🎉 Tüm kartları satın aldınız!
                </div>
              )}
            </div>
          )}

          {activeTab === 'owned' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
              {ownedCards.map((card) => (
                <WeatherEffectCard
                  key={card.id}
                  card={card}
                  gold={gold}
                  mode="activate"
                  isActive={activeEffects.some(effect => effect.card.id === card.id)}
                />
              ))}
              {ownedCards.length === 0 && (
                <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px', fontSize: '18px' }}>
                  📦 Henüz hiç kart satın almadınız
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual Weather Effect Card Component
interface WeatherEffectCardProps {
  card: WeatherEffectCard;
  gold: number;
  onPurchase?: () => void;
  onActivate?: () => void;
  mode: 'purchase' | 'activate';
  isActive?: boolean;
}

const WeatherEffectCard: React.FC<WeatherEffectCardProps> = ({
  card,
  gold,
  onPurchase,
  onActivate,
  mode,
  isActive = false
}) => {
  const canAfford = gold >= card.cost;
  
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };
  
  const rarityColor = getRarityColor(card.rarity);
  
  const getEffectTypeColor = (type: string): string => {
    switch (type) {
      case 'offensive': return '#EF4444';
      case 'defensive': return '#3B82F6';
      case 'utility': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getEffectTypeText = (type: string): string => {
    switch (type) {
      case 'offensive': return '⚔️ Saldırı';
      case 'defensive': return '🛡️ Savunma';
      case 'utility': return '🔧 Yardımcı';
      default: return type;
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#2D3748',
        border: `2px solid ${rarityColor}`,
        borderRadius: '12px',
        padding: '16px',
        position: 'relative',
        opacity: (mode === 'purchase' && !canAfford) || isActive ? 0.7 : 1,
        transition: 'all 0.2s ease'
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>{card.icon}</span>
          <div>
            <h3 style={{ color: '#FFF', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              {card.name}
            </h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span 
                style={{ 
                  backgroundColor: getEffectTypeColor(card.effectType),
                  color: '#FFF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {getEffectTypeText(card.effectType)}
              </span>
              <span 
                style={{ 
                  backgroundColor: rarityColor,
                  color: '#FFF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {card.rarity.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ color: '#CBD5E0', fontSize: '14px', lineHeight: '1.4', margin: '0 0 16px 0' }}>
        {card.description}
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '12px' }}>
        <div style={{ color: '#9CA3AF' }}>
          ⏱️ Süre: <span style={{ color: '#FFF' }}>{Math.floor(card.duration / 1000)}s</span>
        </div>
        {card.effect.damageAmount && (
          <div style={{ color: '#9CA3AF' }}>
            💥 Hasar: <span style={{ color: '#EF4444' }}>{card.effect.damageAmount}</span>
          </div>
        )}
        {card.effect.slowAmount && (
          <div style={{ color: '#9CA3AF' }}>
            🐌 Yavaşlatma: <span style={{ color: '#3B82F6' }}>%{Math.floor(card.effect.slowAmount * 100)}</span>
          </div>
        )}
        {card.effect.healAmount && (
          <div style={{ color: '#9CA3AF' }}>
            💚 İyileştirme: <span style={{ color: '#10B981' }}>{card.effect.healAmount}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      {mode === 'purchase' && onPurchase && (
        <button
          onClick={onPurchase}
          disabled={!canAfford}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: canAfford ? '#10B981' : '#6B7280',
            color: '#FFF',
            border: 'none',
            borderRadius: '8px',
            cursor: canAfford ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
        >
          💰 {card.cost.toLocaleString()} Gold
        </button>
      )}

      {mode === 'activate' && (
        <div
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4A5568',
            color: '#FFF',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isActive ? '✅ Bu dalgada aktif' : '🌊 Dalga başlayınca otomatik etkinleşir'}
        </div>
      )}
    </div>
  );
}; 