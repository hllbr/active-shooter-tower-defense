import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../models/store';

interface HelpfulTipsPanelProps {
  isVisible: boolean;
}

export const HelpfulTipsPanel = ({ isVisible }: HelpfulTipsPanelProps) => {
  const [activeCategory, setActiveCategory] = useState<'beginner' | 'advanced' | 'strategy' | 'controls'>('beginner');
  const currentWave = useGameStore((state) => state.currentWave);
  const playerProfile = useGameStore((state) => state.playerProfile);

  const tips = useMemo(() => getTipsByCategory(activeCategory, currentWave, playerProfile), [activeCategory, currentWave, playerProfile]);

  if (!isVisible) return null;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>💡 Helpful Tips</h3>
        <p style={subtitleStyle}>Master the art of tower defense</p>
      </div>

      {/* Category Navigation */}
      <div style={categoryNavStyle}>
        {[
          { id: 'beginner', label: 'Beginner', icon: '🌱' },
          { id: 'advanced', label: 'Advanced', icon: '⚡' },
          { id: 'strategy', label: 'Strategy', icon: '🎯' },
          { id: 'controls', label: 'Controls', icon: '🎮' }
        ].map((category) => (
          <button
            key={category.id}
            style={{
              ...categoryButtonStyle,
              ...(activeCategory === category.id ? activeCategoryButtonStyle : {})
            }}
            onClick={() => setActiveCategory(category.id as any)}
          >
            <span style={{ fontSize: '16px', marginRight: '8px' }}>{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Tips Content */}
      <div style={contentStyle}>
        <div style={tipsListStyle}>
          {tips.map((tip, index) => (
            <div key={index} style={tipItemStyle}>
              <div style={tipIconStyle}>{tip.icon}</div>
              <div style={tipContentStyle}>
                <h4 style={tipTitleStyle}>{tip.title}</h4>
                <p style={tipDescriptionStyle}>{tip.description}</p>
                {tip.example && (
                  <div style={exampleStyle}>
                    <strong>Example:</strong> {tip.example}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={statsStyle}>
        <div style={statItemStyle}>
          <span style={statIconStyle}>🌊</span>
          <div>
            <div style={statLabelStyle}>Current Wave</div>
            <div style={statValueStyle}>{currentWave}</div>
          </div>
        </div>
        <div style={statItemStyle}>
          <span style={statIconStyle}>🏆</span>
          <div>
            <div style={statLabelStyle}>Level</div>
            <div style={statValueStyle}>{playerProfile.level}</div>
          </div>
        </div>
        <div style={statItemStyle}>
          <span style={statIconStyle}>⭐</span>
          <div>
            <div style={statLabelStyle}>Achievements</div>
            <div style={statValueStyle}>{playerProfile.achievementsCompleted}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get tips by category
const getTipsByCategory = (
  category: string, 
  currentWave: number, 
  playerProfile: any
) => {
  const allTips = {
    beginner: [
      {
        icon: '🏗️',
        title: 'Start with Basic Towers',
        description: 'Build basic towers first to establish a foundation. They\'re cheap and effective against early enemies.',
        example: 'Place 2-3 basic towers before upgrading to specialized ones.'
      },
      {
        icon: '💰',
        title: 'Manage Your Economy',
        description: 'Don\'t spend all your gold at once. Save some for emergencies and upgrades.',
        example: 'Keep at least 100 gold in reserve for unexpected situations.'
      },
      {
        icon: '⚡',
        title: 'Use Energy Wisely',
        description: 'Energy is precious. Use it for important actions like building towers and using special abilities.',
        example: 'Save energy for critical moments when you need to build quickly.'
      },
      {
        icon: '🎯',
        title: 'Focus on Coverage',
        description: 'Position towers to cover multiple paths and create overlapping fields of fire.',
        example: 'Place towers at intersections to maximize their effectiveness.'
      },
      {
        icon: '⏰',
        title: 'Use Preparation Time',
        description: 'The preparation phase is crucial. Use it to plan your defense and build strategically.',
        example: 'Don\'t rush - take time to think about tower placement.'
      }
    ],
    advanced: [
      {
        icon: '🔄',
        title: 'Tower Synergies',
        description: 'Different tower types work better together. Learn which combinations are most effective.',
        example: 'Sniper towers work well with area damage towers for crowd control.'
      },
      {
        icon: '📊',
        title: 'Adapt to Enemy Types',
        description: 'Different enemies have different weaknesses. Adjust your strategy accordingly.',
        example: 'Use fast-firing towers against speedy enemies, heavy damage against tanks.'
      },
      {
        icon: '🎲',
        title: 'Dice System Strategy',
        description: 'The dice system can provide significant bonuses. Plan your upgrades around good dice rolls.',
        example: 'Save expensive upgrades for when you have high dice results.'
      },
      {
        icon: '🛡️',
        title: 'Defensive Structures',
        description: 'Don\'t forget about walls and defensive structures. They can buy you crucial time.',
        example: 'Use walls to funnel enemies into your tower kill zones.'
      },
      {
        icon: '🔥',
        title: 'Special Abilities',
        description: 'Special abilities can turn the tide of battle. Use them strategically.',
        example: 'Save powerful abilities for boss waves or emergency situations.'
      }
    ],
    strategy: [
      {
        icon: '🎯',
        title: 'Wave Preparation',
        description: 'Study the wave composition before it starts. Plan your defense accordingly.',
        example: 'If you see many fast enemies, prioritize towers with high fire rates.'
      },
      {
        icon: '⚖️',
        title: 'Resource Balance',
        description: 'Balance your spending between towers, upgrades, and defensive structures.',
        example: 'Spend 60% on towers, 30% on upgrades, 10% on defensive structures.'
      },
      {
        icon: '🔄',
        title: 'Adaptive Strategy',
        description: 'Be ready to change your strategy if something isn\'t working.',
        example: 'If enemies are getting through, consider selling and rebuilding towers in better positions.'
      },
      {
        icon: '📈',
        title: 'Progressive Upgrades',
        description: 'Upgrade your most effective towers first, then expand your defense.',
        example: 'Focus on upgrading 2-3 key towers before building new ones.'
      },
      {
        icon: '🎪',
        title: 'Special Events',
        description: 'Take advantage of special events and weather effects when they occur.',
        example: 'Use weather bonuses to maximize tower effectiveness during difficult waves.'
      }
    ],
    controls: [
      {
        icon: '🖱️',
        title: 'Tower Placement',
        description: 'Click on empty slots to build towers. Drag existing towers to move them.',
        example: 'Right-click to sell towers, left-click to upgrade them.'
      },
      {
        icon: '⌨️',
        title: 'Keyboard Shortcuts',
        description: 'Use keyboard shortcuts for faster gameplay.',
        example: 'Spacebar to pause, ESC for settings, number keys for quick tower selection.'
      },
      {
        icon: '📱',
        title: 'Touch Controls',
        description: 'On mobile devices, tap to select and drag to move towers.',
        example: 'Long press for additional options and tower information.'
      },
      {
        icon: '⚙️',
        title: 'Settings',
        description: 'Adjust game settings to match your preferences and device capabilities.',
        example: 'Lower graphics settings on slower devices for better performance.'
      },
      {
        icon: '🎵',
        title: 'Audio Controls',
        description: 'Control game audio through the settings menu.',
        example: 'Mute music but keep sound effects for better focus.'
      }
    ]
  };

  return allTips[category as keyof typeof allTips] || allTips.beginner;
};

// Styles
const containerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  border: '2px solid #4a90e2',
  borderRadius: '16px',
  padding: '24px',
  maxWidth: '600px',
  width: '100%',
  maxHeight: '70vh',
  overflowY: 'auto'
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px'
};

const titleStyle: React.CSSProperties = {
  color: '#4a90e2',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0'
};

const subtitleStyle: React.CSSProperties = {
  color: '#cbd5e0',
  fontSize: '14px',
  margin: 0
};

const categoryNavStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '24px',
  flexWrap: 'wrap'
};

const categoryButtonStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  padding: '8px 16px',
  color: '#cbd5e0',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center'
};

const activeCategoryButtonStyle: React.CSSProperties = {
  background: 'rgba(74, 144, 226, 0.2)',
  borderColor: '#4a90e2',
  color: '#4a90e2'
};

const contentStyle: React.CSSProperties = {
  marginBottom: '24px'
};

const tipsListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const tipItemStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  padding: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
};

const tipIconStyle: React.CSSProperties = {
  fontSize: '24px',
  flexShrink: 0,
  marginTop: '4px'
};

const tipContentStyle: React.CSSProperties = {
  flex: 1
};

const tipTitleStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0'
};

const tipDescriptionStyle: React.CSSProperties = {
  color: '#cbd5e0',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px 0'
};

const exampleStyle: React.CSSProperties = {
  color: '#fbbf24',
  fontSize: '13px',
  fontStyle: 'italic',
  backgroundColor: 'rgba(251, 191, 36, 0.1)',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid rgba(251, 191, 36, 0.2)'
};

const statsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  paddingTop: '16px',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
};

const statItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: 1
};

const statIconStyle: React.CSSProperties = {
  fontSize: '20px'
};

const statLabelStyle: React.CSSProperties = {
  color: '#cbd5e0',
  fontSize: '12px',
  marginBottom: '2px'
};

const statValueStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold'
}; 