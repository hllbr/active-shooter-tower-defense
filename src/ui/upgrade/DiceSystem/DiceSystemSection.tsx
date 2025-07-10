import React from 'react';
import type { DiceSystemSectionProps } from '../types';
import { DiceRoller } from '../../game/upgrades/DiceRoller';
import { DiceSystemDescription } from './DiceSystemDescription';
import { DiscountStatusSection } from '../Discount/DiscountStatusSection';
  
export const DiceSystemSection: React.FC<DiceSystemSectionProps> = ({ discountMultiplier }) => {
  return (
    <div style={{ 
      padding: '20px', 
      color: '#FFF',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ 
          color: '#FFF', 
          fontSize: '24px', 
          fontWeight: 'bold', 
          margin: 0 
        }}>
          🎲 Evrensel İndirim Sistemi
        </h2>
        <div style={{ 
          color: '#F59E0B', 
          fontSize: '18px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>İndirim Çarpanı:</span>
          <span style={{ 
            backgroundColor: '#2D3748', 
            padding: '6px 12px', 
            borderRadius: '6px',
            border: '1px solid #4A5568'
          }}>
            x{discountMultiplier.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Dice Roller Card */}
        <div style={{
          backgroundColor: '#2D3748',
          border: '2px solid #4A5568',
          borderRadius: '12px',
          padding: '24px',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '20px' 
          }}>
            <span style={{ fontSize: '32px' }}>🎲</span>
            <h3 style={{ 
              color: '#FFF', 
              fontSize: '20px', 
              fontWeight: 'bold', 
              margin: 0 
            }}>
              Zar Atma Sistemi
            </h3>
          </div>
          
          <DiceRoller />
        </div>

        {/* Description Card */}
        <div style={{
          backgroundColor: '#2D3748',
          border: '2px solid #4A5568',
          borderRadius: '12px',
          padding: '24px',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '20px' 
          }}>
            <span style={{ fontSize: '32px' }}>📖</span>
            <h3 style={{ 
              color: '#FFF', 
              fontSize: '20px', 
              fontWeight: 'bold', 
              margin: 0 
            }}>
              Nasıl Çalışır?
            </h3>
          </div>
          
          <DiceSystemDescription />
        </div>
      </div>

      {/* Discount Status Section */}
      <div style={{
        backgroundColor: '#2D3748',
        border: '2px solid #4A5568',
        borderRadius: '12px',
        padding: '24px',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          <span style={{ fontSize: '32px' }}>💰</span>
          <h3 style={{ 
            color: '#FFF', 
            fontSize: '20px', 
            fontWeight: 'bold', 
            margin: 0 
          }}>
            Aktif İndirimler
          </h3>
        </div>
        
        <DiscountStatusSection discountMultiplier={discountMultiplier} />
      </div>
    </div>
  );
}; 