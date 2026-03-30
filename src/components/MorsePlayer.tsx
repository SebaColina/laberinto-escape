
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MorsePlayerProps {
  code: string;
}

export const MorsePlayer: React.FC<MorsePlayerProps> = ({ code }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const beep = (duration: number) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "square";
    osc.frequency.value = 750;
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.02;
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + duration / 1000);
  };

  const playStep = (index: number) => {
    if (index >= code.length) {
      setIsPlaying(false);
      setCurrentIndex(0);
      setProgress(0);
      return;
    }

    setCurrentIndex(index);
    setProgress((index / code.length) * 100);

    const char = code[index];
    if (char === '.') beep(100);
    if (char === '-') beep(300);

    const delay = char === ' ' ? 300 : char === '/' ? 700 : 400;

    timeoutRef.current = setTimeout(() => {
      playStep(index + 1);
    }, delay);
  };

  useEffect(() => {
    if (isPlaying) {
      playStep(currentIndex);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!isPlaying) {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const characters = code.split('');

  return (
    <Card className="bg-black/80 border-[#2a6cff]/40 text-[#e0faff] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#2a6cff]">
          <Radio className="w-5 h-5" />
          Transmisión Encriptada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 w-full">
            <Button 
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-[#2a6cff] text-[#2a6cff] hover:bg-[#2a6cff]/20 shrink-0"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
            <div className="w-full space-y-2">
              <Slider 
                value={[progress]} 
                onValueChange={(v) => {
                  const newIdx = Math.floor((v[0] / 100) * code.length);
                  setCurrentIndex(newIdx);
                  setProgress(v[0]);
                }}
                max={100}
                step={1}
                className="[&>[data-slot=slider-range]]:bg-[#2a6cff]"
              />
              <div className="text-[10px] uppercase tracking-tighter text-muted-foreground flex justify-between">
                <span>0%</span>
                <span>Buffer de señal: {currentIndex}/{code.length}</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#2a6cff]/5 rounded-md border border-[#2a6cff]/10 w-full min-h-[120px] flex flex-wrap items-center justify-center gap-x-1 gap-y-2 font-mono overflow-hidden">
            {characters.map((char, idx) => (
              <span 
                key={idx}
                className={cn(
                  "text-2xl transition-all duration-200",
                  idx === currentIndex 
                    ? "text-[#33ff99] scale-150 drop-shadow-[0_0_10px_#33ff99]" 
                    : "text-[#2a6cff]/30",
                  char === ' ' && "mx-2"
                )}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(0);
              setProgress(0);
            }}
            className="text-xs text-[#2a6cff]/60 hover:text-[#2a6cff]"
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reiniciar señal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
