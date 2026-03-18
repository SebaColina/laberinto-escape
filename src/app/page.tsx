
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MazeCanvas } from '@/components/MazeCanvas';
import { generateRandomMaze, MazeCell } from '@/lib/maze-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MorsePlayer } from '@/components/MorsePlayer';
import { ShieldAlert, Timer, Trophy, Play, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type GameStatus = 'intro' | 'playing' | 'victory' | 'timeout' | 'morse';

export default function MazeApp() {
  const [status, setStatus] = useState<GameStatus>('intro');
  const [timeLeft, setTimeLeft] = useState(50);
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const rows = 13;
  const cols = 19;

  const startNewGame = useCallback(() => {
    setMaze(generateRandomMaze(rows, cols, 'classic'));
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
    <div className="min-h-screen bg-[#070b12] text-[#e0faff] flex flex-col items-center justify-center p-4 selection:bg-primary/30">
      
      {/* HEADER */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#2a6cff] drop-shadow-[0_0_15px_rgba(0,102,255,0.8)] uppercase italic">
          Laberinto Cibernético
        </h1>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center gap-6">
        
        {status === 'intro' && (
          <Card className="w-full max-w-md bg-black/60 border-[#2a6cff]/30 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-[#2a6cff] flex items-center justify-center gap-2">
                <Info className="w-6 h-6" />
                Instrucciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center text-sm md:text-base">
              <div className="space-y-4">
                <p className="font-bold text-lg">Laberinto 50</p>
                <p>Estás un paso más cerca del antídoto. Tenés 50 segundos para encontrar la salida.</p>
                <p className="text-muted-foreground italic">El recorrido comienza en el extremo superior izquierdo.</p>
                <div className="p-3 bg-[#2a6cff]/10 rounded-lg border border-[#2a6cff]/20 flex items-start gap-3 text-left">
                  <ShieldAlert className="w-5 h-5 text-[#2a6cff] shrink-0 mt-0.5" />
                  <p className="text-xs">Atención: el movimiento no será sencillo... el rozamiento con las paredes puede enlentecer tu trayecto.</p>
                </div>
              </div>
              <Button 
                onClick={startNewGame}
                className="w-full h-12 bg-[#2a6cff] hover:bg-[#39f] text-black font-bold text-lg transition-all glow-primary"
              >
                JUGAR
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'playing' && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500 w-full">
            <div className="flex items-center justify-between w-full max-w-[700px] px-2">
              <Badge variant="outline" className="text-lg py-1 px-4 border-[#39d0ff] text-[#39d0ff] shadow-[0_0_10px_rgba(0,224,255,0.3)]">
                <Timer className="w-4 h-4 mr-2" />
                {timeLeft}s
              </Badge>
              <div className="text-xs uppercase tracking-widest text-[#2a6cff] font-bold">Protocolo de Escape Activo</div>
            </div>
            
            <MazeCanvas 
              maze={maze} 
              rows={rows} 
              cols={cols} 
              onVictory={handleVictory}
            />
          </div>
        )}

        {status === 'timeout' && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-6xl text-destructive font-black flex flex-col items-center gap-4">
              <Timer className="w-16 h-16 animate-pulse" />
              TIEMPO AGOTADO
            </div>
            <Button onClick={startNewGame} variant="outline" className="border-[#2a6cff] text-[#2a6cff] hover:bg-[#2a6cff]/10">
              REINTENTAR
            </Button>
          </div>
        )}

        {status === 'victory' && (
          <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
            <h2 className="text-5xl font-black text-white italic tracking-tighter">¡ESCAPE LOGRADO!</h2>
          </div>
        )}

        {status === 'morse' && (
          <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-700">
             <MorsePlayer code="·--· ·- --· ·· -· ·- / ··---" />
          </div>
        )}

      </main>

      <footer className="mt-auto py-8 text-[rgba(42,108,255,0.5)] text-xs uppercase tracking-[0.3em] font-medium">
        Cyber-System Alpha v2.0
      </footer>
    </div>
  );
}
