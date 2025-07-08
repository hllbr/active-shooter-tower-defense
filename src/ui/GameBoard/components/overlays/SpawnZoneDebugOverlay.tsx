import React from 'react';
import { GAME_CONSTANTS } from '../../../../utils/constants';
import { spawnZoneManager, type SpawnZone } from '../../../../game-systems/enemy/SpawnZoneManager';

/**
 * Debug overlay component that visualizes spawn zones
 * Only visible when DEBUG_MODE is enabled
 */
export const SpawnZoneDebugOverlay: React.FC = () => {
  // Only render in debug mode
  if (!GAME_CONSTANTS.DEBUG_MODE) {
    return null;
  }

  const zones = spawnZoneManager.getZonesForDebug();
  const activeZones = spawnZoneManager.getActiveZones();
  const activeZoneIds = new Set(activeZones.map(z => z.id));

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999, // High z-index to show on top
      }}
    >
      {/* Render spawn zones */}
      {zones.map((zone: SpawnZone) => (
        <div
          key={zone.id}
          style={{
            position: 'absolute',
            left: zone.x,
            top: zone.y,
            width: zone.width,
            height: zone.height,
            border: `2px solid ${zone.color || '#ff0000'}`,
            backgroundColor: activeZoneIds.has(zone.id) 
              ? `${zone.color || '#ff0000'}15` 
              : 'rgba(128, 128, 128, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: activeZoneIds.has(zone.id) ? '#ffffff' : '#888888',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            textAlign: 'center',
            padding: '4px',
            boxSizing: 'border-box',
            opacity: activeZoneIds.has(zone.id) ? 0.8 : 0.3,
            borderStyle: activeZoneIds.has(zone.id) ? 'solid' : 'dashed',
          }}
          title={`${zone.name} (${zone.id}) - Weight: ${zone.weight} - ${activeZoneIds.has(zone.id) ? 'Active' : 'Inactive'}`}
        >
          <div style={{ textAlign: 'center' }}>
            <div>{zone.name}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              W: {zone.weight} | {activeZoneIds.has(zone.id) ? '✓' : '✗'}
            </div>
          </div>
        </div>
      ))}
      
      {/* Debug info panel */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#ffffff',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          border: '1px solid #ffffff40',
          minWidth: '200px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#00ff00' }}>
          🎯 Spawn Zone Debug
        </div>
        <div>Total Zones: {zones.length}</div>
        <div>Active Zones: {activeZones.length}</div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.8 }}>
          • Solid border = Active zone
        </div>
        <div style={{ fontSize: '10px', opacity: 0.8 }}>
          • Dashed border = Inactive zone
        </div>
        <div style={{ fontSize: '10px', opacity: 0.8 }}>
          • W = Weight (spawn frequency)
        </div>
      </div>
    </div>
  );
}; 