import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Track } from "@shared/schema";

interface MixerSectionProps {
  tracks: Track[];
  masterVolume: number;
  onTrackUpdate: (trackId: number, updates: Partial<Track>) => void;
  onMasterVolumeChange: (volume: number) => void;
  onAddEffect: (trackId?: number) => void;
}

interface KnobProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}

function Knob({ value, onChange, min = 0, max = 100, label }: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = startYRef.current - moveEvent.clientY;
      const sensitivity = (max - min) / 100;
      const newValue = Math.max(min, Math.min(max, startValueRef.current + deltaY * sensitivity));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    e.preventDefault();
  };

  const rotation = ((value - min) / (max - min) - 0.5) * 270;

  return (
    <div className="flex-1 text-center">
      <div
        className="knob w-8 h-8 rounded-full border-2 border-gray-600 relative mx-auto mb-1 cursor-pointer"
        style={{ transform: `rotate(${rotation}deg)` }}
        onMouseDown={handleMouseDown}
      />
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function VUMeter({ level }: { level: number }) {
  return (
    <div className="w-3 h-24 bg-gray-850 rounded-lg relative">
      <div
        className="vu-meter absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-100"
        style={{ height: `${Math.max(0, Math.min(100, level))}%` }}
      />
    </div>
  );
}

function WaveformVisualization() {
  const bars = Array.from({ length: 20 }, (_, i) => {
    const height = 20 + Math.random() * 60;
    return (
      <div
        key={i}
        className="waveform-bar w-1 bg-accent rounded-t"
        style={{ height: `${height}%` }}
      />
    );
  });

  return (
    <div className="h-16 bg-gray-850 rounded-lg p-2 flex items-end space-x-0.5">
      {bars}
    </div>
  );
}

export function MixerSection({
  tracks,
  masterVolume,
  onTrackUpdate,
  onMasterVolumeChange,
  onAddEffect,
}: MixerSectionProps) {
  const updateTrackEffect = (trackId: number, effect: string, value: number) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      const effects = (track.effects as Record<string, number>) || {};
      onTrackUpdate(trackId, {
        effects: { ...effects, [effect]: value }
      });
    }
  };

  const getEffectValue = (track: Track, effect: string): number => {
    const effects = (track.effects as Record<string, number>) || {};
    return effects[effect] || 50;
  };

  return (
    <section className="h-64 bg-secondary border-t border-gray-700 flex">
      {/* Master Section */}
      <div className="w-64 border-r border-gray-700 p-4">
        <h3 className="text-sm font-medium mb-3">Master</h3>
        <div className="space-y-4">
          <WaveformVisualization />

          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 w-12">Master</span>
            <Slider
              value={[masterVolume]}
              onValueChange={(value) => onMasterVolumeChange(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <VUMeter level={masterVolume} />
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddEffect()}
              className="w-full text-xs text-gray-400 border-gray-600 hover:border-accent hover:text-accent"
            >
              + Add Effect
            </Button>
          </div>
        </div>
      </div>

      {/* Channel Mixer */}
      <div className="flex-1 flex overflow-x-auto">
        {tracks.map((track) => (
          <div key={track.id} className="w-48 border-r border-gray-700 p-3 shrink-0">
            <div className="text-sm font-medium mb-3 truncate">{track.name}</div>

            <div className="space-y-3">
              {/* EQ Section */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400">EQ</div>
                <div className="flex space-x-2">
                  <Knob
                    value={getEffectValue(track, "eq_high")}
                    onChange={(value) => updateTrackEffect(track.id, "eq_high", value)}
                    label="High"
                  />
                  <Knob
                    value={getEffectValue(track, "eq_mid")}
                    onChange={(value) => updateTrackEffect(track.id, "eq_mid", value)}
                    label="Mid"
                  />
                  <Knob
                    value={getEffectValue(track, "eq_low")}
                    onChange={(value) => updateTrackEffect(track.id, "eq_low", value)}
                    label="Low"
                  />
                </div>
              </div>

              {/* Effects */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Effects</div>
                <div className="flex space-x-2">
                  <Knob
                    value={getEffectValue(track, "reverb")}
                    onChange={(value) => updateTrackEffect(track.id, "reverb", value)}
                    label="Reverb"
                  />
                  <Knob
                    value={getEffectValue(track, "delay")}
                    onChange={(value) => updateTrackEffect(track.id, "delay", value)}
                    label="Delay"
                  />
                </div>
              </div>

              {/* Volume fader and VU meter */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <div className="h-24 w-2 mx-auto relative">
                    <Slider
                      orientation="vertical"
                      value={[track.volume || 75]}
                      onValueChange={(value) => onTrackUpdate(track.id, { volume: value[0] })}
                      max={100}
                      step={1}
                      className="h-full"
                    />
                  </div>
                  <div className="text-xs text-center mt-1 text-gray-500">
                    {track.volume || 75}
                  </div>
                </div>
                <VUMeter level={track.volume || 75} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
