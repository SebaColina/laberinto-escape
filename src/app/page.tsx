"use client";

import React, { useState, useEffect } from 'react';
import { MazeCanvas } from '@/components/MazeCanvas';
import { generateRandomMaze, MazeCell } from '@/lib/maze-generator';
import { generateCustomMaze, GenerateCustomMazeOutput } from '@/ai/flows/generate-custom-maze-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sparkles, RefreshCcw, Download, Settings2, Wand2, Box, Layers } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function MazeCanvasApp() {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(20);
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mazeSettings, setMazeSettings] = useState({
    wallColor: '#2a6cff',
    startColor: '#5c8fff',
    goalColor: '#6bcbef',
    theme: 'Cosmic Default'
  });

  const generateNew = (r = rows, c = cols, style = 'classic') => {
    setMaze(generateRandomMaze(r, c, style));
  };

  useEffect(() => {
    generateNew();
  }, []);

  const handleAiGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    
    setIsGenerating(true);
    try {
      const result = await generateCustomMaze({ description: prompt });
      setRows(result.rows);
      setCols(result.cols);
      setMazeSettings({
        wallColor: result.wallColor,
        startColor: result.startColor,
        goalColor: result.goalColor,
        theme: result.theme
      });
      generateNew(result.rows, result.cols, result.style);
      toast({
        title: "Labyrinth Manifested",
        description: `Theme: ${result.theme} | Complexity: ${result.difficulty}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The cosmic signals were too weak. Try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCanvas = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `maze-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 gap-12 max-w-7xl mx-auto">
      <header className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center justify-center gap-2 text-primary mb-2">
          <Box className="w-8 h-8" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Structural Generative AI</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
          Maze Canvas
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light leading-relaxed">
          Traverse algorithmically generated structures, woven through space and time with custom AI parameters.
        </p>
      </header>

      <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full order-2 lg:order-1">
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                AI Labyrinth Crafter
              </CardTitle>
              <CardDescription>Describe your dream maze theme</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAiGeneration} className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    placeholder="e.g., A glowing neon city grid at midnight"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-white/5 border-white/10 h-12 focus:ring-primary"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isGenerating} 
                  className="w-full h-12 bg-primary hover:bg-primary/80 text-primary-foreground font-bold"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Manifesting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-secondary" />
                Manual Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Grid Size: {rows}x{cols}</Label>
                </div>
                <Slider 
                  value={[rows]} 
                  onValueChange={(v) => {
                    setRows(v[0]);
                    setCols(v[0]);
                    generateNew(v[0], v[0]);
                  }} 
                  min={10} 
                  max={50} 
                  step={2}
                  className="py-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => generateNew()}
                  className="border-white/10 hover:bg-white/5 h-12"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button 
                  variant="outline" 
                  onClick={downloadCanvas}
                  className="border-white/10 hover:bg-white/5 h-12"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Capture
                </Button>
              </div>
            </CardContent>
          </Card>

          {mazeSettings.theme && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <Layers className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-widest text-primary font-bold">Current Theme</p>
                <p className="text-sm text-foreground/80">{mazeSettings.theme}</p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Display */}
        <div className="lg:col-span-8 w-full order-1 lg:order-2">
          {maze.length > 0 && (
            <div className="animate-in zoom-in-95 fade-in duration-700">
              <MazeCanvas 
                maze={maze} 
                rows={rows} 
                cols={cols} 
                wallColor={mazeSettings.wallColor}
                startColor={mazeSettings.startColor}
                goalColor={mazeSettings.goalColor}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="w-full pt-12 pb-6 border-t border-white/5 mt-auto flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm font-light">
        <p>© 2024 Maze Canvas. Generated with Advanced Tech.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Algorithms</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Github</a>
        </div>
      </footer>
    </div>
  );
}