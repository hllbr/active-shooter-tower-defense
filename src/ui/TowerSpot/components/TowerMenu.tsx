import React, { useState } from 'react';
import type { TowerMenuProps } from '../types';
import { GAME_CONSTANTS } from '../../../utils/constants';

export const TowerMenu: React.FC<TowerMenuProps> = ({ 
  menuPos, 
  slot, 
  slotIdx, 
  onClose, 
  onBuildTower, 
  onPerformTileAction 
}) => {
  const [showTowerTypes, setShowTowerTypes] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  if (!menuPos) return null;

  const towerCategories = {
    assault: ['sniper', 'gatling', 'laser'],
    area_control: ['mortar', 'flamethrower'],
    support: ['radar', 'supply_depot'],
    defensive: ['shield_generator', 'repair_station'],
    specialist: ['emp', 'stealth_detector', 'air_defense']
  };

  const handleBuildSpecializedTower = (towerClass: string) => {
    onBuildTower(slotIdx, 'attack', towerClass);
    onClose();
  };

  return (
    <foreignObject 
      x={menuPos.x} 
      y={menuPos.y} 
      width={showTowerTypes ? "300" : "140"} 
      height={showTowerTypes ? "400" : "150"} 
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        style={{ 
          background: '#222', 
          color: '#fff', 
          border: '1px solid #555', 
          fontSize: 12,
          borderRadius: '4px',
          overflow: 'hidden',
          maxHeight: showTowerTypes ? '400px' : 'auto',
          overflowY: showTowerTypes ? 'auto' : 'visible'
        }}
      >
        {!showTowerTypes ? (
          // Main menu
          <>
            {!slot.tower && (
              <>
                <div 
                  style={{ 
                    padding: 8, 
                    cursor: 'pointer',
                    borderBottom: '1px solid #555',
                    background: '#333'
                  }} 
                  onClick={() => { 
                    onBuildTower(slotIdx, 'attack'); 
                    onClose(); 
                  }}
                >
                  🏰 Temel Kule Kur
                </div>
                <div 
                  style={{ 
                    padding: 8, 
                    cursor: 'pointer',
                    borderBottom: '1px solid #555',
                    background: '#1e3a8a'
                  }} 
                  onClick={() => setShowTowerTypes(true)}
                >
                  ⚔️ Özel Kuleler
                </div>
                <div 
                  style={{ 
                    padding: 8, 
                    cursor: 'pointer',
                    borderBottom: '1px solid #555'
                  }} 
                  onClick={() => { 
                    onBuildTower(slotIdx, 'economy'); 
                    onClose(); 
                  }}
                >
                  💰 Çıkarıcı Kur
                </div>
              </>
            )}
            <div 
              style={{ 
                padding: 8, 
                cursor: 'pointer',
                borderBottom: '1px solid #555'
              }} 
              onClick={() => { 
                onPerformTileAction(slotIdx, 'wall'); 
                onClose(); 
              }}
            >
              🧱 Duvar Kur
            </div>
            <div 
              style={{ 
                padding: 8, 
                cursor: 'pointer',
                borderBottom: '1px solid #555'
              }} 
              onClick={() => { 
                onPerformTileAction(slotIdx, 'trench'); 
                onClose(); 
              }}
            >
              🕳️ Siper Kaz
            </div>
            <div 
              style={{ 
                padding: 8, 
                cursor: 'pointer'
              }} 
              onClick={() => { 
                onPerformTileAction(slotIdx, 'buff'); 
                onClose(); 
              }}
            >
              ⚡ Güçlendirici Kur
            </div>
          </>
        ) : (
          // Tower types menu
          <>
            <div 
              style={{ 
                padding: 8, 
                cursor: 'pointer',
                borderBottom: '1px solid #555',
                background: '#555'
              }} 
              onClick={() => setShowTowerTypes(false)}
            >
              ← Geri Dön
            </div>
            
            {!selectedCategory ? (
              // Category selection
              <>
                <div style={{ padding: 8, fontWeight: 'bold', textAlign: 'center', background: '#333' }}>
                  Kule Kategorisi Seç
                </div>
                {Object.entries(towerCategories).map(([category, towers]) => (
                  <div 
                    key={category}
                    style={{ 
                      padding: 8, 
                      cursor: 'pointer',
                      borderBottom: '1px solid #555',
                      background: category === 'assault' ? '#7f1d1d' : 
                                 category === 'area_control' ? '#a16207' :
                                 category === 'support' ? '#166534' :
                                 category === 'defensive' ? '#1e40af' : '#7c2d12'
                    }} 
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'assault' && '⚔️ Saldırı '}
                    {category === 'area_control' && '🎯 Alan Kontrolü '}
                    {category === 'support' && '🤝 Destek '}
                    {category === 'defensive' && '🛡️ Savunma '}
                    {category === 'specialist' && '🔬 Uzman '}
                    ({towers.length} kule)
                  </div>
                ))}
              </>
            ) : (
              // Tower selection within category
              <>
                <div 
                  style={{ 
                    padding: 8, 
                    cursor: 'pointer',
                    borderBottom: '1px solid #555',
                    background: '#444'
                  }} 
                  onClick={() => setSelectedCategory(null)}
                >
                  ← Kategoriler
                </div>
                <div style={{ padding: 8, fontWeight: 'bold', textAlign: 'center', background: '#333' }}>
                  {selectedCategory === 'assault' && '⚔️ Saldırı Kuleleri'}
                  {selectedCategory === 'area_control' && '🎯 Alan Kontrolü'}
                  {selectedCategory === 'support' && '🤝 Destek Kuleleri'}
                  {selectedCategory === 'defensive' && '🛡️ Savunma Kuleleri'}
                  {selectedCategory === 'specialist' && '🔬 Uzman Kuleleri'}
                </div>
                {towerCategories[selectedCategory as keyof typeof towerCategories]?.map((towerClass) => {
                  const towerData = GAME_CONSTANTS.SPECIALIZED_TOWERS[towerClass as keyof typeof GAME_CONSTANTS.SPECIALIZED_TOWERS];
                  return (
                    <div 
                      key={towerClass}
                      style={{ 
                        padding: 8, 
                        cursor: 'pointer',
                        borderBottom: '1px solid #555',
                        background: '#2a2a2a'
                      }} 
                      onClick={() => handleBuildSpecializedTower(towerClass)}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: 14 }}>
                        {towerData.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#ccc', marginTop: 2 }}>
                        💰 {towerData.cost} | {towerData.description}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </foreignObject>
  );
}; 