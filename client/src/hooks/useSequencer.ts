import { useState, useEffect, useCallback } from 'react';
import { audioEngine } from '@/lib/audio';
import type { Track } from '@shared/schema';

interface SequencerState {
  isPlaying: boolean;
  currentStep: number;
  bpm: number;
  steps: number;
}

export function useSequencer(tracks: Track[] = []) {
  const [state, setState] = useState<SequencerState>({
    isPlaying: false,
    currentStep: 0,
    bpm: 128,
    steps: 16,
  });

  const [stepInterval, setStepInterval] = useState<NodeJS.Timeout | null>(null);

  const play = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
    audioEngine.play();
    
    // Calculate step duration based on BPM
    const stepDuration = (60 / state.bpm / 4) * 1000; // 16th notes
    
    const interval = setInterval(() => {
      setState(prev => {
        const nextStep = (prev.currentStep + 1) % prev.steps;
        
        // Trigger sounds for active steps
        tracks.forEach(track => {
          const steps = track.steps as boolean[] || [];
          if (steps[nextStep] && track.sampleId) {
            // TODO: Trigger sample playback
            console.log(`Playing sample ${track.sampleId} on step ${nextStep}`);
          }
        });
        
        return { ...prev, currentStep: nextStep };
      });
    }, stepDuration);
    
    setStepInterval(interval);
  }, [state.bpm, state.steps, tracks]);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    audioEngine.pause();
    if (stepInterval) {
      clearInterval(stepInterval);
      setStepInterval(null);
    }
  }, [stepInterval]);

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }));
    audioEngine.stop();
    if (stepInterval) {
      clearInterval(stepInterval);
      setStepInterval(null);
    }
  }, [stepInterval]);

  const setBPM = useCallback((bpm: number) => {
    setState(prev => ({ ...prev, bpm }));
    audioEngine.setBPM(bpm);
  }, []);

  useEffect(() => {
    return () => {
      if (stepInterval) {
        clearInterval(stepInterval);
      }
    };
  }, [stepInterval]);

  return {
    ...state,
    play,
    pause,
    stop,
    setBPM,
  };
}
