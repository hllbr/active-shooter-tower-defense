import './App.css';
import { GameBoard } from './ui/GameBoard';
import { useState, useEffect } from 'react';
import { SettingsPanel } from './ui/settings/SettingsPanel';
import { ChallengePanel } from './ui/challenge/ChallengePanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChallengeProvider } from './ui/challenge/ChallengeProvider';
import { MiniSecurityIndicator } from './ui/common/SecurityStatusIndicator';
import { ThemeProvider } from './ui/theme/ThemeProvider';
import { MobileOptimizations } from './ui/mobile/MobileOptimizations';
import { CinematicCameraManager } from './game-systems/cinematic/CinematicCameraManager';
import { PostProcessingManager } from './game-systems/post-processing/PostProcessingManager';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [performanceMode, _setPerformanceMode] = useState<'high' | 'medium' | 'low'>('medium');

  // Initialize cinematic camera and post-processing managers
  useEffect(() => {
    const _cinematicManager = CinematicCameraManager.getInstance();
    const postProcessingManager = PostProcessingManager.getInstance();

    // Apply initial post-processing filter
    postProcessingManager.applyGameStateFilter('normal', 0);

    console.log('🎬 Cinematic Camera Manager initialized');
    console.log('🎨 Post-Processing Manager initialized');
  }, []);

  return (
    <ThemeProvider>
      <MobileOptimizations
        performanceMode={performanceMode}
        enableTouchOptimizations={true}
        enableGestureSupport={true}
        enableHapticFeedback={true}
      >
        <ChallengeProvider>
          <>
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
              <MiniSecurityIndicator />
              <div className="game-container">
                <h1>Shooter Tower Defense</h1>
                <GameBoard />
              </div>
            </div>
          </>
        </ChallengeProvider>
      </MobileOptimizations>
    </ThemeProvider>
  );
}

export default App; 