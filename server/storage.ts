import { samples, tracks, projects, type Sample, type Track, type Project, type InsertSample, type InsertTrack, type InsertProject } from "@shared/schema";

export interface IStorage {
  // Samples
  getSamples(): Promise<Sample[]>;
  getSamplesByCategory(category: string): Promise<Sample[]>;
  getSample(id: number): Promise<Sample | undefined>;
  createSample(sample: InsertSample): Promise<Sample>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  
  // Tracks
  getTracksByProject(projectId: number): Promise<Track[]>;
  getTrack(id: number): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  updateTrack(id: number, updates: Partial<Track>): Promise<Track | undefined>;
  deleteTrack(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private samples: Map<number, Sample>;
  private tracks: Map<number, Track>;
  private projects: Map<number, Project>;
  private currentSampleId: number;
  private currentTrackId: number;
  private currentProjectId: number;

  constructor() {
    this.samples = new Map();
    this.tracks = new Map();
    this.projects = new Map();
    this.currentSampleId = 1;
    this.currentTrackId = 1;
    this.currentProjectId = 1;
    
    // Initialize with default samples for demo
    this.initializeDefaultSamples();
  }

  private initializeDefaultSamples() {
    const defaultSamples: InsertSample[] = [
      { name: "Kick 01", category: "drums", filename: "kick_01.wav", bpm: 128, duration: 2100, tags: ["techno", "punchy"] },
      { name: "Snare 02", category: "drums", filename: "snare_02.wav", bpm: 128, duration: 1800, tags: ["sharp", "crisp"] },
      { name: "Hi-Hat 03", category: "drums", filename: "hihat_03.wav", bpm: 128, duration: 500, tags: ["metallic", "bright"] },
      { name: "Deep Bass", category: "bass", filename: "bass_01.wav", bpm: 128, duration: 4000, tags: ["deep", "rumble"] },
      { name: "Trance Lead", category: "synths", filename: "lead_01.wav", bpm: 128, duration: 8000, tags: ["pluck", "melodic"] },
      { name: "Acid Bass", category: "bass", filename: "acid_bass.wav", bpm: 128, duration: 2000, tags: ["303", "acid"] },
    ];

    defaultSamples.forEach(sample => {
      this.createSample(sample);
    });
  }

  async getSamples(): Promise<Sample[]> {
    return Array.from(this.samples.values());
  }

  async getSamplesByCategory(category: string): Promise<Sample[]> {
    return Array.from(this.samples.values()).filter(sample => sample.category === category);
  }

  async getSample(id: number): Promise<Sample | undefined> {
    return this.samples.get(id);
  }

  async createSample(insertSample: InsertSample): Promise<Sample> {
    const id = this.currentSampleId++;
    const sample: Sample = {
      ...insertSample,
      id,
      duration: insertSample.duration ?? null,
      bpm: insertSample.bpm ?? null,
      tags: insertSample.tags ?? null,
      isUserUploaded: insertSample.isUserUploaded ?? null,
      createdAt: new Date(),
    };
    this.samples.set(id, sample);
    return sample;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = {
      ...insertProject,
      id,
      bpm: insertProject.bpm ?? null,
      isPlaying: insertProject.isPlaying ?? null,
      currentStep: insertProject.currentStep ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async getTracksByProject(projectId: number): Promise<Track[]> {
    return Array.from(this.tracks.values())
      .filter(track => track.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = this.currentTrackId++;
    const track: Track = {
      ...insertTrack,
      id,
      volume: insertTrack.volume ?? null,
      pan: insertTrack.pan ?? null,
      isMuted: insertTrack.isMuted ?? null,
      isSoloed: insertTrack.isSoloed ?? null,
      sampleId: insertTrack.sampleId ?? null,
      steps: insertTrack.steps ?? null,
      effects: insertTrack.effects ?? null,
    };
    this.tracks.set(id, track);
    return track;
  }

  async updateTrack(id: number, updates: Partial<Track>): Promise<Track | undefined> {
    const track = this.tracks.get(id);
    if (!track) return undefined;
    
    const updatedTrack = { ...track, ...updates };
    this.tracks.set(id, updatedTrack);
    return updatedTrack;
  }

  async deleteTrack(id: number): Promise<boolean> {
    return this.tracks.delete(id);
  }
}

export const storage = new MemStorage();
