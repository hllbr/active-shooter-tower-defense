/**
 * 🔒 Security Status Indicator
 * Shows current security status to users
 */

import React from 'react';
import { useSecurityMonitoring } from '../../security/SecurityEnhancements';

interface SecurityStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export const SecurityStatusIndicator: React.FC<SecurityStatusIndicatorProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { isLocked, securityStats, suspiciousActivityCount } = useSecurityMonitoring();

  // Don't show indicator if everything is secure
  if (!isLocked && suspiciousActivityCount === 0) {
    return null;
  }

  const getStatusColor = () => {
    if (isLocked) return '#ef4444'; // Red
    if (suspiciousActivityCount > 2) return '#f59e0b'; // Orange
    return '#22c55e'; // Green
  };

  const getStatusText = () => {
    if (isLocked) return '🔒 Sistem Kilitli';
    if (suspiciousActivityCount > 2) return '⚠️ Güvenlik Uyarısı';
    return '✅ Güvenli';
  };

  const getStatusDescription = () => {
    if (isLocked) return 'Sistem geçici olarak kilitlendi. Lütfen bekleyin...';
    if (suspiciousActivityCount > 2) return `${suspiciousActivityCount} şüpheli aktivite tespit edildi`;
    return 'Sistem güvenli durumda';
  };

  return (
    <div 
      className={`security-status-indicator ${className}`}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: `linear-gradient(135deg, ${getStatusColor()}20, ${getStatusColor()}10)`,
        border: `2px solid ${getStatusColor()}`,
        borderRadius: '8px',
        padding: '8px 12px',
        color: getStatusColor(),
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{getStatusText()}</span>
      </div>
      
      {showDetails && (
        <div style={{ 
          marginTop: '4px', 
          fontSize: '10px', 
          opacity: 0.8,
          borderTop: `1px solid ${getStatusColor()}40`,
          paddingTop: '4px'
        }}>
          {getStatusDescription()}
          <div style={{ marginTop: '2px' }}>
            Toplam olay: {securityStats.totalEvents as number}
          </div>
        </div>
      )}
    </div>
  );
};

// Mini security indicator for compact display
export const MiniSecurityIndicator: React.FC = () => {
  const { isLocked, suspiciousActivityCount } = useSecurityMonitoring();

  if (!isLocked && suspiciousActivityCount === 0) {
    return null;
  }

  const getIcon = () => {
    if (isLocked) return '🔒';
    if (suspiciousActivityCount > 2) return '⚠️';
    return '✅';
  };

  const getColor = () => {
    if (isLocked) return '#ef4444';
    if (suspiciousActivityCount > 2) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '32px',
        height: '32px',
        background: getColor(),
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      title={isLocked ? 'Sistem Kilitli' : 'Güvenlik Uyarısı'}
    >
      {getIcon()}
    </div>
  );
}; 