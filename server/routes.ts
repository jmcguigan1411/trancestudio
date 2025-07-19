import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSampleSchema, insertTrackSchema, insertProjectSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";

const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.wav', '.mp3', '.ogg'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.includes(ext));
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Samples
  app.get("/api/samples", async (req, res) => {
    try {
      const { category } = req.query;
      const samples = category 
        ? await storage.getSamplesByCategory(category as string)
        : await storage.getSamples();
      res.json(samples);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch samples" });
    }
  });

  app.get("/api/samples/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sample = await storage.getSample(id);
      if (!sample) {
        return res.status(404).json({ message: "Sample not found" });
      }
      res.json(sample);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sample" });
    }
  });

  app.post("/api/samples", upload.single('file'), async (req, res) => {
    try {
      const { name, category, bpm, tags } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const sampleData = insertSampleSchema.parse({
        name: name || file.originalname,
        category: category || "drums",
        filename: file.filename,
        bpm: bpm ? parseInt(bpm) : undefined,
        duration: 0, // Would be calculated from audio file
        tags: tags ? JSON.parse(tags) : [],
        isUserUploaded: true,
      });

      const sample = await storage.createSample(sampleData);
      res.status(201).json(sample);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sample data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sample" });
    }
  });

  // Projects (protected routes)
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const project = await storage.getProject(id, userId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: userId
      });
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns this project
      const existingProject = await storage.getProject(id, userId);
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updates = req.body;
      const project = await storage.updateProject(id, updates);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Tracks (protected routes)  
  app.get("/api/projects/:projectId/tracks", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const tracks = await storage.getTracksByProject(projectId);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  app.post("/api/projects/:projectId/tracks", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const trackData = insertTrackSchema.parse({
        ...req.body,
        projectId,
      });
      const track = await storage.createTrack(trackData);
      res.status(201).json(track);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid track data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create track" });
    }
  });

  app.patch("/api/tracks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const track = await storage.updateTrack(id, updates);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      res.json(track);
    } catch (error) {
      res.status(500).json({ message: "Failed to update track" });
    }
  });

  app.delete("/api/tracks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTrack(id);
      if (!success) {
        return res.status(404).json({ message: "Track not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete track" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
