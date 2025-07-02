import './App.css';
import { GameBoard } from './ui/GameBoard';
import React, { useState } from 'react';
import { SettingsPanel } from './ui/settings/SettingsPanel';
import { ChallengePanel } from './ui/challenge/ChallengePanel';
// import { ChallengeProvider } from './ui/challenge/ChallengeContext'; // Remove unused import

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  return (
    <div className="App">
      <div className="fab-row">
        <button
          className="settings-fab"
          aria-label="Ayarlar"
          onClick={() => setSettingsOpen(true)}
        >
          <span role="img" aria-label="settings">⚙️</span>
        </button>
        <button
          className="settings-fab"
          aria-label="Görevler"
          style={{ background: '#4caf50' }}
          onClick={() => setChallengeOpen(true)}
        >
          <span role="img" aria-label="challenge">🏆</span>
        </button>
      </div>
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ChallengePanel isOpen={challengeOpen} onClose={() => setChallengeOpen(false)} />
      <h1>Shooter Tower Defense</h1>
      <GameBoard />
    </div>
  );
}

export default App; 