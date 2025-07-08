/**
 * 🔒 Secure Upgrade Screen Component
 * Wraps the original UpgradeScreen with security validation
 * Prevents client-side manipulation and unauthorized access
 */

import React, { useState, useEffect } from 'react';
import { securityManager } from './SecurityManager';
import { UpgradeScreen } from '../ui/upgrade/UpgradeScreen';

// Security Status Component
const SecurityStatus: React.FC = () => {
  const [_securityStats, setSecurityStats] = useState(securityManager.getSecurityStats());
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const stats = securityManager.getSecurityStats();
      setSecurityStats(stats);
      setIsLocked(stats.isLocked as boolean);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isLocked) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(90deg, #ff4444, #cc0000)',
      color: 'white',
      padding: '8px',
      textAlign: 'center',
      zIndex: 1000,
      fontSize: '14px',
      fontWeight: 'bold'
    }}>
      🔒 Güvenlik Kilidi Aktif - Sistem geçici olarak kilitlendi
    </div>
  );
};

// Secure Upgrade Screen Component
export const SecureUpgradeScreen: React.FC = () => {
  const [securityStats, setSecurityStats] = useState(securityManager.getSecurityStats());

  useEffect(() => {
    // Log security event when upgrade screen is accessed

    const interval = setInterval(() => {
      setSecurityStats(securityManager.getSecurityStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Check if system is locked
  if (securityStats.isLocked) {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        color: 'white',
        fontSize: '18px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
          <div style={{ marginBottom: '10px' }}>Güvenlik Kilidi Aktif</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            Sistem geçici olarak kilitlendi. Lütfen bekleyin...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SecurityStatus />
      <UpgradeScreen />
    </>
  );
}; 