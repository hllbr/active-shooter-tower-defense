/**
 * 📊 Analytics Settings Component
 * TASK 27: Analytics configuration and data export UI
 */

import React, { useState, useCallback, useMemo } from 'react';
import { gameAnalytics, type AnalyticsConfig } from '../../game-systems/analytics/GameAnalyticsManager';

interface AnalyticsSettingsProps {
  onClose?: () => void;
}

export const AnalyticsSettings = ({ onClose }: AnalyticsSettingsProps) => {
  const [config, setConfig] = useState<AnalyticsConfig>(gameAnalytics.getConfig());
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  // Get current session and aggregated stats
  const currentSession = gameAnalytics.getCurrentSession();
  const aggregatedStats = gameAnalytics.getAggregatedStats();

  // Memoized stats for performance
  const statsDisplay = useMemo(() => ({
    totalSessions: aggregatedStats.totalSessions,
    totalPlaytime: Math.round(aggregatedStats.totalPlaytime / 1000 / 60), // minutes
    totalWavesCompleted: aggregatedStats.totalWavesCompleted,
    totalTowersBuilt: aggregatedStats.totalTowersBuilt,
    totalEnemiesKilled: aggregatedStats.totalEnemiesKilled,
    averageEfficiencyScore: Math.round(aggregatedStats.averageEfficiencyScore),
    bestEfficiencyScore: Math.round(aggregatedStats.bestEfficiencyScore),
    totalMissionsCompleted: aggregatedStats.totalMissionsCompleted,
    totalBossDefeats: aggregatedStats.totalBossDefeats
  }), [aggregatedStats]);

  // Handle configuration changes
  const handleConfigChange = useCallback((key: keyof AnalyticsConfig, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    gameAnalytics.updateConfig(newConfig);
  }, [config]);

  // Handle data export
  const handleExportData = useCallback(async () => {
    setIsExporting(true);
    
    try {
      const data = gameAnalytics.exportSessionData(exportFormat);
      const blob = new Blob([data], { 
        type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `game-analytics-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 3000);
    } catch {
      // Export failed silently
    } finally {
      setIsExporting(false);
    }
  }, [exportFormat]);

  // Handle data clearing
  const handleClearData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      gameAnalytics.clearData();
      // Refresh the component
      setConfig(gameAnalytics.getConfig());
    }
  }, []);

  return (
    <div className="analytics-settings">
      <div className="analytics-header">
        <h2>📊 Game Analytics</h2>
        <p className="analytics-description">
          Track your gameplay performance and behavior patterns locally. All data is stored on your device and never shared.
        </p>
      </div>

      <div className="analytics-content">
        {/* Configuration Section */}
        <div className="analytics-section">
          <h3>⚙️ Tracking Configuration</h3>
          
          <div className="config-grid">
            <div className="config-item">
              <label className="config-label">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                />
                Enable Analytics Tracking
              </label>
              <p className="config-description">
                Collect gameplay data to improve your experience
              </p>
            </div>

            <div className="config-item">
              <label className="config-label">
                <input
                  type="checkbox"
                  checked={config.trackPerformance}
                  onChange={(e) => handleConfigChange('trackPerformance', e.target.checked)}
                  disabled={!config.enabled}
                />
                Track Performance Metrics
              </label>
              <p className="config-description">
                Monitor wave completion times and efficiency scores
              </p>
            </div>

            <div className="config-item">
              <label className="config-label">
                <input
                  type="checkbox"
                  checked={config.trackAccessibility}
                  onChange={(e) => handleConfigChange('trackAccessibility', e.target.checked)}
                  disabled={!config.enabled}
                />
                Track Accessibility Usage
              </label>
              <p className="config-description">
                Monitor accessibility mode and UI scaling preferences
              </p>
            </div>

            <div className="config-item">
              <label className="config-label">
                <input
                  type="checkbox"
                  checked={config.trackDetailedEvents}
                  onChange={(e) => handleConfigChange('trackDetailedEvents', e.target.checked)}
                  disabled={!config.enabled}
                />
                Track Detailed Events
              </label>
              <p className="config-description">
                Collect detailed event data for advanced analysis
              </p>
            </div>

            <div className="config-item">
              <label className="config-label">
                <input
                  type="checkbox"
                  checked={config.autoExport}
                  onChange={(e) => handleConfigChange('autoExport', e.target.checked)}
                  disabled={!config.enabled}
                />
                Auto-Export on Session End
              </label>
              <p className="config-description">
                Automatically export data when game session ends
              </p>
            </div>
          </div>

          <div className="config-limits">
            <div className="limit-item">
              <label>Max Events per Session:</label>
              <input
                type="number"
                min="100"
                max="10000"
                value={config.maxEventsPerSession}
                onChange={(e) => handleConfigChange('maxEventsPerSession', parseInt(e.target.value))}
                disabled={!config.enabled}
              />
            </div>

            <div className="limit-item">
              <label>Max Sessions Stored:</label>
              <input
                type="number"
                min="10"
                max="200"
                value={config.maxSessionsStored}
                onChange={(e) => handleConfigChange('maxSessionsStored', parseInt(e.target.value))}
                disabled={!config.enabled}
              />
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="analytics-section">
          <h3>📈 Your Statistics</h3>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{statsDisplay.totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statsDisplay.totalPlaytime}m</div>
              <div className="stat-label">Total Playtime</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statsDisplay.totalWavesCompleted}</div>
              <div className="stat-label">Waves Completed</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statsDisplay.totalTowersBuilt}</div>
              <div className="stat-label">Towers Built</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statsDisplay.totalEnemiesKilled}</div>
              <div className="stat-label">Enemies Killed</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statsDisplay.averageEfficiencyScore}%</div>
              <div className="stat-label">Avg Efficiency</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statsDisplay.bestEfficiencyScore}%</div>
              <div className="stat-label">Best Efficiency</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statsDisplay.totalMissionsCompleted}</div>
              <div className="stat-label">Missions Completed</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{statsDisplay.totalBossDefeats}</div>
              <div className="stat-label">Boss Defeats</div>
            </div>
          </div>

          {currentSession && (
            <div className="current-session">
              <h4>🔄 Current Session</h4>
              <div className="session-info">
                <span>Started: {new Date(currentSession.startTime).toLocaleTimeString()}</span>
                <span>Events: {currentSession.events.length}</span>
                <span>Waves: {currentSession.summary.totalWavesCompleted}</span>
                <span>Efficiency: {Math.round(currentSession.summary.efficiencyScore)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="analytics-section">
          <h3>📤 Data Export</h3>
          
          <div className="export-controls">
            <div className="export-format">
              <label>Export Format:</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              >
                <option value="json">JSON (Detailed)</option>
                <option value="csv">CSV (Spreadsheet)</option>
              </select>
            </div>

            <div className="export-actions">
              <button
                className="export-button"
                onClick={handleExportData}
                disabled={isExporting || aggregatedStats.totalSessions === 0}
              >
                {isExporting ? '📤 Exporting...' : '📤 Export Data'}
              </button>

              <button
                className="clear-button"
                onClick={handleClearData}
                disabled={aggregatedStats.totalSessions === 0}
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>

          {showExportSuccess && (
            <div className="export-success">
              ✅ Data exported successfully!
            </div>
          )}

          <div className="export-info">
            <p>
              <strong>JSON Format:</strong> Complete data including all events, timestamps, and metadata
            </p>
            <p>
              <strong>CSV Format:</strong> Summary data suitable for spreadsheet analysis
            </p>
            <p>
              <strong>Privacy:</strong> All data is stored locally on your device and never transmitted
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="analytics-section privacy-notice">
          <h3>🔒 Privacy & Data</h3>
          <div className="privacy-content">
            <p>
              <strong>Local Storage:</strong> All analytics data is stored locally on your device using browser localStorage.
            </p>
            <p>
              <strong>No Network Transmission:</strong> Data is never sent to external servers or shared with third parties.
            </p>
            <p>
              <strong>Optional:</strong> Analytics tracking can be disabled at any time without affecting gameplay.
            </p>
            <p>
              <strong>Data Control:</strong> You can export your data for analysis or clear it completely at any time.
            </p>
          </div>
        </div>
      </div>

      <div className="analytics-footer">
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}; 