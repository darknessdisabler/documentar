import { promises as fs } from 'fs';
import { join } from 'path';

export interface AIModel {
  id: string;
  name: string;
  type: 'base' | 'lora';
  category: 'language' | 'image' | 'multimodal';
  size: string;
  downloaded: boolean;
  downloading: boolean;
  progress: number;
  url?: string;
  path?: string;
  description?: string;
  requirements?: string[];
  capabilities?: string[];
}

export interface ModelDownloadProgress {
  modelId: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error';
  error?: string;
}

class ModelManager {
  private models: Map<string, AIModel> = new Map();
  private modelsDir = join(process.cwd(), 'ai-models');
  private downloadCallbacks: Map<string, (progress: ModelDownloadProgress) => void> = new Map();

  constructor() {
    this.initializeDefaultModels();
    this.ensureModelsDirectory();
  }

  private initializeDefaultModels() {
    const defaultModels: AIModel[] = [
      // Language Models
      {
        id: 'llama3-8b',
        name: 'Llama 3 8B',
        type: 'base',
        category: 'language',
        size: '4.7GB',
        downloaded: false,
        downloading: false,
        progress: 0,
        url: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct/resolve/main/model.safetensors',
        description: 'Потужна мовна модель для генерації тексту та презентацій',
        capabilities: ['text-generation', 'presentation', 'document', 'ukrainian', 'english']
      },
      {
        id: 'phi3-mini',
        name: 'Phi-3 Mini',
        type: 'base',
        category: 'language',
        size: '2.4GB',
        downloaded: false,
        downloading: false,
        progress: 0,
        url: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct',
        description: 'Компактна і швидка модель від Microsoft',
        capabilities: ['code-generation', 'instruction-following', 'reasoning']
      },
      {
        id: 'gemma-2b',
        name: 'Gemma 2B',
        type: 'base',
        category: 'language',
        size: '1.4GB',
        downloaded: false,
        downloading: false,
        progress: 0,
        url: 'https://huggingface.co/google/gemma-2b',
        description: 'Легка модель від Google для швидкої роботи',
        capabilities: ['text-generation', 'creative-writing', 'summarization']
      },
      // Image Generation Models
      {
        id: 'stable-diffusion-xl',
        name: 'Stable Diffusion XL',
        type: 'base',
        category: 'image',
        size: '6.9GB',
        downloaded: false,
        downloading: false,
        progress: 0,
        url: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0',
        description: 'Найкраща модель для генерації високоякісних зображень',
        capabilities: ['image-generation', 'artistic-style', 'photorealistic', 'illustrations']
      },
      {
        id: 'dall-e-mini',
        name: 'DALL-E Mini',
        type: 'base',
        category: 'image',
        size: '2.1GB',
        downloaded: false,
        downloading: false,
        progress: 0,
        url: 'https://huggingface.co/dalle-mini/dalle-mini',
        description: 'Компактна модель для швидкої генерації зображень',
        capabilities: ['image-generation', 'simple-illustrations', 'icons']
      },
      // Multimodal Models
      {
        id: 'llava-13b',
        name: 'LLaVA 13B',
        type: 'base',
        category: 'multimodal',
        size: '7.8GB',
        downloaded: false,
        downloading: false,
        progress: 0,
        url: 'https://huggingface.co/liuhaotian/llava-v1.5-13b',
        description: 'Мультимодальна модель для роботи з текстом та зображеннями',
        capabilities: ['vision-language', 'image-analysis', 'visual-qa', 'content-description']
      },
      // LoRA Models
      {
        id: 'ukrainian-lora',
        name: 'Ukrainian Language LoRA',
        type: 'lora',
        category: 'language',
        size: '150MB',
        downloaded: false,
        downloading: false,
        progress: 0,
        url: 'https://huggingface.co/ukrainian-community/ukrainian-lora',
        description: 'Адаптер для покращення роботи з українською мовою',
        requirements: ['llama3-8b'],
        capabilities: ['ukrainian-enhancement', 'local-context']
      },
      {
        id: 'presentation-lora',
        name: 'Presentation Style LoRA',
        type: 'lora',
        category: 'language',
        size: '200MB',
        downloaded: false,
        downloading: false,
        progress: 0,
        url: 'https://example.com/presentation-lora.bin',
        description: 'Спеціалізований адаптер для створення презентацій',
        requirements: ['llama3-8b'],
        capabilities: ['presentation-structure', 'business-style']
      },
      {
        id: 'artistic-lora',
        name: 'Artistic Style LoRA',
        type: 'lora',
        category: 'image',
        size: '80MB',
        downloaded: false,
        downloading: false,
        progress: 0,
        url: 'https://example.com/artistic-lora.bin',
        description: 'Художній стиль для генерації зображень',
        requirements: ['stable-diffusion-xl'],
        capabilities: ['artistic-enhancement', 'style-transfer']
      }
    ];

    defaultModels.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  private async ensureModelsDirectory() {
    try {
      await fs.access(this.modelsDir);
    } catch {
      await fs.mkdir(this.modelsDir, { recursive: true });
    }
  }

  async getAllModels(): Promise<AIModel[]> {
    // Check which models are actually downloaded
    const modelEntries = Array.from(this.models.entries());
    for (const [id, model] of modelEntries) {
      const modelPath = join(this.modelsDir, id);
      try {
        await fs.access(modelPath);
        model.downloaded = true;
        model.path = modelPath;
      } catch {
        model.downloaded = false;
      }
    }
    
    return Array.from(this.models.values());
  }

  async getModel(id: string): Promise<AIModel | undefined> {
    return this.models.get(id);
  }

  async downloadModel(id: string, onProgress?: (progress: ModelDownloadProgress) => void): Promise<boolean> {
    const model = this.models.get(id);
    if (!model) {
      throw new Error(`Model ${id} not found`);
    }

    if (model.downloaded) {
      return true;
    }

    if (model.downloading) {
      return false;
    }

    model.downloading = true;
    model.progress = 0;

    if (onProgress) {
      this.downloadCallbacks.set(id, onProgress);
    }

    try {
      // Simulate download process for offline version
      await this.simulateDownload(model, onProgress);
      
      model.downloaded = true;
      model.downloading = false;
      model.progress = 100;
      model.path = join(this.modelsDir, id);

      if (onProgress) {
        onProgress({
          modelId: id,
          progress: 100,
          status: 'completed'
        });
      }

      return true;
    } catch (error) {
      model.downloading = false;
      model.progress = 0;

      if (onProgress) {
        onProgress({
          modelId: id,
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      throw error;
    }
  }

  private async simulateDownload(model: AIModel, onProgress?: (progress: ModelDownloadProgress) => void): Promise<void> {
    // Simulate realistic download progress
    const steps = 20;
    const stepDelay = 100; // 100ms per step = 2 seconds total

    for (let i = 0; i <= steps; i++) {
      const progress = Math.round((i / steps) * 100);
      model.progress = progress;

      if (onProgress) {
        onProgress({
          modelId: model.id,
          progress,
          status: 'downloading'
        });
      }

      await new Promise(resolve => setTimeout(resolve, stepDelay));
    }

    // Create model directory and placeholder files
    const modelPath = join(this.modelsDir, model.id);
    await fs.mkdir(modelPath, { recursive: true });
    
    // Create placeholder model files
    await fs.writeFile(
      join(modelPath, 'model.json'),
      JSON.stringify({
        name: model.name,
        type: model.type,
        size: model.size,
        downloaded_at: new Date().toISOString(),
        version: '1.0.0'
      }, null, 2)
    );

    await fs.writeFile(
      join(modelPath, 'tokenizer.json'),
      JSON.stringify({
        vocab_size: 50000,
        model_type: model.type === 'lora' ? 'lora' : 'transformer'
      }, null, 2)
    );
  }

  async deleteModel(id: string): Promise<boolean> {
    const model = this.models.get(id);
    if (!model || !model.downloaded) {
      return false;
    }

    try {
      const modelPath = join(this.modelsDir, id);
      await fs.rm(modelPath, { recursive: true, force: true });
      
      model.downloaded = false;
      model.path = undefined;
      model.progress = 0;

      return true;
    } catch {
      return false;
    }
  }

  async checkFirstRun(): Promise<boolean> {
    const models = await this.getAllModels();
    return !models.some(model => model.downloaded);
  }

  async downloadEssentialModels(onProgress?: (progress: ModelDownloadProgress) => void): Promise<void> {
    // Download the smallest essential model first
    const essentialModels = ['phi3-mini', 'ukrainian-lora'];
    
    for (const modelId of essentialModels) {
      try {
        await this.downloadModel(modelId, onProgress);
      } catch (error) {
        console.error(`Failed to download essential model ${modelId}:`, error);
      }
    }
  }
}

export const modelManager = new ModelManager();