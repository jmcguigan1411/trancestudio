import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";
import type { Track } from "@shared/schema";

interface TrackListProps {
  tracks: Track[];
  activeTrackId?: number;
  onTrackSelect: (trackId: number) => void;
  onTrackUpdate: (trackId: number, updates: Partial<Track>) => void;
  onAddTrack: () => void;
}

export function TrackList({
  tracks,
  activeTrackId,
  onTrackSelect,
  onTrackUpdate,
  onAddTrack,
}: TrackListProps) {
  const handleVolumeChange = (trackId: number, volume: number[]) => {
    onTrackUpdate(trackId, { volume: volume[0] });
  };

  const handlePanChange = (trackId: number, pan: number[]) => {
    onTrackUpdate(trackId, { pan: pan[0] });
  };

  const handleSolo = (trackId: number) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      onTrackUpdate(trackId, { isSoloed: !track.isSoloed });
    }
  };

  const handleMute = (trackId: number) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      onTrackUpdate(trackId, { isMuted: !track.isMuted });
    }
  };

  const handleNameChange = (trackId: number, name: string) => {
    onTrackUpdate(trackId, { name });
  };

  return (
    <div className="w-64 bg-gray-850 border-r border-gray-700 flex flex-col">
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-medium">Tracks</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddTrack}
          className="text-gray-400 hover:text-accent p-1"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tracks.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No tracks yet. Add a track to get started.
          </div>
        ) : (
          tracks.map((track) => (
            <div
              key={track.id}
              className={`border-b border-gray-700 ${
                activeTrackId === track.id ? "track-active" : ""
              }`}
              onClick={() => onTrackSelect(track.id)}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Input
                    value={track.name}
                    onChange={(e) => handleNameChange(track.id, e.target.value)}
                    className="bg-transparent text-sm font-medium border-none px-1 py-0.5 rounded focus:bg-gray-750"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSolo(track.id);
                      }}
                      className={`w-6 h-6 text-xs ${
                        track.isSoloed
                          ? "bg-yellow-500 text-black"
                          : "text-yellow-500 hover:bg-yellow-500 hover:text-black"
                      }`}
                    >
                      S
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMute(track.id);
                      }}
                      className={`w-6 h-6 text-xs ${
                        track.isMuted
                          ? "bg-red-500 text-black"
                          : "text-red-500 hover:bg-red-500 hover:text-black"
                      }`}
                    >
                      M
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 w-8">Vol</span>
                    <Slider
                      value={[track.volume || 75]}
                      onValueChange={(value) => handleVolumeChange(track.id, value)}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 w-8">Pan</span>
                    <Slider
                      value={[track.pan || 50]}
                      onValueChange={(value) => handlePanChange(track.id, value)}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
