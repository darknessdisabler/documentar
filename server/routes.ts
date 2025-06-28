import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePresentation, generateDocument, improveText } from "./services/ai";
import { insertProjectSchema, insertUserSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects Routes
  app.get("/api/projects", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from authentication
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from authentication
      const projectData = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const project = await storage.updateProject(id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Generation Routes
  app.post("/api/ai/generate-presentation", async (req, res) => {
    try {
      const { topic, language = "uk", slideCount = 5 } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const content = await generatePresentation({
        type: 'presentation',
        topic,
        language,
        slideCount
      });

      res.json(content);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/generate-document", async (req, res) => {
    try {
      const { topic, language = "uk" } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const content = await generateDocument({
        type: 'document',
        topic,
        language
      });

      res.json(content);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/improve-text", async (req, res) => {
    try {
      const { text, language = "uk" } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const improvedText = await improveText(text, language);
      res.json({ improvedText });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // User Settings Routes
  app.get("/api/settings", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from authentication
      let settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        // Create default settings
        settings = await storage.createUserSettings({
          userId,
          theme: {
            primaryColor: "#2563EB",
            secondaryColor: "#7C3AED",
            accentColor: "#F59E0B",
            fontFamily: "Inter"
          },
          language: "uk",
          layout: null
        });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from authentication
      const updates = req.body;
      const settings = await storage.updateUserSettings(userId, updates);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
