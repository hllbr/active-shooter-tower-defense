/**
 * 🧪 Memory Leak Testing & Validation System
 * 
 * This file provides backward compatibility by re-exporting all memory testing
 * functionality from the new modular system in src/logic/memory/
 */

// Re-export everything from the modular memory testing system
export * from './memory';

// Legacy exports for backward compatibility
export { memoryTester, memoryLeakTester, testMemoryLeaks, startMemoryMonitoring } from './memory'; 