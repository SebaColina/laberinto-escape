"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MazeCanvas } from '@/components/MazeCanvas';
import { generateRandomMaze, MazeCell } from '@/lib/maze-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MorsePlayer } from '@/components/MorsePlayer';
import { ShieldAlert, Timer, Trophy, Info } from 'lucide-react';

type GameStatus = 'intro' | 'playing' | 'victory' | 'timeout' | 'morse';

export default function MazeApp() {
  const [status, setStatus] = useState<GameStatus>('intro');
  const [timeLeft, setTimeLeft] = useState(50);
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  
  const mazeConfig = {
    wallColor: '#2a6cff',
    startColor: '#33ff99',
    goalColor: '#ff3df6',
    backgroundColor: '#070b12',
    theme: 'Protocolo de Seguridad'
  };

  const rows = 13;
  const cols = 19;

  const startNewGame = useCallback(() => {
    setMaze(generateRandomMaze(rows, cols));
    setTimeLeft(50);
    setStatus('playing');
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const handleVictory = () => {
    setStatus('victory');
    setTimeout(() => setStatus('morse'), 1500);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: mazeConfig.backgroundColor }}
    >
      
      <header className="mb-8 text-center">
        <h1 
          className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase italic drop-shadow-lg"
          style={{ color: mazeConfig.wallColor }}
        >
          Laberinto Cibernético
        </h1>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center gap-6">
        
        {status === 'intro' && (
          <div className="flex flex-col gap-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
            <Card className="bg-black/60 border-white/10 backdrop-blur-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
                  <Info className="w-6 h-6" />
                  Instrucciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center text-sm">
                <div className="space-y-4">
                  <p className="font-bold text-lg text-white">Misión: El Antídoto</p>
                  <p className="text-gray-300">Tienes 50 segundos para encontrar la salida antes de que el sistema se bloquee.</p>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start gap-3 text-left">
                    <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400">Las paredes generan fricción. Mantén la precisión para no perder tiempo.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => startNewGame()}
                  className="w-full h-12 bg-[#2a6cff] hover:bg-[#39f] text-black font-bold text-lg transition-all glow-primary"
                >
                  INICIAR
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {status === 'playing' && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500 w-full">
            <div className="flex items-center justify-between w-full max-w-[700px] px-2">
              <Badge variant="outline" className="text-lg py-1 px-4 border-primary text-primary shadow-[0_0_10px_rgba(0,224,255,0.3)]">
                <Timer className="w-4 h-4 mr-2" />
                {timeLeft}s
              </Badge>
              <div className="text-xs uppercase tracking-widest font-bold opacity-70" style={{ color: mazeConfig.wallColor }}>
                {mazeConfig.theme}
              </div>
            </div>
            
            <MazeCanvas 
              maze={maze} 
              rows={rows} 
              cols={cols} 
              onVictory={handleVictory}
              config={mazeConfig}
            />
          </div>
        )}

        {status === 'timeout' && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-6xl text-destructive font-black flex flex-col items-center gap-4">
              <Timer className="w-16 h-16 animate-pulse" />
              SISTEMA BLOQUEADO
            </div>
            <Button onClick={() => startNewGame()} variant="outline" className="border-primary text-primary hover:bg-primary/10">
              REINTENTAR ACCESO
            </Button>
          </div>
        )}

        {status === 'victory' && (
          <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
            <h2 className="text-5xl font-black text-white italic tracking-tighter">ACCESO CONCEDIDO</h2>
          </div>
        )}

        {status === 'morse' && (
          <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-700">
             <MorsePlayer code="-- . - --- -.. --- .-.. --- --. .. .-" />
          </div>
        )}

      </main>

      <footer className="mt-auto py-8 text-white/20 text-xs uppercase tracking-[0.3em] font-medium">
        Protocolo de Escape v1.0
      </footer>
    </div>
  );
}
