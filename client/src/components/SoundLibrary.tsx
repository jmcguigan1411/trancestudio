import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, Play } from "lucide-react";
import type { Sample } from "@shared/schema";

interface SoundLibraryProps {
  onSampleDrag: (sample: Sample, e: React.DragEvent) => void;
  onSamplePreview: (sample: Sample) => void;
  onUpload: () => void;
}

const CATEGORIES = ["drums", "bass", "synths", "leads", "pads", "fx", "vocals"];

export function SoundLibrary({ onSampleDrag, onSamplePreview, onUpload }: SoundLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("drums");

  const { data: samples = [], isLoading } = useQuery({
    queryKey: ["/api/samples"],
  });

  const filteredSamples = samples.filter((sample: Sample) => {
    const matchesSearch = sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = sample.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getSampleIcon = (category: string) => {
    switch (category) {
      case "drums": return "🥁";
      case "bass": return "🎸";
      case "synths": return "🎹";
      case "leads": return "🎵";
      case "pads": return "🌊";
      case "fx": return "✨";
      case "vocals": return "🎤";
      default: return "🎵";
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000 * 10) / 10;
    return `${seconds}s`;
  };

  return (
    <aside className="w-80 bg-secondary border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Sound Library</h2>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search sounds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-850 border-gray-600 pl-10"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 bg-gray-850 m-2">
          <TabsTrigger value="drums" className="text-xs">Drums</TabsTrigger>
          <TabsTrigger value="bass" className="text-xs">Bass</TabsTrigger>
          <TabsTrigger value="synths" className="text-xs">Synths</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading samples...</div>
          ) : filteredSamples.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No samples found</div>
          ) : (
            <div className="space-y-1">
              {filteredSamples.map((sample: Sample) => (
                <div
                  key={sample.id}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-750 cursor-pointer group"
                  draggable
                  onDragStart={(e) => onSampleDrag(sample, e)}
                >
                  <div className="w-8 h-8 bg-gray-850 rounded flex items-center justify-center mr-3 text-sm">
                    {getSampleIcon(sample.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{sample.name}</div>
                    <div className="text-xs text-gray-500">
                      {sample.bpm && `${sample.bpm} BPM • `}
                      {sample.duration && formatDuration(sample.duration)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSamplePreview(sample);
                    }}
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Tabs>

      <div className="p-4 border-t border-gray-700">
        <Button
          onClick={onUpload}
          variant="outline"
          className="w-full border-dashed border-gray-600 text-gray-400 hover:border-accent hover:text-accent"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Sample
        </Button>
      </div>
    </aside>
  );
}
