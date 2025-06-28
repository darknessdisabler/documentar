import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePresentation, generateDocument, improveText } from "./services/ai";
import { modelManager, type ModelDownloadProgress } from "./services/models";
import { exportService } from "./services/export";
import { imageGenerationService } from "./services/imageGeneration";
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

  // AI Models Routes
  app.get("/api/models", async (req, res) => {
    try {
      const models = await modelManager.getAllModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/models/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await modelManager.downloadModel(id);
      if (success) {
        res.json({ message: "Model download started" });
      } else {
        res.status(404).json({ message: "Model not found" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/models/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await modelManager.deleteModel(id);
      if (success) {
        res.json({ message: "Model deleted successfully" });
      } else {
        res.status(404).json({ message: "Model not found" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/models/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const model = await modelManager.getModel(id);
      
      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }

      if (model.downloaded) {
        return res.json({ message: "Model already downloaded" });
      }

      if (model.downloading) {
        return res.status(409).json({ message: "Model is already downloading" });
      }

      // Start download in background
      modelManager.downloadModel(id).catch(error => {
        console.error(`Failed to download model ${id}:`, error);
      });

      res.json({ message: "Download started" });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/models/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await modelManager.deleteModel(id);
      
      if (success) {
        res.json({ message: "Model deleted successfully" });
      } else {
        res.status(404).json({ message: "Model not found or not downloaded" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/models/first-run", async (req, res) => {
    try {
      const isFirstRun = await modelManager.checkFirstRun();
      res.json({ isFirstRun });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/models/download-essential", async (req, res) => {
    try {
      // Start essential models download in background
      modelManager.downloadEssentialModels().catch(error => {
        console.error("Failed to download essential models:", error);
      });

      res.json({ message: "Essential models download started" });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Export Routes
  app.post("/api/export/:format", async (req, res) => {
    try {
      const { format } = req.params;
      const { title, modules, theme } = req.body;
      
      const options = {
        title: title || 'DocumentA® Export',
        modules: modules || [],
        theme: theme || {
          primaryColor: '#2563EB',
          secondaryColor: '#7C3AED',
          accentColor: '#F59E0B',
          fontFamily: 'Inter'
        },
        format: format as 'pptx' | 'docx' | 'xlsx'
      };

      let fileName;
      switch (format) {
        case 'pptx':
          fileName = await exportService.exportPresentation(options);
          break;
        case 'docx':
          fileName = await exportService.exportDocument(options);
          break;
        case 'xlsx':
          fileName = await exportService.exportSpreadsheet(options);
          break;
        default:
          return res.status(400).json({ message: 'Unsupported format' });
      }

      res.json({ fileName, downloadUrl: `/api/export/download/${fileName}` });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/export/download/:fileName", async (req, res) => {
    try {
      const { fileName } = req.params;
      const fileBuffer = await exportService.getExportedFile(fileName);
      
      const extension = fileName.split('.').pop();
      let contentType = 'application/octet-stream';
      
      switch (extension) {
        case 'pptx':
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'xlsx':
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(fileBuffer);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Image Generation Routes
  app.post("/api/images/generate", async (req, res) => {
    try {
      const { prompt, style, width, height, model } = req.body;
      const image = await imageGenerationService.generateImage({
        prompt: prompt || 'Beautiful landscape',
        style: style || 'realistic',
        width: width || 1024,
        height: height || 768,
        model: model || 'stable-diffusion-xl'
      });
      res.json(image);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/images", async (req, res) => {
    try {
      const images = await imageGenerationService.getAllImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/images/:imageId", async (req, res) => {
    try {
      const { imageId } = req.params;
      const imageBuffer = await imageGenerationService.getImage(imageId);
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(imageBuffer);
    } catch (error) {
      res.status(404).json({ message: 'Image not found' });
    }
  });

  app.delete("/api/images/:imageId", async (req, res) => {
    try {
      const { imageId } = req.params;
      const success = await imageGenerationService.deleteImage(imageId);
      if (success) {
        res.json({ message: "Image deleted successfully" });
      } else {
        res.status(404).json({ message: "Image not found" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/images/:imageId/enhance", async (req, res) => {
    try {
      const { imageId } = req.params;
      const { brightness, contrast, saturation, blur } = req.body;
      const enhancedId = await imageGenerationService.enhanceImage(imageId, {
        brightness,
        contrast,
        saturation,
        blur
      });
      const enhancedImage = await imageGenerationService.getImageInfo(enhancedId);
      res.json(enhancedImage);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/images/:imageId/resize", async (req, res) => {
    try {
      const { imageId } = req.params;
      const { width, height } = req.body;
      const resizedId = await imageGenerationService.resizeImage(imageId, width, height);
      const resizedImage = await imageGenerationService.getImageInfo(resizedId);
      res.json(resizedImage);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
