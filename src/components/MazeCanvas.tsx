"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MazeCell } from '@/lib/maze-generator';

interface MazeCanvasProps {
  maze: MazeCell[][];
  rows: number;
  cols: number;
  wallColor?: string;
  startColor?: string;
  goalColor?: string;
  backgroundColor?: string;
  cellSize?: number;
}

export const MazeCanvas: React.FC<MazeCanvasProps> = ({
  maze,
  rows,
  cols,
  wallColor = '#2a6cff',
  startColor = '#5c8fff',
  goalColor = '#6bcbef',
  backgroundColor = '#14171a',
  cellSize: initialCellSize = 25
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef(0);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adjust canvas size for high resolution and fitting
    const padding = 40;
    const computedCellSize = Math.min(
      (window.innerWidth * 0.8 - padding * 2) / cols,
      (window.innerHeight * 0.6 - padding * 2) / rows,
      initialCellSize
    );
    
    canvas.width = cols * computedCellSize + padding * 2;
    canvas.height = rows * computedCellSize + padding * 2;

    const wallThickness = 3;
    const cellSize = computedCellSize;

    function drawDot(x: number, y: number, r: number) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawMaze() {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      
      // Background gradient
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0b1220');
      g.addColorStop(1, '#0a0f1a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Subtle star particles
      ctx.save();
      ctx.globalAlpha = 0.15;
      const starSeed = rows * cols; // semi-deterministic based on maze
      const starRandom = (i: number) => {
          let x = Math.sin(i * 12.9898 + 78.233) * 43758.5453123;
          return x - Math.floor(x);
      };
      for (let i = 0; i < 120; i++) {
        ctx.beginPath();
        ctx.arc(starRandom(i) * w, starRandom(i + 1) * h, starRandom(i + 2) * 1.2 + 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#4da3ff';
        ctx.fill();
      }
      ctx.restore();

      // Maze Walls
      ctx.save();
      ctx.strokeStyle = wallColor;
      ctx.lineWidth = wallThickness;
      ctx.lineCap = 'round';
      
      pulseRef.current += 0.08;
      const glow = 10 + Math.sin(pulseRef.current) * 8;
      ctx.shadowColor = wallColor;
      ctx.shadowBlur = glow;

      const ox = padding;
      const oy = padding;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const c = maze[y][x];
          const cx = ox + x * cellSize;
          const cy = oy + y * cellSize;
          
          if (c.N) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + cellSize, cy);
            ctx.stroke();
          }
          if (c.S) {
            ctx.beginPath();
            ctx.moveTo(cx, cy + cellSize);
            ctx.lineTo(cx + cellSize, cy + cellSize);
            ctx.stroke();
          }
          if (c.W) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx, cy + cellSize);
            ctx.stroke();
          }
          if (c.E) {
            ctx.beginPath();
            ctx.moveTo(cx + cellSize, cy);
            ctx.lineTo(cx + cellSize, cy + cellSize);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Points
      const start = { x: padding + cellSize / 2, y: padding + cellSize / 2 };
      const goal = { x: padding + (cols - 1) * cellSize + cellSize / 2, y: padding + (rows - 1) * cellSize + cellSize / 2 };

      ctx.save();
      ctx.shadowBlur = 28;
      ctx.shadowColor = startColor;
      ctx.fillStyle = startColor;
      drawDot(start.x, start.y, 10);
      ctx.restore();

      ctx.save();
      ctx.shadowBlur = 28;
      ctx.shadowColor = goalColor;
      ctx.fillStyle = goalColor;
      drawDot(goal.x, goal.y, 10);
      ctx.restore();
    }

    const animate = () => {
      drawMaze();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [maze, rows, cols, wallColor, startColor, goalColor, initialCellSize]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-hidden rounded-xl border border-white/5 bg-background shadow-2xl maze-container">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-lg shadow-inner cursor-crosshair transition-transform duration-300 hover:scale-[1.01]"
      />
    </div>
  );
};