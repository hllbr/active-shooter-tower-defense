import React from 'react';
import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/Constants';
import { DiceRoller } from './upgrades/DiceRoller';
import { FireUpgrades } from './upgrades/FireUpgrades';
import { UpgradePackages } from './upgrades/UpgradePackages';
import { ShieldUpgrades } from './upgrades/ShieldUpgrades';
import { CurrentPowers } from './upgrades/CurrentPowers';
import { DefenseUpgrades } from './upgrades/DefenseUpgrades';

export const UpgradeScreen: React.FC = () => {
  const nextWave = useGameStore((s) => s.nextWave);
  const resetDice = useGameStore((s) => s.resetDice);
  const bulletLevel = useGameStore((s) => s.bulletLevel);
  const startPreparation = useGameStore(s => s.startPreparation);
  const setRefreshing = useGameStore(s => s.setRefreshing);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
      }}
    >
      <div
        style={{
          background: GAME_CONSTANTS.CANVAS_BG,
          color: '#ffffff',
          padding: 32,
          borderRadius: 16,
          width: '90%',
          maxWidth: 800,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          textAlign: 'center',
          overflowY: 'auto',
          border: `2px solid ${GAME_CONSTANTS.GOLD_COLOR}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: 32, color: GAME_CONSTANTS.GOLD_COLOR }}>
          Yükseltmeler
        </span>

        <CurrentPowers />
        <DiceRoller />
        <FireUpgrades />
        <UpgradePackages />
        <ShieldUpgrades />
        {bulletLevel >= GAME_CONSTANTS.BULLET_TYPES.length && <DefenseUpgrades />}

        <button
          onClick={() => {
            setRefreshing(false);
            nextWave();
            startPreparation();
            resetDice();
          }}
          style={{
            padding: '12px 24px',
            fontSize: 24,
            borderRadius: 12,
            background: '#4ade80',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            marginTop: 16,
            fontWeight: 'bold',
            boxShadow: '0 4px 16px rgba(74, 222, 128, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          Devam Et
        </button>
      </div>
    </div>
  );
}; 