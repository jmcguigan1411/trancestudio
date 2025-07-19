import { useEffect, useState } from 'react';
import { audioEngine } from '@/lib/audio';

export function useAudioEngine() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAudio = async () => {
      if (isInitialized) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        await audioEngine.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize audio engine');
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize on user interaction
    const handleUserInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [isInitialized]);

  return {
    isInitialized,
    isLoading,
    error,
    audioEngine,
  };
}
