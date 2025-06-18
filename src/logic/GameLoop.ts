import { useGameStore } from '../models/store';

let animationFrameId: number | null = null;

export const startGameLoop = () => {
  const gameLoop = () => {
    const { enemies, bullets, effects } = useGameStore.getState();
    
    // Update all game entities
    enemies.forEach(enemy => enemy.update());
    bullets.forEach(bullet => bullet.update());
    effects.forEach(effect => effect.update());

    // Request next frame
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  // Start the loop
  gameLoop();
};

export const stopGameLoop = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};
