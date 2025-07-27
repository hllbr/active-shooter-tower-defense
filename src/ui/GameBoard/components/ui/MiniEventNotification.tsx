import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../../../models/store';

interface MiniEventConfig {
  type: string;
  name: string;
  description: string;
  duration: number;
  warningTime: number;
  icon: string;
  color: string;
}

// ✅ NEW: Mini-Event Notification Component
export const MiniEventNotification = () => {
  const { currentWave } = useGameStore();
  const [activeEvent, setActiveEvent] = useState<MiniEventConfig | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isWarningPhase, setIsWarningPhase] = useState(false);
  const [warningTimeRemaining, setWarningTimeRemaining] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate mini-event detection (in real implementation, this would come from the spawn controller)
    const checkForMiniEvent = () => {
      // This is a simplified check - in the real implementation, this would come from MiniEventManager
      const specialWaves = [7, 13, 17, 23, 29, 33, 37, 41, 47, 53, 59, 63, 67, 71, 77, 83, 87, 91, 95, 99];
      
      if (specialWaves.includes(currentWave)) {
        const eventTypes = [
          'speed_rush', 'double_spawn', 'elite_invasion', 'swarm_attack',
          'stealth_mission', 'boss_minions', 'elemental_storm', 'time_pressure'
        ];
        
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const eventConfig = getEventConfig(randomEvent);
        
        if (eventConfig) {
          setActiveEvent(eventConfig);
          setIsWarningPhase(true);
          setWarningTimeRemaining(eventConfig.warningTime);
          setIsVisible(true);
        }
      }
    };

    checkForMiniEvent();
  }, [currentWave]);

  useEffect(() => {
    if (!activeEvent) return;

    const interval = setInterval(() => {
      if (isWarningPhase) {
        setWarningTimeRemaining(prev => {
          if (prev <= 0) {
            setIsWarningPhase(false);
            setTimeRemaining(activeEvent.duration);
            return 0;
          }
          return prev - 100;
        });
      } else {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            setIsVisible(false);
            setActiveEvent(null);
            return 0;
          }
          return prev - 100;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeEvent, isWarningPhase]);

  const getEventConfig = (eventType: string) => {
    const configs = {
      speed_rush: {
        type: 'speed_rush',
        name: 'Speed Rush',
        description: 'Enemies move 50% faster!',
        duration: 30000,
        warningTime: 5000,
        icon: '⚡',
        color: '#ffc107'
      },
      double_spawn: {
        type: 'double_spawn',
        name: 'Double Spawn',
        description: 'Enemies spawn twice as fast!',
        duration: 45000,
        warningTime: 3000,
        icon: '🎯',
        color: '#4caf50'
      },
      elite_invasion: {
        type: 'elite_invasion',
        name: 'Elite Invasion',
        description: 'Elite enemies appear!',
        duration: 40000,
        warningTime: 4000,
        icon: '👹',
        color: '#f44336'
      },
      swarm_attack: {
        type: 'swarm_attack',
        name: 'Swarm Attack',
        description: 'Massive enemy waves!',
        duration: 35000,
        warningTime: 3000,
        icon: '🐜',
        color: '#ff9800'
      },
      stealth_mission: {
        type: 'stealth_mission',
        name: 'Stealth Mission',
        description: 'Invisible enemies!',
        duration: 25000,
        warningTime: 5000,
        icon: '👻',
        color: '#9c27b0'
      },
      boss_minions: {
        type: 'boss_minions',
        name: 'Boss Minions',
        description: 'Boss-like enemies!',
        duration: 50000,
        warningTime: 6000,
        icon: '👑',
        color: '#e91e63'
      },
      elemental_storm: {
        type: 'elemental_storm',
        name: 'Elemental Storm',
        description: 'Fire-enhanced enemies!',
        duration: 30000,
        warningTime: 4000,
        icon: '🔥',
        color: '#ff5722'
      },
      time_pressure: {
        type: 'time_pressure',
        name: 'Time Pressure',
        description: 'Complete quickly for rewards!',
        duration: 20000,
        warningTime: 3000,
        icon: '⏰',
        color: '#2196f3'
      }
    };

    return configs[eventType as keyof typeof configs];
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  if (!isVisible || !activeEvent) return null;

  return (
    <div className="mini-event-notification">
      <div 
        className={`event-container ${isWarningPhase ? 'warning' : 'active'}`}
        style={{ borderColor: activeEvent.color }}
      >
        <div className="event-header">
          <div className="event-icon" style={{ color: activeEvent.color }}>
            {activeEvent.icon}
          </div>
          <div className="event-info">
            <div className="event-name">{activeEvent.name}</div>
            <div className="event-description">{activeEvent.description}</div>
          </div>
          <div className="event-phase">
            {isWarningPhase ? 'WARNING' : 'ACTIVE'}
          </div>
        </div>

        <div className="event-timer">
          <div className="timer-text">
            {isWarningPhase ? 'Event starts in:' : 'Time remaining:'} {formatTime(isWarningPhase ? warningTimeRemaining : timeRemaining)}
          </div>
          <div className="timer-bar">
            <div 
              className="timer-progress"
              style={{ 
                width: `${((isWarningPhase ? warningTimeRemaining : timeRemaining) / (isWarningPhase ? activeEvent.warningTime : activeEvent.duration)) * 100}%`,
                backgroundColor: activeEvent.color
              }}
            />
          </div>
        </div>

        {!isWarningPhase && (
          <div className="event-effects">
            <div className="effects-title">Active Effects:</div>
            <div className="effects-list">
              {activeEvent.type === 'speed_rush' && <div>• Enemies move 50% faster</div>}
              {activeEvent.type === 'double_spawn' && <div>• Spawn rate doubled</div>}
              {activeEvent.type === 'elite_invasion' && <div>• Elite enemies enhanced</div>}
              {activeEvent.type === 'swarm_attack' && <div>• Massive enemy waves</div>}
              {activeEvent.type === 'stealth_mission' && <div>• Ghost enemies invisible</div>}
              {activeEvent.type === 'boss_minions' && <div>• Boss-like enemies</div>}
              {activeEvent.type === 'elemental_storm' && <div>• Fire damage enhanced</div>}
              {activeEvent.type === 'time_pressure' && <div>• Speed challenge active</div>}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .mini-event-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          max-width: 400px;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .event-container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 3px solid;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
          color: white;
          backdrop-filter: blur(10px);
        }

        .event-container.warning {
          animation: pulse 1s infinite;
        }

        .event-container.active {
          animation: glow 2s infinite alternate;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes glow {
          from { box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6); }
          to { box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6), 0 0 20px currentColor; }
        }

        .event-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .event-icon {
          font-size: 32px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .event-info {
          flex: 1;
        }

        .event-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .event-description {
          font-size: 14px;
          color: #b0b0b0;
        }

        .event-phase {
          font-size: 12px;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .event-timer {
          margin-bottom: 15px;
        }

        .timer-text {
          font-size: 14px;
          margin-bottom: 8px;
          text-align: center;
        }

        .timer-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .timer-progress {
          height: 100%;
          transition: width 0.1s linear;
          border-radius: 3px;
        }

        .event-effects {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 15px;
        }

        .effects-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #4a90e2;
        }

        .effects-list {
          font-size: 12px;
          color: #b0b0b0;
          line-height: 1.4;
        }

        .effects-list div {
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .mini-event-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }

          .event-container {
            padding: 15px;
          }

          .event-header {
            gap: 10px;
          }

          .event-icon {
            font-size: 24px;
            width: 32px;
            height: 32px;
          }

          .event-name {
            font-size: 16px;
          }

          .event-description {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}; 