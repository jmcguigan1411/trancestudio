import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Play, Pause, Square, Circle, Settings, LogOut } from "lucide-react";

interface HeaderProps {
  projectName: string;
  isPlaying: boolean;
  currentTime: string;
  bpm: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRecord: () => void;
  onExport: () => void;
  onSettings: () => void;
  onProjectNameChange: (name: string) => void;
}

export function Header({
  projectName,
  isPlaying,
  currentTime,
  bpm,
  onPlay,
  onPause,
  onStop,
  onRecord,
  onExport,
  onSettings,
  onProjectNameChange,
}: HeaderProps) {
  return (
    <header className="bg-secondary border-b border-gray-700 px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Music className="text-accent text-xl" />
          <h1 className="text-xl font-bold">TranceForge</h1>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Input
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="bg-transparent border-none text-white text-sm w-48 focus:bg-gray-750"
            placeholder="Untitled Project"
          />
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gray-850 rounded-lg px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="text-gray-400 hover:text-white"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={isPlaying ? onPause : onPlay}
            className="text-gray-400 hover:text-white"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRecord}
            className="text-gray-400 hover:text-white"
          >
            <Circle className="w-4 h-4 text-red-500" />
          </Button>
        </div>
        <div className="flex items-center space-x-3 text-sm font-mono">
          <span>{currentTime}</span>
          <span className="text-gray-500">|</span>
          <span>{bpm} BPM</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          onClick={onExport}
          className="bg-accent text-black hover:bg-blue-400"
          size="sm"
        >
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="text-gray-400 hover:text-white"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.location.href = '/api/logout'}
          className="text-gray-400 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
