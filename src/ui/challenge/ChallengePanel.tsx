import React from 'react';
import './ChallengePanel.css';
import { useChallenge } from './ChallengeContext';
import type { Reward } from './ChallengeContext';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ChallengePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({ isOpen, onClose }) => {
  const { challenges, completeChallenge, claimReward, claimedRewards, claimedRewardHistory } = useChallenge();

  if (!isOpen) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleComplete = (id: number) => {
    completeChallenge(id);
    toast.success('Görev tamamlandı!', { position: 'bottom-center' });
  };

  const handleClaim = (id: number, reward: Reward) => {
    claimReward(id);
    let msg = 'Ödül alındı!';
    if (reward.type === 'gold') msg = `${reward.amount} altın kazandın!`;
    if (reward.type === 'skin') msg = `Yeni skin açıldı: ${reward.name}`;
    if (reward.type === 'tower') msg = `Yeni kule açıldı: ${reward.towerType}`;
    toast.success(msg, { position: 'bottom-center' });
  };

  return (
    <div className="challenge-panel-overlay" onClick={onClose}>
      <div className="challenge-panel" onClick={e => e.stopPropagation()}>
        <h2>Günlük Görevler</h2>
        <ul>
          {challenges.filter(c => !c.weekly).map(c => {
            const isCompleted = c.completed;
            const isClaimed = claimedRewards.includes(c.id);
            if (isCompleted && !isClaimed) {
              handleClaim(c.id, c.reward);
            }
            return (
              <li key={c.id} className={isCompleted ? 'completed' : ''} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22, userSelect: 'none' }}>
                  {isCompleted ? (
                    <span style={{ color: '#4ade80' }}>☑️</span>
                  ) : (
                    <span style={{ color: '#888' }}>☐</span>
                  )}
                </span>
                <span style={{ textDecoration: isCompleted ? 'line-through' : 'none', flex: 1 }}>
                  {c.text} <span className="progress">({c.progress}/{c.target})</span>
                </span>
                <span className="reward">Ödül: {c.reward.type === 'gold' ? `${c.reward.amount} altın` : c.reward.type === 'skin' ? `Skin: ${c.reward.name}` : `Kule: ${c.reward.towerType}`}</span>
              </li>
            );
          })}
        </ul>
        <h2>Haftalık Görevler</h2>
        <ul>
          {challenges.filter(c => c.weekly).map(c => {
            const isCompleted = c.completed;
            const isClaimed = claimedRewards.includes(c.id);
            if (isCompleted && !isClaimed) {
              handleClaim(c.id, c.reward);
            }
            return (
              <li key={c.id} className={isCompleted ? 'completed' : ''} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22, userSelect: 'none' }}>
                  {isCompleted ? (
                    <span style={{ color: '#4ade80' }}>☑️</span>
                  ) : (
                    <span style={{ color: '#888' }}>☐</span>
                  )}
                </span>
                <span style={{ textDecoration: isCompleted ? 'line-through' : 'none', flex: 1 }}>
                  {c.text} <span className="progress">({c.progress}/{c.target})</span>
                </span>
                <span className="reward">Ödül: {c.reward.type === 'gold' ? `${c.reward.amount} altın` : c.reward.type === 'skin' ? `Skin: ${c.reward.name}` : `Kule: ${c.reward.towerType}`}</span>
              </li>
            );
          })}
        </ul>
        <div className="reward-history">
          <h3>Ödül Geçmişi</h3>
          <ul>
            {claimedRewardHistory.slice(-10).reverse().map((item, _i) => (
              <li key={item.id + '-' + item.date}>
                <span>{format(new Date(item.date), 'dd.MM.yyyy HH:mm')}</span> - 
                <span>{item.reward.type === 'gold' ? `${item.reward.amount} altın` : item.reward.type === 'skin' ? `Skin: ${item.reward.name}` : `Kule: ${item.reward.towerType}`}</span>
              </li>
            ))}
          </ul>
        </div>
        <button className="close-btn" onClick={onClose}>Kapat</button>
      </div>
      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}; 