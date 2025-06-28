import { promises as fs } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

export interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'minimalist';
  width?: number;
  height?: number;
  model?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  width: number;
  height: number;
  createdAt: Date;
}

export class ImageGenerationService {
  private imagesDir = join(process.cwd(), 'generated-images');
  private cache = new Map<string, GeneratedImage>();

  constructor() {
    this.ensureImagesDirectory();
  }

  private async ensureImagesDirectory() {
    try {
      await fs.access(this.imagesDir);
    } catch {
      await fs.mkdir(this.imagesDir, { recursive: true });
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    const {
      prompt,
      style = 'realistic',
      width = 1024,
      height = 768,
      model = 'stable-diffusion-xl'
    } = request;

    // Створюємо унікальний ID для зображення
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Симулюємо генерацію зображення (в реальному проекті тут буде виклик AI моделі)
    const generatedImage = await this.simulateImageGeneration(imageId, prompt, style, width, height);
    
    const image: GeneratedImage = {
      id: imageId,
      url: `/api/images/${imageId}.png`,
      prompt,
      style,
      width,
      height,
      createdAt: new Date()
    };

    this.cache.set(imageId, image);
    
    return image;
  }

  private async simulateImageGeneration(
    id: string, 
    prompt: string, 
    style: string, 
    width: number, 
    height: number
  ): Promise<void> {
    // Створюємо placeholder зображення з градієнтом та текстом
    const svg = this.generatePlaceholderSVG(prompt, style, width, height);
    
    // Конвертуємо SVG в PNG за допомогою Sharp
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();
    
    const filePath = join(this.imagesDir, `${id}.png`);
    await fs.writeFile(filePath, pngBuffer);
  }

  private generatePlaceholderSVG(prompt: string, style: string, width: number, height: number): string {
    const colors = this.getStyleColors(style);
    const textLines = this.wrapText(prompt, 30);
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)" />
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" 
              fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2" rx="10" />
        
        <!-- Іконка камери -->
        <g transform="translate(${width/2 - 30}, ${height/2 - 60})">
          <rect x="10" y="15" width="40" height="30" rx="5" fill="rgba(255,255,255,0.8)" />
          <circle cx="30" cy="30" r="8" fill="rgba(0,0,0,0.3)" />
          <circle cx="30" cy="30" r="5" fill="rgba(0,0,0,0.6)" />
          <rect x="20" y="10" width="8" height="5" rx="2" fill="rgba(255,255,255,0.8)" />
        </g>
        
        <!-- Текст промпту -->
        <text x="${width/2}" y="${height/2 + 40}" text-anchor="middle" fill="white" 
              font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${textLines[0] || 'AI Generated Image'}
        </text>
        ${textLines.slice(1, 3).map((line, index) => `
          <text x="${width/2}" y="${height/2 + 60 + (index * 20)}" text-anchor="middle" fill="rgba(255,255,255,0.8)" 
                font-family="Arial, sans-serif" font-size="14">
            ${line}
          </text>
        `).join('')}
        
        <!-- Стиль бейдж -->
        <rect x="20" y="${height - 50}" width="80" height="25" rx="12" fill="rgba(0,0,0,0.6)" />
        <text x="60" y="${height - 32}" text-anchor="middle" fill="white" 
              font-family="Arial, sans-serif" font-size="12" font-weight="bold">
          ${style.toUpperCase()}
        </text>
      </svg>
    `;
  }

  private getStyleColors(style: string): { primary: string; secondary: string } {
    switch (style) {
      case 'realistic':
        return { primary: '#4A90E2', secondary: '#7B68EE' };
      case 'artistic':
        return { primary: '#FF6B6B', secondary: '#4ECDC4' };
      case 'cartoon':
        return { primary: '#FFE66D', secondary: '#FF6B6B' };
      case 'minimalist':
        return { primary: '#2C3E50', secondary: '#95A5A6' };
      default:
        return { primary: '#667EEA', secondary: '#764BA2' };
    }
  }

  private wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  async getImage(imageId: string): Promise<Buffer> {
    const filePath = join(this.imagesDir, `${imageId}.png`);
    return await fs.readFile(filePath);
  }

  async getImageInfo(imageId: string): Promise<GeneratedImage | null> {
    return this.cache.get(imageId) || null;
  }

  async getAllImages(): Promise<GeneratedImage[]> {
    return Array.from(this.cache.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const filePath = join(this.imagesDir, `${imageId}.png`);
      await fs.unlink(filePath);
      this.cache.delete(imageId);
      return true;
    } catch {
      return false;
    }
  }

  async enhanceImage(imageId: string, enhancements: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
  }): Promise<string> {
    const originalPath = join(this.imagesDir, `${imageId}.png`);
    const enhancedId = `${imageId}_enhanced_${Date.now()}`;
    const enhancedPath = join(this.imagesDir, `${enhancedId}.png`);

    let sharpInstance = sharp(originalPath);

    if (enhancements.brightness !== undefined) {
      sharpInstance = sharpInstance.modulate({ brightness: enhancements.brightness });
    }

    if (enhancements.saturation !== undefined) {
      sharpInstance = sharpInstance.modulate({ saturation: enhancements.saturation });
    }

    if (enhancements.blur !== undefined && enhancements.blur > 0) {
      sharpInstance = sharpInstance.blur(enhancements.blur);
    }

    await sharpInstance.png().toFile(enhancedPath);

    // Додаємо покращене зображення до кешу
    const originalInfo = this.cache.get(imageId);
    if (originalInfo) {
      this.cache.set(enhancedId, {
        ...originalInfo,
        id: enhancedId,
        url: `/api/images/${enhancedId}.png`,
        createdAt: new Date()
      });
    }

    return enhancedId;
  }

  async resizeImage(imageId: string, width: number, height: number): Promise<string> {
    const originalPath = join(this.imagesDir, `${imageId}.png`);
    const resizedId = `${imageId}_${width}x${height}`;
    const resizedPath = join(this.imagesDir, `${resizedId}.png`);

    await sharp(originalPath)
      .resize(width, height, { fit: 'cover' })
      .png()
      .toFile(resizedPath);

    // Додаємо змінене зображення до кешу
    const originalInfo = this.cache.get(imageId);
    if (originalInfo) {
      this.cache.set(resizedId, {
        ...originalInfo,
        id: resizedId,
        url: `/api/images/${resizedId}.png`,
        width,
        height,
        createdAt: new Date()
      });
    }

    return resizedId;
  }

  async cleanupOldImages(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const now = Date.now();
    const expiredImages = Array.from(this.cache.values()).filter(
      img => now - img.createdAt.getTime() > maxAge
    );

    for (const img of expiredImages) {
      await this.deleteImage(img.id);
    }
  }
}

export const imageGenerationService = new ImageGenerationService();