import { HealthBarAndBossPhaseTest } from './HealthBarAndBossPhaseTest';

// Simple test runner for health bar and boss phase systems
console.log('🚀 Starting Health Bar and Boss Phase System Tests...\n');

try {
  HealthBarAndBossPhaseTest.runAllTests();
} catch (error) {
  console.error('❌ Test runner failed:', error);
}

console.log('\n✨ Test runner completed!'); 