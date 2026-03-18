
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MazeCanvas } from '@/components/MazeCanvas';
import { generateRandomMaze, MazeCell } from '@/lib/maze-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MorsePlayer } from '@/components/MorsePlayer';
import { Input } from '@/components/ui/input';
import { ShieldAlert, Timer, Trophy, Info, Sparkles, Loader2 } from 'lucide-react';
import { generateCustomMaze, type GenerateCustomMazeOutput } from '@/ai/flows/generate-custom-maze-flow';

type GameStatus = 'intro' | 'playing' | 'victory' | 'timeout' | 'morse';

export default function MazeApp() {
  const [status, setStatus] = useState<GameStatus>('intro');
  const [timeLeft, setTimeLeft] = useState(50);
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mazeConfig, setMazeConfig] = useState<Partial<GenerateCustomMazeOutput>>({
    wallColor: '#2a6cff',
    startColor: '#33ff99',
    goalColor: '#ff3df6',
    backgroundColor: '#070b12'
  });

  const rows = 13;
  const cols = 19;

  const startNewGame = useCallback((config?: Partial<GenerateCustomMazeOutput>) => {
    const style = config?.style || 'classic';
    setMaze(generateRandomMaze(rows, cols, style));
    setTimeLeft(50);
    setStatus('playing');
    if (config) {
      setMazeConfig(config);
    }
  }, []);

  const handleAiGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const output = await generateCustomMaze({ description: prompt });
      setMazeConfig(output);
      startNewGame(output);
    } catch (error) {
      console.error("Error generating maze:", error);
    } finally {
      setIsGenerating(false);
    }
  };

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
      className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-1000"
      style={{ backgroundColor: mazeConfig.backgroundColor }}
    >
      
      {/* HEADER */}
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
                  <p className="font-bold text-lg text-white">Laberinto 50</p>
                  <p className="text-gray-300">Estás un paso más cerca del antídoto. Tenés 50 segundos para encontrar la salida.</p>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start gap-3 text-left">
                    <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400">Atención: el movimiento tiene rozamiento... las paredes pueden frenarte.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => startNewGame()}
                  className="w-full h-12 bg-[#2a6cff] hover:bg-[#39f] text-black font-bold text-lg transition-all glow-primary"
                >
                  JUGAR CLÁSICO
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-primary/20 backdrop-blur-md">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  Personalizar con IA
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ej: Laberinto de lava difícil..." 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-black/50 border-white/10 text-white"
                  />
                  <Button 
                    disabled={isGenerating || !prompt}
                    onClick={handleAiGenerate}
                    className="bg-primary text-primary-foreground"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear'}
                  </Button>
                </div>
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
                {mazeConfig.theme || 'Protocolo de Escape Activo'}
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
              TIEMPO AGOTADO
            </div>
            <Button onClick={() => startNewGame(mazeConfig)} variant="outline" className="border-primary text-primary hover:bg-primary/10">
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
             <MorsePlayer code="-- · - --- -·· --- ·-·· --- --· ·· ·-" />
          </div>
        )}

      </main>

      <footer className="mt-auto py-8 text-white/20 text-xs uppercase tracking-[0.3em] font-medium">
        Cyber-System Alpha v2.0
      </footer>
    </div>
  );
}
