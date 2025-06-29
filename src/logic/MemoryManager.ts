/**
 * 🧠 Memory Manager - Re-export from modular memory system
 * 
 * This file provides backward compatibility by re-exporting all memory management
 * functionality from the new modular system in src/logic/memory/
 */

// Re-export everything from the modular memory system
export * from './memory';

// Legacy exports for backward compatibility
export { memoryManager as default } from './memory'; 