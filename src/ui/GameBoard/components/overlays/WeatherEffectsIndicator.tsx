/**
 * 🌤️ Weather Effects Indicator
 * Shows active weather effects with simple, clean visuals
 */

import React, { useState, useEffect } from 'react';
import { weatherEffectMarket, type WeatherEffectCard } from '../../../../game-systems/market/WeatherEffectMarket';
import { useGameStore } from '../../../../models/store';

export const WeatherEffectsIndicator: React.FC = () => {
  const { weatherState } = useGameStore();
  const [activeEffects, setActiveEffects] = useState<Array<{ card: WeatherEffectCard; timeRemaining: number }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEffects(weatherEffectMarket.getActiveEffects());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getWeatherIcon = (): string => {
    switch (weatherState.currentWeather) {
      case 'storm': return '⛈️';
      case 'rain': return '🌧️';
      case 'fog': return '🌫️';
      case 'clear':
      default: return '☀️';
    }
  };

  const getWeatherName = (): string => {
    switch (weatherState.currentWeather) {
      case 'storm': return 'Fırtına';
      case 'rain': return 'Yağmur';
      case 'fog': return 'Sis';
      case 'clear':
      default: return 'Açık';
    }
  };

  if (activeEffects.length === 0 && weatherState.currentWeather === 'clear') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '250px'
      }}
    >
      {/* Current Weather */}
      <div
        style={{
          backgroundColor: 'rgba(45, 55, 72, 0.9)',
          border: '1px solid #4A5568',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(4px)'
        }}
      >
        <span style={{ fontSize: '16px' }}>{getWeatherIcon()}</span>
        <div>
          <div style={{ color: '#FFF', fontSize: '14px', fontWeight: 'bold' }}>
            {getWeatherName()}
          </div>
          <div style={{ color: '#CBD5E0', fontSize: '11px' }}>
            Yoğunluk: %{Math.floor(weatherState.weatherIntensity * 100)}
          </div>
        </div>
      </div>

      {/* Active Weather Effects */}
      {activeEffects.map(({ card, timeRemaining }) => (
        <div
          key={card.id}
          style={{
            backgroundColor: 'rgba(139, 92, 246, 0.9)',
            border: '1px solid #8B5CF6',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(4px)',
            animation: 'simple-pulse 2s ease-in-out infinite'
          }}
        >
          <span style={{ fontSize: '16px' }}>{card.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#FFF', fontSize: '12px', fontWeight: 'bold' }}>
              {card.name}
            </div>
            <div style={{ color: '#E6FFFA', fontSize: '11px' }}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      ))}

      {/* Simple animation styles */}
      <style>{`
        @keyframes simple-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}; 