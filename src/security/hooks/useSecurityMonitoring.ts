import { useState, useEffect } from 'react';
import { securityManager } from '../SecurityManager';

// Security monitoring hook
export const useSecurityMonitoring = () => {
  const [securityStats, setSecurityStats] = useState(securityManager.getSecurityStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityStats(securityManager.getSecurityStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    securityStats,
    isLocked: securityStats.isLocked as boolean,
    suspiciousActivityCount: securityStats.suspiciousActivityCount as number,
    totalEvents: securityStats.totalEvents as number
  };
}; 