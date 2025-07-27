/**
 * 🎯 Enhanced Particle Renderer
 * Renders enhanced particle effects using HTML5 Canvas for optimal performance
 */

import React, { useRef, useEffect, useCallback } from 'react';

interface EnhancedParticleRendererProps {
  width: number;
  height: number;
  isActive: boolean;
}

export const EnhancedParticleRenderer = React.memo<EnhancedParticleRendererProps>(({
  width,
  height,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const renderParticles = useCallback(() => {
    if (!canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Render enhanced particle effects
    import('../../../../game-systems/effects-system/EnhancedVisualEffectsManager').then(({ enhancedVisualEffectsManager }) => {
      enhancedVisualEffectsManager.render(ctx);
    });

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(renderParticles);
  }, [width, height, isActive]);

  useEffect(() => {
    if (isActive) {
      renderParticles();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, renderParticles]);

  // Update canvas size when dimensions change
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
  }, [width, height]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10
      }}
    />
  );
}); 