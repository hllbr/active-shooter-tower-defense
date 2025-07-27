import React from 'react';
import { useChallenge } from './hooks/useChallenge';
import type { Reward } from './context/ChallengeContext';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import { ScrollableList } from '../common/ScrollableList';
import 'react-toastify/dist/ReactToastify.css';

interface ChallengePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({ isOpen, onClose }) => {
  const { challenges, claimReward, claimedRewards, claimedRewardHistory } = useChallenge();

  if (!isOpen) return null;

  const handleClaim = (id: number, reward: Reward) => {
    claimReward(id);
    let msg = 'Ödül alındı!';
    if (reward.type === 'gold') msg = `${reward.amount} 💰 kazandın!`;
    if (reward.type === 'skin') msg = `Yeni skin açıldı: ${reward.name}`;
    if (reward.type === 'tower') msg = `Yeni kule açıldı: ${reward.towerType}`;
    toast.success(msg, { position: 'bottom-center' });
  };

  const dailyChallenges = challenges.filter(c => !c.weekly);
  const weeklyChallenges = challenges.filter(c => c.weekly);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1A202C',
          border: '2px solid #4A5568',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '900px',
          maxHeight: '85vh',
          width: '90%',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ 
            color: '#FFF', 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🏆 Günlük Görevler
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#EF4444',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Container */}
        <div style={{ maxHeight: '65vh', overflowY: 'auto', padding: '4px' }}>
          
          {/* Daily Challenges Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              color: '#F59E0B', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📅 Günlük Görevler ({dailyChallenges.filter(c => !claimedRewards.includes(c.id)).length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dailyChallenges.map(c => {
                const isCompleted = c.completed;
                const isClaimed = claimedRewards.includes(c.id);
                if (isCompleted && !isClaimed) {
                  handleClaim(c.id, c.reward);
                }
                return (
                  <div 
                    key={c.id}
                    style={{
                      background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
                      border: `2px solid ${isCompleted ? '#10B981' : '#4A5568'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      opacity: isClaimed ? 0.6 : 1
                    }}
                  >
                    {/* Completion Status */}
                    <div style={{ fontSize: '24px' }}>
                      {isCompleted ? (
                        <span style={{ color: '#10B981' }}>✅</span>
                      ) : (
                        <span style={{ color: '#6B7280' }}>⏳</span>
                      )}
                    </div>
                    
                    {/* Challenge Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: '#FFF', 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        marginBottom: '4px',
                        textDecoration: isClaimed ? 'line-through' : 'none'
                      }}>
                        {c.text}
                      </div>
                      <div style={{ 
                        color: '#9CA3AF', 
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>📊 İlerleme: {c.progress}/{c.target}</span>
                        {/* Progress Bar */}
                        <div style={{
                          backgroundColor: '#4A5568',
                          borderRadius: '4px',
                          height: '6px',
                          width: '80px',
                          overflow: 'hidden'
                        }}>
                          <div 
                            style={{
                              backgroundColor: isCompleted ? '#10B981' : '#F59E0B',
                              height: '100%',
                              width: `${Math.min((c.progress / c.target) * 100, 100)}%`,
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reward Info */}
                    <div style={{ 
                      backgroundColor: '#4A5568',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      minWidth: '120px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 'bold' }}>ÖDÜL</div>
                      <div style={{ color: '#FFF', fontSize: '14px' }}>
                        {c.reward.type === 'gold' ? `${c.reward.amount} 💰` : 
                         c.reward.type === 'skin' ? `🎨 ${c.reward.name}` : 
                         `🏰 ${c.reward.towerType}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Challenges Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              color: '#8B5CF6', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📆 Haftalık Görevler ({weeklyChallenges.filter(c => !claimedRewards.includes(c.id)).length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {weeklyChallenges.map(c => {
                const isCompleted = c.completed;
                const isClaimed = claimedRewards.includes(c.id);
                if (isCompleted && !isClaimed) {
                  handleClaim(c.id, c.reward);
                }
                return (
                  <div 
                    key={c.id}
                    style={{
                      background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
                      border: `2px solid ${isCompleted ? '#8B5CF6' : '#4A5568'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      opacity: isClaimed ? 0.6 : 1
                    }}
                  >
                    {/* Completion Status */}
                    <div style={{ fontSize: '24px' }}>
                      {isCompleted ? (
                        <span style={{ color: '#8B5CF6' }}>✅</span>
                      ) : (
                        <span style={{ color: '#6B7280' }}>⏳</span>
                      )}
                    </div>
                    
                    {/* Challenge Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: '#FFF', 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        marginBottom: '4px',
                        textDecoration: isClaimed ? 'line-through' : 'none'
                      }}>
                        {c.text}
                      </div>
                      <div style={{ 
                        color: '#9CA3AF', 
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>📊 İlerleme: {c.progress}/{c.target}</span>
                        {/* Progress Bar */}
                        <div style={{
                          backgroundColor: '#4A5568',
                          borderRadius: '4px',
                          height: '6px',
                          width: '80px',
                          overflow: 'hidden'
                        }}>
                          <div 
                            style={{
                              backgroundColor: isCompleted ? '#8B5CF6' : '#F59E0B',
                              height: '100%',
                              width: `${Math.min((c.progress / c.target) * 100, 100)}%`,
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reward Info */}
                    <div style={{ 
                      backgroundColor: '#4A5568',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      minWidth: '120px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#8B5CF6', fontSize: '12px', fontWeight: 'bold' }}>ÖDÜL</div>
                      <div style={{ color: '#FFF', fontSize: '14px' }}>
                        {c.reward.type === 'gold' ? `${c.reward.amount} 💰` : 
                         c.reward.type === 'skin' ? `🎨 ${c.reward.name}` : 
                         `🏰 ${c.reward.towerType}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reward History Section */}
          {claimedRewardHistory.length > 0 && (
            <div>
              <h3 style={{ 
                color: '#6B7280', 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📜 Ödül Geçmişi (Son 10)
              </h3>
              <ScrollableList
                items={claimedRewardHistory.slice(-10).reverse()}
                renderItem={(item) => (
                  <div 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: '#1A202C',
                      borderRadius: '6px'
                    }}
                  >
                    <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                      {format(new Date(item.date), 'dd.MM.yyyy HH:mm')}
                    </span>
                    <span style={{ color: '#FFF', fontSize: '12px' }}>
                      {item.reward.type === 'gold' ? `${item.reward.amount} 💰` : 
                       item.reward.type === 'skin' ? `🎨 ${item.reward.name}` : 
                       `🏰 ${item.reward.towerType}`}
                    </span>
                  </div>
                )}
                keyExtractor={(item, i) => item.id + '-' + item.date + '-' + i}
                maxHeight="200px"
                containerStyle={{
                  backgroundColor: '#2D3748',
                  border: '1px solid #4A5568',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                itemContainerStyle={{ marginBottom: '8px' }}
                emptyMessage="Henüz ödül geçmişi bulunmuyor"
                emptyIcon="📜"
              />
            </div>
          )}
        </div>
      </div>
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
    </div>
  );
};