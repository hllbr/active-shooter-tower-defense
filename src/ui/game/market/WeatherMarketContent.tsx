/**
 * 🌦️ Weather Market Content
 * Core weather market functionality without modal wrapper for use in upgrade screen
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../models/store';
import { weatherEffectMarket, type WeatherEffectCard } from '../../../game-systems/market/WeatherEffectMarket';
import { playSound } from '../../../utils/sound/soundEffects';
import { ScrollableGridList } from '../../common/ScrollableList';

export const WeatherMarketContent: React.FC = () => {
  const { gold } = useGameStore();
  const [availableCards, setAvailableCards] = useState<WeatherEffectCard[]>([]);
  const [ownedCards, setOwnedCards] = useState<WeatherEffectCard[]>([]);
  const [activeTab, setActiveTab] = useState<'market' | 'owned'>('market');
  const [activeEffects, setActiveEffects] = useState<Array<{ card: WeatherEffectCard; timeRemaining: number }>>([]);

  // Update cards and effects
  useEffect(() => {
    setAvailableCards(weatherEffectMarket.getAvailableCards());
    setOwnedCards(weatherEffectMarket.getOwnedCards());
    setActiveEffects(weatherEffectMarket.getActiveEffects());
  }, []);

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

  return (
    <div style={{ padding: '20px', color: '#FFF' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          🌦️ Hava Durumu Mağazası
        </h2>
        <div style={{ color: '#F59E0B', fontSize: '18px', fontWeight: 'bold' }}>
          💰 {gold.toLocaleString()}
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
      <ScrollableGridList
        items={activeTab === 'market' ? availableCards : ownedCards}
        renderItem={(card) => (
          <WeatherEffectCard
            card={card}
            gold={gold}
            onPurchase={activeTab === 'market' ? () => handlePurchaseCard(card.id) : undefined}
            mode={activeTab}
            isActive={activeTab === 'owned' ? activeEffects.some(effect => effect.card.id === card.id) : false}
          />
        )}
        keyExtractor={(card) => card.id}
        maxHeight="400px"
        gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))"
        gap="16px"
        itemMinWidth="350px"
        emptyMessage={activeTab === 'market' ? 'Şu anda satışta hava durumu efekti bulunmuyor.\nYeni efektler sonraki dalgalarda gelecek!' : 'Henüz hava durumu efektiniz bulunmuyor.\nMağaza sekmesinden satın alabilirsiniz!'}
        emptyIcon={activeTab === 'market' ? '🌤️' : '📦'}
        containerStyle={{ padding: '4px' }}
      />
    </div>
  );
};

// Weather Effect Card Component
interface WeatherEffectCardProps {
  card: WeatherEffectCard;
  gold: number;
  onPurchase?: () => void;
  mode: 'purchase' | 'activate';
  isActive?: boolean;
}

const WeatherEffectCard: React.FC<WeatherEffectCardProps> = ({
  card,
  gold,
  onPurchase,
  mode,
  isActive = false
}) => {
  const canAfford = gold >= card.cost;
  const isAvailable = mode === 'purchase' ? canAfford : !isActive;

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  const getEffectTypeColor = (effectType: string): string => {
    switch (effectType) {
      case 'offensive': return '#EF4444';
      case 'defensive': return '#10B981';
      case 'utility': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#2D3748',
        border: `2px solid ${getRarityColor(card.rarity)}`,
        borderRadius: '8px',
        padding: '16px',
        position: 'relative',
        opacity: isAvailable ? 1 : 0.6,
        transition: 'transform 0.2s, opacity 0.2s'
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>{card.icon}</span>
          <div>
            <h3 style={{ color: '#FFF', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{card.name}</h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ 
                color: getRarityColor(card.rarity), 
                fontSize: '12px', 
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {card.rarity}
              </span>
              <span style={{ 
                color: getEffectTypeColor(card.effectType), 
                fontSize: '12px', 
                fontWeight: 'bold'
              }}>
                {card.effectType}
              </span>
            </div>
          </div>
        </div>
        <div style={{ color: '#F59E0B', fontSize: '16px', fontWeight: 'bold' }}>
          {mode === 'purchase' ? `${card.cost}💰` : `${card.duration / 1000}s`}
        </div>
      </div>

      {/* Card Description */}
      <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: '1.4', margin: '0 0 12px 0' }}>
        {card.description}
      </p>

      {/* Effect Info */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ 
          color: '#D1D5DB', 
          fontSize: '13px', 
          backgroundColor: '#1A202C',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #4A5568'
        }}>
          <strong>Efekt Tipi:</strong> {card.effect.type} | <strong>Süre:</strong> {card.duration / 1000}s
        </div>
      </div>

      {/* Action Button or Info */}
      {mode === 'purchase' ? (
        <button
          onClick={onPurchase}
          disabled={!isAvailable}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: isAvailable ? '#10B981' : '#4A5568',
            color: '#FFF',
            border: 'none',
            borderRadius: '6px',
            cursor: isAvailable ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
        >
          {canAfford ? '💰 Satın Al' : '💸 Yetersiz Altın'}
        </button>
      ) : (
        <div
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4A5568',
            color: '#FFF',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          {isActive ? '✅ Bu dalgada aktif' : '🌊 Dalga başlayınca otomatik etkinleşir'}
        </div>
      )}
    </div>
  );
}; 