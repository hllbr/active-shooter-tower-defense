import './App.css';
import './ui/responsive.css';
import './utils/accessibility/accessibility.css';
import './ui/TowerSpot/styles/towerSelectionPanel.css';
import './ui/TowerSpot/styles/enhancedLockedZone.css';
import './ui/TowerSpot/styles/simplifiedTowerControls.css';
import './ui/TowerSpot/styles/fireHazard.css';
import './ui/common/ScrollableList.css';
import { GameBoard } from './ui/GameBoard';
import { useState } from 'react';
import { SettingsPanel } from './ui/settings/SettingsPanel';
import { ChallengePanel } from './ui/challenge/ChallengePanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChallengeProvider } from './ui/challenge/ChallengeProvider';

import { ThemeProvider } from './ui/theme/ThemeProvider';

const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);

  return (
    <ThemeProvider>
      <ChallengeProvider>
        <>
          <div className="App">
            <ToastContainer 
              position="bottom-center" 
              autoClose={3000} 
              hideProgressBar 
              newestOnTop 
              closeOnClick 
              rtl={false} 
              pauseOnFocusLoss 
              draggable 
              pauseOnHover 
            />
            <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
            <ChallengePanel isOpen={challengeOpen} onClose={() => setChallengeOpen(false)} />

            <div className="game-container">
              <h1>Shooter Tower Defense</h1>
              <GameBoard 
                onSettingsClick={() => setSettingsOpen(true)}
                onChallengeClick={() => setChallengeOpen(true)}
              />
            </div>
          </div>
        </>
      </ChallengeProvider>
    </ThemeProvider>
  );
};

export default App; 