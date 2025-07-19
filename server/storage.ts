import { 
  samples, 
  tracks, 
  projects, 
  users,
  type Sample, 
  type Track, 
  type Project, 
  type User,
  type UpsertUser,
  type InsertSample, 
  type InsertTrack, 
  type InsertProject 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Samples
  getSamples(): Promise<Sample[]>;
  getSamplesByCategory(category: string): Promise<Sample[]>;
  getSample(id: number): Promise<Sample | undefined>;
  createSample(sample: InsertSample): Promise<Sample>;
  
  // Projects
  getProjects(userId?: string): Promise<Project[]>;
  getProject(id: number, userId?: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  
  // Tracks
  getTracksByProject(projectId: number): Promise<Track[]>;
  getTrack(id: number): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  updateTrack(id: number, updates: Partial<Track>): Promise<Track | undefined>;
  deleteTrack(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getSamples(): Promise<Sample[]> {
    return await db.select().from(samples);
  }

  async getSamplesByCategory(category: string): Promise<Sample[]> {
    return await db.select().from(samples).where(eq(samples.category, category));
  }

  async getSample(id: number): Promise<Sample | undefined> {
    const [sample] = await db.select().from(samples).where(eq(samples.id, id));
    return sample;
  }

  async createSample(insertSample: InsertSample): Promise<Sample> {
    const [sample] = await db.insert(samples).values(insertSample).returning();
    return sample;
  }

  async getProjects(userId?: string): Promise<Project[]> {
    if (userId) {
      return await db.select().from(projects).where(eq(projects.userId, userId));
    }
    return await db.select().from(projects);
  }

  async getProject(id: number, userId?: string): Promise<Project | undefined> {
    if (userId) {
      const [project] = await db.select().from(projects)
        .where(eq(projects.id, id));
      // Check if user owns this project
      if (project && project.userId !== userId) {
        return undefined;
      }
      return project;
    }
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async getTracksByProject(projectId: number): Promise<Track[]> {
    return await db.select().from(tracks)
      .where(eq(tracks.projectId, projectId))
      .orderBy(tracks.order);
  }

  async getTrack(id: number): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
    return track;
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const [track] = await db.insert(tracks).values(insertTrack).returning();
    return track;
  }

  async updateTrack(id: number, updates: Partial<Track>): Promise<Track | undefined> {
    const [track] = await db.update(tracks)
      .set(updates)
      .where(eq(tracks.id, id))
      .returning();
    return track;
  }

  async deleteTrack(id: number): Promise<boolean> {
    const result = await db.delete(tracks).where(eq(tracks.id, id));
    return result.rowCount > 0;
  }
}

// Initialize with some default samples
async function initializeDefaultSamples() {
  try {
    const existingSamples = await db.select().from(samples).limit(1);
    if (existingSamples.length === 0) {
      const defaultSamples = [
        { name: "Kick 01", category: "drums", filename: "kick_01.wav", bpm: 128, duration: 2100, tags: ["techno", "punchy"], isUserUploaded: false },
        { name: "Snare 02", category: "drums", filename: "snare_02.wav", bpm: 128, duration: 1800, tags: ["sharp", "crisp"], isUserUploaded: false },
        { name: "Hi-Hat 03", category: "drums", filename: "hihat_03.wav", bpm: 128, duration: 500, tags: ["metallic", "bright"], isUserUploaded: false },
        { name: "Deep Bass", category: "bass", filename: "bass_01.wav", bpm: 128, duration: 4000, tags: ["deep", "rumble"], isUserUploaded: false },
        { name: "Trance Lead", category: "synths", filename: "lead_01.wav", bpm: 128, duration: 8000, tags: ["pluck", "melodic"], isUserUploaded: false },
        { name: "Acid Bass", category: "bass", filename: "acid_bass.wav", bpm: 128, duration: 2000, tags: ["303", "acid"], isUserUploaded: false },
      ];
      
      await db.insert(samples).values(defaultSamples);
      console.log("Initialized default samples");
    }
  } catch (error) {
    console.error("Failed to initialize default samples:", error);
  }
}

export const storage = new DatabaseStorage();

// Initialize default samples on startup
initializeDefaultSamples();
