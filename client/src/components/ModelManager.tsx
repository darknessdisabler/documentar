import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Download, Trash2, CheckCircle, Clock, Search, Filter, Brain, Image, Layers } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AIModel {
  id: string;
  name: string;
  type: 'base' | 'lora';
  category: 'language' | 'image' | 'multimodal';
  size: string;
  downloaded: boolean;
  downloading: boolean;
  progress: number;
  description?: string;
  requirements?: string[];
  capabilities?: string[];
}

export default function ModelManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: models = [], isLoading } = useQuery({
    queryKey: ['/api/models'],
    queryFn: async () => {
      const response = await fetch('/api/models');
      return response.json();
    }
  });

  const downloadMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`/api/models/${modelId}/download`, { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/models'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`/api/models/${modelId}`, { method: 'DELETE' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/models'] });
    }
  });

  const filteredModels = models.filter((model: AIModel) => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || model.category === categoryFilter;
    const matchesType = typeFilter === 'all' || model.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const modelsByCategory = {
    language: filteredModels.filter((m: AIModel) => m.category === 'language'),
    image: filteredModels.filter((m: AIModel) => m.category === 'image'),
    multimodal: filteredModels.filter((m: AIModel) => m.category === 'multimodal')
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'language': return <Brain className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'multimodal': return <Layers className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'language': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'multimodal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ModelCard = ({ model }: { model: AIModel }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{model.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getCategoryColor(model.category)}>
                {getCategoryIcon(model.category)}
                <span className="ml-1 capitalize">{model.category}</span>
              </Badge>
              <Badge variant={model.type === 'base' ? 'default' : 'secondary'}>
                {model.type === 'base' ? 'Базова' : 'LoRA'}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{model.size}</div>
            {model.downloaded && (
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
            )}
            {model.downloading && (
              <Clock className="w-5 h-5 text-blue-500 mt-1 animate-pulse" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {model.description && (
          <p className="text-sm text-muted-foreground">{model.description}</p>
        )}
        
        {model.capabilities && model.capabilities.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Можливості:</div>
            <div className="flex flex-wrap gap-1">
              {model.capabilities.map((capability) => (
                <Badge key={capability} variant="outline" className="text-xs">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {model.requirements && model.requirements.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Вимагає:</div>
            <div className="flex flex-wrap gap-1">
              {model.requirements.map((req) => (
                <Badge key={req} variant="outline" className="text-xs border-orange-200 text-orange-800">
                  {models.find((m: AIModel) => m.id === req)?.name || req}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {model.downloading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Завантажуємо...</span>
              <span>{model.progress}%</span>
            </div>
            <Progress value={model.progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2">
          {!model.downloaded && !model.downloading && (
            <Button 
              onClick={() => downloadMutation.mutate(model.id)}
              disabled={downloadMutation.isPending}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Завантажити
            </Button>
          )}
          
          {model.downloaded && (
            <Button 
              variant="outline"
              onClick={() => deleteMutation.mutate(model.id)}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Видалити
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const CategorySection = ({ title, models, category }: { 
    title: string; 
    models: AIModel[]; 
    category: string;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {getCategoryIcon(category)}
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="outline">{models.length}</Badge>
      </div>
      
      {models.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Немає моделей цієї категорії</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p>Завантаження моделей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Менеджер AI моделей</h2>
          <p className="text-muted-foreground">
            Керуйте мовними та генеративними моделями для створення контенту
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {models.filter((m: AIModel) => m.downloaded).length} завантажено
          </Badge>
          <Badge variant="outline">
            {models.filter((m: AIModel) => m.downloading).length} завантажується
          </Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Пошук моделей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Категорія" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі категорії</SelectItem>
            <SelectItem value="language">Мовні моделі</SelectItem>
            <SelectItem value="image">Генерація зображень</SelectItem>
            <SelectItem value="multimodal">Мультимодальні</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі типи</SelectItem>
            <SelectItem value="base">Базові</SelectItem>
            <SelectItem value="lora">LoRA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Всі моделі</TabsTrigger>
          <TabsTrigger value="language">Мовні</TabsTrigger>
          <TabsTrigger value="image">Зображення</TabsTrigger>
          <TabsTrigger value="multimodal">Мультимодальні</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          <CategorySection 
            title="Мовні моделі" 
            models={modelsByCategory.language} 
            category="language"
          />
          <Separator />
          <CategorySection 
            title="Генерація зображень" 
            models={modelsByCategory.image} 
            category="image"
          />
          <Separator />
          <CategorySection 
            title="Мультимодальні моделі" 
            models={modelsByCategory.multimodal} 
            category="multimodal"
          />
        </TabsContent>

        <TabsContent value="language">
          <CategorySection 
            title="Мовні моделі" 
            models={modelsByCategory.language} 
            category="language"
          />
        </TabsContent>

        <TabsContent value="image">
          <CategorySection 
            title="Генерація зображень" 
            models={modelsByCategory.image} 
            category="image"
          />
        </TabsContent>

        <TabsContent value="multimodal">
          <CategorySection 
            title="Мультимодальні моделі" 
            models={modelsByCategory.multimodal} 
            category="multimodal"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}