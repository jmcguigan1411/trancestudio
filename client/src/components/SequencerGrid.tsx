import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Track, Sample } from "@shared/schema";

interface SequencerGridProps {
  tracks: Track[];
  currentStep: number;
  isPlaying: boolean;
  onStepToggle: (trackId: number, step: number) => void;
  onSampleDrop: (trackId: number, sample: Sample) => void;
}

export function SequencerGrid({
  tracks,
  currentStep,
  isPlaying,
  onStepToggle,
  onSampleDrop,
}: SequencerGridProps) {
  const [stepCount, setStepCount] = useState("16");
  const [quantize, setQuantize] = useState("1/16");

  const steps = parseInt(stepCount);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, trackId: number) => {
    e.preventDefault();
    const sampleData = e.dataTransfer.getData("application/json");
    if (sampleData) {
      try {
        const sample = JSON.parse(sampleData);
        onSampleDrop(trackId, sample);
      } catch (error) {
        console.error("Failed to parse dropped sample data:", error);
      }
    }
  };

  const getStepState = (track: Track, stepIndex: number): boolean => {
    const trackSteps = track.steps as boolean[] || [];
    return trackSteps[stepIndex] || false;
  };

  return (
    <div className="flex-1 bg-primary overflow-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Step Sequencer</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Steps:</span>
              <Select value={stepCount} onValueChange={setStepCount}>
                <SelectTrigger className="w-20 bg-gray-850 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                  <SelectItem value="64">64</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Quantize:</span>
              <Select value={quantize} onValueChange={setQuantize}>
                <SelectTrigger className="w-20 bg-gray-850 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1/16">1/16</SelectItem>
                  <SelectItem value="1/8">1/8</SelectItem>
                  <SelectItem value="1/4">1/4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-4">
          <div className="overflow-x-auto">
            {/* Step numbers */}
            <div className="flex mb-2" style={{ minWidth: `${32 + steps * 40}px` }}>
              <div className="w-32 flex-shrink-0"></div>
              <div className="flex gap-1">
                {Array.from({ length: steps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-8 text-center text-xs font-mono flex-shrink-0 ${
                      currentStep === i && isPlaying ? "text-accent" : "text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Track rows */}
            {tracks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Add tracks to start sequencing
              </div>
            ) : (
              tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center mb-2"
                  style={{ minWidth: `${32 + steps * 40}px` }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, track.id)}
                >
                  <div className="w-32 pr-4 flex-shrink-0">
                    <div className="text-sm font-medium truncate">{track.name}</div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: steps }, (_, stepIndex) => {
                      const isActive = getStepState(track, stepIndex);
                      const isCurrent = currentStep === stepIndex && isPlaying;
                      
                      return (
                        <Button
                          key={stepIndex}
                          variant="ghost"
                          size="sm"
                          onClick={() => onStepToggle(track.id, stepIndex)}
                          className={`
                            w-8 h-8 p-0 rounded flex-shrink-0
                            ${isActive 
                              ? "step-active bg-accent hover:bg-accent/80" 
                              : "bg-gray-750 hover:bg-gray-600"
                            }
                            ${isCurrent ? "ring-2 ring-accent" : ""}
                          `}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
