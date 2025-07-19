import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { SoundLibrary } from "@/components/SoundLibrary";
import { TrackList } from "@/components/TrackList";
import { SequencerGrid } from "@/components/SequencerGrid";
import { MixerSection } from "@/components/MixerSection";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useSequencer } from "@/hooks/useSequencer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Track, Sample, Project } from "@shared/schema";

export default function Studio() {
  const [projectId, setProjectId] = useState<number>(1);
  const [activeTrackId, setActiveTrackId] = useState<number | undefined>();
  const [masterVolume, setMasterVolume] = useState(75);
  const [projectName, setProjectName] = useState("Untitled Project");
  
  const { toast } = useToast();
  const { isInitialized, isLoading: audioLoading, error: audioError } = useAudioEngine();

  // Load project data
  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ["/api/projects", projectId, "tracks"],
    enabled: !!projectId,
  });

  const sequencer = useSequencer(tracks);

  // Format current time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  // Mutations
  const createTrackMutation = useMutation({
    mutationFn: async (trackData: Partial<Track>) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/tracks`, trackData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tracks"] });
      toast({ title: "Track added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add track", variant: "destructive" });
    },
  });

  const updateTrackMutation = useMutation({
    mutationFn: async ({ trackId, updates }: { trackId: number; updates: Partial<Track> }) => {
      const response = await apiRequest("PATCH", `/api/tracks/${trackId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tracks"] });
    },
    onError: () => {
      toast({ title: "Failed to update track", variant: "destructive" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (updates: Partial<Project>) => {
      const response = await apiRequest("PATCH", `/api/projects/${projectId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
    },
  });

  // Initialize default project
  useEffect(() => {
    const initializeProject = async () => {
      try {
        // First try to get existing projects
        const projectsResponse = await apiRequest("GET", "/api/projects");
        const projects = await projectsResponse.json();
        
        if (projects.length > 0) {
          // Use the first existing project
          setProjectId(projects[0].id);
          setProjectName(projects[0].name);
        } else {
          // Create a new project if none exist
          const response = await apiRequest("POST", "/api/projects", {
            name: projectName,
            bpm: 128,
          });
          const newProject = await response.json();
          setProjectId(newProject.id);
        }
      } catch (error) {
        console.error("Failed to initialize project:", error);
        if (error.message.includes("401")) {
          // User is not authenticated, redirect to login
          window.location.href = "/api/login";
        }
      }
    };

    if (!projectId) {
      initializeProject();
    }
  }, []);

  // Update project name
  useEffect(() => {
    if (project && project.name !== projectName) {
      setProjectName(project.name);
    }
  }, [project]);

  // Event handlers
  const handleAddTrack = () => {
    const trackCount = tracks.length;
    createTrackMutation.mutate({
      name: `Track ${trackCount + 1}`,
      order: trackCount,
      steps: Array(16).fill(false),
      effects: {},
    });
  };

  const handleTrackUpdate = (trackId: number, updates: Partial<Track>) => {
    updateTrackMutation.mutate({ trackId, updates });
  };

  const handleStepToggle = (trackId: number, step: number) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      const steps = (track.steps as boolean[]) || Array(16).fill(false);
      const newSteps = [...steps];
      newSteps[step] = !newSteps[step];
      handleTrackUpdate(trackId, { steps: newSteps });
    }
  };

  const handleSampleDrag = (sample: Sample, e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(sample));
  };

  const handleSampleDrop = (trackId: number, sample: Sample) => {
    handleTrackUpdate(trackId, { sampleId: sample.id });
    toast({ title: `Sample "${sample.name}" added to track` });
  };

  const handleSamplePreview = (sample: Sample) => {
    // TODO: Implement sample preview with audio engine
    toast({ title: `Previewing ${sample.name}` });
  };

  const handleUpload = () => {
    // TODO: Implement file upload
    toast({ title: "Upload functionality coming soon" });
  };

  const handleProjectNameChange = (name: string) => {
    setProjectName(name);
    updateProjectMutation.mutate({ name });
  };

  const handleExport = () => {
    // TODO: Implement audio export
    toast({ title: "Export functionality coming soon" });
  };

  const handleSettings = () => {
    // TODO: Implement settings dialog
    toast({ title: "Settings coming soon" });
  };

  const handleAddEffect = (trackId?: number) => {
    toast({ title: `Adding effect${trackId ? ` to track` : ` to master`}` });
  };

  if (audioError) {
    return (
      <div className="min-h-screen bg-primary text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Audio Engine Error</h1>
          <p className="text-gray-400">{audioError}</p>
        </div>
      </div>
    );
  }

  if (audioLoading || tracksLoading) {
    return (
      <div className="min-h-screen bg-primary text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading TranceForge...</h1>
          <p className="text-gray-400">Initializing audio engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary text-white h-screen flex flex-col overflow-hidden">
      <Header
        projectName={projectName}
        isPlaying={sequencer.isPlaying}
        currentTime={formatTime(0)} // TODO: Calculate actual time
        bpm={sequencer.bpm}
        onPlay={sequencer.play}
        onPause={sequencer.pause}
        onStop={sequencer.stop}
        onRecord={() => toast({ title: "Recording functionality coming soon" })}
        onExport={handleExport}
        onSettings={handleSettings}
        onProjectNameChange={handleProjectNameChange}
      />

      <div className="flex flex-1 overflow-hidden">
        <SoundLibrary
          onSampleDrag={handleSampleDrag}
          onSamplePreview={handleSamplePreview}
          onUpload={handleUpload}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 flex min-h-0">
            <TrackList
              tracks={tracks}
              activeTrackId={activeTrackId}
              onTrackSelect={setActiveTrackId}
              onTrackUpdate={handleTrackUpdate}
              onAddTrack={handleAddTrack}
            />

            <SequencerGrid
              tracks={tracks}
              currentStep={sequencer.currentStep}
              isPlaying={sequencer.isPlaying}
              onStepToggle={handleStepToggle}
              onSampleDrop={handleSampleDrop}
            />
          </main>

          <MixerSection
            tracks={tracks}
            masterVolume={masterVolume}
            onTrackUpdate={handleTrackUpdate}
            onMasterVolumeChange={setMasterVolume}
            onAddEffect={handleAddEffect}
          />
        </div>
      </div>
    </div>
  );
}
