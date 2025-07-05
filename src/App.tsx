import './App.css';
import { GameBoard } from './ui/GameBoard';
import { useState } from 'react';
import { SettingsPanel } from './ui/settings/SettingsPanel';
import { ChallengePanel } from './ui/challenge/ChallengePanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChallengeProvider } from './ui/challenge/ChallengeContext';
import { MiniSecurityIndicator } from './ui/common/SecurityStatusIndicator';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  return (
    <ChallengeProvider>
      <div className="App">
        <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
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
        <MiniSecurityIndicator />
        <h1>Shooter Tower Defense</h1>
        <GameBoard />
      </div>
    </ChallengeProvider>
  );
}

export default App; 