import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, Wand2, Download, Trash2, Edit, Eye, Sparkles, Palette, Resize, Clock } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  width: number;
  height: number;
  createdAt: string;
}

interface ImageGeneratorProps {
  onImageSelect?: (imageUrl: string) => void;
}

export default function ImageGenerator({ onImageSelect }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(768);
  const [selectedModel, setSelectedModel] = useState('stable-diffusion-xl');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [enhancementSettings, setEnhancementSettings] = useState({
    brightness: 1,
    contrast: 1,
    saturation: 1,
    blur: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['/api/images'],
    queryFn: async () => {
      const response = await fetch('/api/images');
      return response.json();
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (params: {
      prompt: string;
      style: string;
      width: number;
      height: number;
      model: string;
    }) => {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      toast({
        title: "Зображення згенеровано",
        description: "Нове зображення успішно створено",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Помилка генерації",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const response = await fetch(`/api/images/${imageId}`, { method: 'DELETE' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      toast({
        title: "Зображення видалено",
        description: "Зображення успішно видалено",
      });
    }
  });

  const enhanceMutation = useMutation({
    mutationFn: async ({ imageId, enhancements }: {
      imageId: string;
      enhancements: typeof enhancementSettings;
    }) => {
      const response = await fetch(`/api/images/${imageId}/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enhancements)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      toast({
        title: "Зображення покращено",
        description: "Ефекти успішно застосовано",
      });
    }
  });

  const resizeMutation = useMutation({
    mutationFn: async ({ imageId, width, height }: {
      imageId: string;
      width: number;
      height: number;
    }) => {
      const response = await fetch(`/api/images/${imageId}/resize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ width, height })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      toast({
        title: "Розмір змінено",
        description: "Зображення успішно змінено",
      });
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Введіть опис",
        description: "Будь ласка, введіть опис зображення",
        variant: "destructive"
      });
      return;
    }

    generateMutation.mutate({
      prompt: prompt.trim(),
      style,
      width,
      height,
      model: selectedModel
    });
  };

  const handleEnhance = (image: GeneratedImage) => {
    enhanceMutation.mutate({
      imageId: image.id,
      enhancements: enhancementSettings
    });
  };

  const handleResize = (image: GeneratedImage, newWidth: number, newHeight: number) => {
    resizeMutation.mutate({
      imageId: image.id,
      width: newWidth,
      height: newHeight
    });
  };

  const presetPrompts = [
    "Сучасний офісний інтер'єр з великими вікнами",
    "Абстрактна геометрична композиція в синіх тонах",
    "Мінімалістичний пейзаж з горами",
    "Технологічна інфографіка з діаграмами",
    "Креативна ілюстрація для презентації",
    "Бізнес-команда в сучасному офісі"
  ];

  const styleOptions = [
    { value: 'realistic', label: 'Реалістичний', description: 'Фотореалістичні зображення' },
    { value: 'artistic', label: 'Художній', description: 'Художні та креативні стилі' },
    { value: 'cartoon', label: 'Мультяшний', description: 'Мультяшний та ілюстративний стиль' },
    { value: 'minimalist', label: 'Мінімалістичний', description: 'Чисті та прості форми' }
  ];

  const sizePresets = [
    { label: 'Презентація (16:9)', width: 1920, height: 1080 },
    { label: 'Квадрат', width: 1024, height: 1024 },
    { label: 'Портрет', width: 768, height: 1024 },
    { label: 'Широкий', width: 1536, height: 768 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wand2 className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold">Генератор зображень</h3>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Генерація</TabsTrigger>
          <TabsTrigger value="gallery">Галерея</TabsTrigger>
          <TabsTrigger value="enhance">Редагування</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Створити нове зображення</CardTitle>
              <CardDescription>
                Опишіть зображення, яке хочете створити за допомогою AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Опис зображення</Label>
                  <Input
                    id="prompt"
                    placeholder="Опишіть, яке зображення ви хочете створити..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Готові шаблони</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {presetPrompts.map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt(preset)}
                        className="text-left h-auto p-2 whitespace-normal"
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Стиль</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>AI Модель</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable-diffusion-xl">Stable Diffusion XL</SelectItem>
                        <SelectItem value="dall-e-mini">DALL-E Mini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Розмір зображення</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {sizePresets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={width === preset.width && height === preset.height ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setWidth(preset.width);
                          setHeight(preset.height);
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Ширина: {width}px</Label>
                      <Slider
                        value={[width]}
                        onValueChange={(value) => setWidth(value[0])}
                        min={256}
                        max={2048}
                        step={64}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Висота: {height}px</Label>
                      <Slider
                        value={[height]}
                        onValueChange={(value) => setHeight(value[0])}
                        min={256}
                        max={2048}
                        step={64}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-pulse" />
                      Генерується...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Згенерувати зображення
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Галерея зображень</CardTitle>
              <CardDescription>
                Всі згенеровані зображення ({images.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 animate-pulse mx-auto mb-2" />
                  <p>Завантаження галереї...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Поки що немає згенерованих зображень</p>
                  <p className="text-sm text-muted-foreground">Створіть своє перше зображення на вкладці "Генерація"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image: GeneratedImage) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary">{image.style}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm font-medium line-clamp-2 mb-2">
                          {image.prompt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>{image.width} × {image.height}</span>
                          <span>{new Date(image.createdAt).toLocaleDateString('uk-UA')}</span>
                        </div>
                        <div className="flex gap-2">
                          {onImageSelect && (
                            <Button
                              size="sm"
                              onClick={() => onImageSelect(image.url)}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Вибрати
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedImage(image)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(image.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Редагування зображень</CardTitle>
              <CardDescription>
                Покращуйте та змінюйте згенеровані зображення
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedImage ? (
                <div className="text-center py-8">
                  <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Оберіть зображення для редагування</p>
                  <p className="text-sm text-muted-foreground">Перейдіть до галереї та натисніть кнопку редагування</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.prompt}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <div>
                      <p className="font-medium">{selectedImage.prompt}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedImage.width} × {selectedImage.height} • {selectedImage.style}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Колірні ефекти</h4>
                      
                      <div>
                        <Label>Яскравість: {enhancementSettings.brightness}</Label>
                        <Slider
                          value={[enhancementSettings.brightness]}
                          onValueChange={(value) => 
                            setEnhancementSettings(prev => ({ ...prev, brightness: value[0] }))
                          }
                          min={0.5}
                          max={1.5}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Насиченість: {enhancementSettings.saturation}</Label>
                        <Slider
                          value={[enhancementSettings.saturation]}
                          onValueChange={(value) => 
                            setEnhancementSettings(prev => ({ ...prev, saturation: value[0] }))
                          }
                          min={0.5}
                          max={1.5}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Розмиття: {enhancementSettings.blur}</Label>
                        <Slider
                          value={[enhancementSettings.blur]}
                          onValueChange={(value) => 
                            setEnhancementSettings(prev => ({ ...prev, blur: value[0] }))
                          }
                          min={0}
                          max={5}
                          step={0.5}
                          className="mt-2"
                        />
                      </div>

                      <Button
                        onClick={() => handleEnhance(selectedImage)}
                        disabled={enhanceMutation.isPending}
                        className="w-full"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Застосувати ефекти
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Зміна розміру</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {sizePresets.map((preset) => (
                          <Button
                            key={preset.label}
                            variant="outline"
                            size="sm"
                            onClick={() => handleResize(selectedImage, preset.width, preset.height)}
                            disabled={resizeMutation.isPending}
                          >
                            <Resize className="w-4 h-4 mr-2" />
                            {preset.label}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setSelectedImage(null)}
                        className="w-full"
                      >
                        Закрити редактор
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}