"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

    osc.type = "sine";
    osc.frequency.value = 800;
    
    filter.type = "lowpass";
    filter.frequency.value = 2000;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.005);
    gain.gain.linearRampToValueAtTime(0, now + duration / 1000);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration / 1000);

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.01;
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + duration / 1000);
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
    let waitTime = 300;

    if (char === '.') {
      beep(100);
      waitTime = 200;
    } else if (char === '-') {
      beep(400);
      waitTime = 500;
    } else if (char === ' ') {
      waitTime = 600;
    } else if (char === '/') {
      waitTime = 1000;
    }

    timeoutRef.current = setTimeout(() => {
      playStep(index + 1);
    }, waitTime);
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

  return (
    <Card className="bg-black/80 border-[#2a6cff]/40 text-[#e0faff] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#2a6cff]">
          <Radio className="w-5 h-5" />
          Señal Capturada
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
                <span>Descifrando audio...</span>
                <span>100%</span>
              </div>
            </div>
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
            Reiniciar secuencia
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};