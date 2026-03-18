
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MazeCell } from '@/lib/maze-generator';

interface MazeCanvasProps {
  maze: MazeCell[][];
  rows: number;
  cols: number;
  onVictory: () => void;
}

export const MazeCanvas: React.FC<MazeCanvasProps> = ({
  maze,
  rows,
  cols,
  onVictory
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef({ x: 0, y: 0, r: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const pulseRef = useRef(0);
  const animationFrameRef = useRef<number>(null);

  const cellSize = 40;
  const padding = 20;
  const wallThickness = 6;
  const wallColor = '#2a6cff';
  const startColor = '#33ff99';
  const goalColor = '#ff3df6';

  const width = cols * cellSize + padding * 2;
  const height = rows * cellSize + padding * 2;

  const goalPos = {
    x: padding + (cols - 1) * cellSize + cellSize / 2,
    y: padding + (rows - 1) * cellSize + cellSize / 2
  };

  useEffect(() => {
    // Initialize player position
    playerRef.current = {
      x: padding + cellSize / 2,
      y: padding + cellSize / 2,
      r: cellSize * 0.3
    };

    // Build hit map for collision detection
    const hitCanvas = document.createElement('canvas');
    hitCanvas.width = width;
    hitCanvas.height = height;
    const htx = hitCanvas.getContext('2d', { willReadFrequently: true });
    if (htx) {
      htx.fillStyle = '#fff';
      htx.fillRect(0, 0, width, height);
      htx.strokeStyle = '#000';
      htx.lineWidth = wallThickness;
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const c = maze[y][x];
          const cx = padding + x * cellSize;
          const cy = padding + y * cellSize;
          if (c.N) { htx.beginPath(); htx.moveTo(cx, cy); htx.lineTo(cx + cellSize, cy); htx.stroke(); }
          if (c.S) { htx.beginPath(); htx.moveTo(cx, cy + cellSize); htx.lineTo(cx + cellSize, cy + cellSize); htx.stroke(); }
          if (c.W) { htx.beginPath(); htx.moveTo(cx, cy); htx.lineTo(cx, cy + cellSize); htx.stroke(); }
          if (c.E) { htx.beginPath(); htx.moveTo(cx + cellSize, cy); htx.lineTo(cx + cellSize, cy + cellSize); htx.stroke(); }
        }
      }
      hitCanvasRef.current = hitCanvas;
    }
  }, [maze, rows, cols, width, height]);

  const isWall = (px: number, py: number) => {
    if (!hitCanvasRef.current) return false;
    const ctx = hitCanvasRef.current.getContext('2d');
    if (!ctx) return false;
    const data = ctx.getImageData(px, py, 1, 1).data;
    return data[0] < 50; // Black or close to it is a wall
  };

  const collides = (cx: number, cy: number, r: number) => {
    const samples = 12;
    for (let i = 0; i < samples; i++) {
      const angle = (i / samples) * Math.PI * 2;
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      if (isWall(sx, sy)) return true;
    }
    return isWall(cx, cy);
  };

  const updatePlayer = (tx: number, ty: number) => {
    const player = playerRef.current;
    const dx = tx - player.x;
    const dy = ty - player.y;
    
    // Friction factor for wall collision logic
    const speed = 0.3; 
    const stepX = dx * speed;
    const stepY = dy * speed;

    if (!collides(player.x + stepX, player.y + stepY, player.r)) {
      player.x += stepX;
      player.y += stepY;
    } else if (!collides(player.x + stepX, player.y, player.r)) {
      player.x += stepX; // Allow sliding on X
    } else if (!collides(player.x, player.y + stepY, player.r)) {
      player.y += stepY; // Allow sliding on Y
    }

    // Check Victory
    const distToGoal = Math.hypot(player.x - goalPos.x, player.y - goalPos.y);
    if (distToGoal < cellSize * 0.4) {
      onVictory();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw background
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, '#0b1220');
      g.addColorStop(1, '#0a0f1a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // Draw Starfield
      ctx.save();
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc((i * 137) % width, (i * 257) % height, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#4da3ff';
        ctx.fill();
      }
      ctx.restore();

      // Draw Maze Walls
      ctx.save();
      ctx.strokeStyle = wallColor;
      ctx.lineWidth = wallThickness;
      ctx.lineCap = 'round';
      pulseRef.current += 0.05;
      ctx.shadowColor = wallColor;
      ctx.shadowBlur = 10 + Math.sin(pulseRef.current) * 5;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const c = maze[y][x];
          const cx = padding + x * cellSize;
          const cy = padding + y * cellSize;
          if (c.N) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + cellSize, cy); ctx.stroke(); }
          if (c.S) { ctx.beginPath(); ctx.moveTo(cx, cy + cellSize); ctx.lineTo(cx + cellSize, cy + cellSize); ctx.stroke(); }
          if (c.W) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + cellSize); ctx.stroke(); }
          if (c.E) { ctx.beginPath(); ctx.moveTo(cx + cellSize, cy); ctx.lineTo(cx + cellSize, cy + cellSize); ctx.stroke(); }
        }
      }
      ctx.restore();

      // Draw Points
      ctx.fillStyle = startColor;
      ctx.shadowBlur = 15; ctx.shadowColor = startColor;
      ctx.beginPath(); ctx.arc(padding + cellSize / 2, padding + cellSize / 2, 8, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = goalColor;
      ctx.shadowBlur = 15; ctx.shadowColor = goalColor;
      ctx.beginPath(); ctx.arc(goalPos.x, goalPos.y, 8, 0, Math.PI * 2); ctx.fill();

      // Draw Player
      const p = playerRef.current;
      ctx.save();
      ctx.shadowColor = '#2a6cff';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#4da3ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#e0fbff';
      ctx.stroke();
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [maze, rows, cols, width, height, goalPos.x, goalPos.y]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const tx = (e.clientX - rect.left) * (width / rect.width);
    const ty = (e.clientY - rect.top) * (height / rect.height);
    updatePlayer(tx, ty);
  };

  return (
    <div className="relative group">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => setIsDragging(false)}
        onPointerMove={handlePointerMove}
        className="max-w-full h-auto border-2 border-[#2a6cff] rounded-xl shadow-[0_0_30px_rgba(0,102,255,0.4)] touch-none select-none bg-black cursor-crosshair"
      />
      <div className="absolute inset-0 rounded-xl pointer-events-none shadow-[inset_0_0_50px_rgba(0,224,255,0.1)]" />
    </div>
  );
};
