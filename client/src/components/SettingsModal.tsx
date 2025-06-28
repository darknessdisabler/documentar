import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Settings as SettingsIcon, Folder, Brain } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, updateTheme, language, updateLanguage } = useTheme();
  const [localTheme, setLocalTheme] = useState(theme || {
    primaryColor: '#2563EB',
    secondaryColor: '#1D4ED8',
    accentColor: '#1E40AF',
    fontFamily: 'Inter'
  });
  const [projectsPath, setProjectsPath] = useState('/DocumentA/Projects');
  const [aiModel, setAiModel] = useState('gpt-4o-mini');
  const [loraModel, setLoraModel] = useState('none');

  const handleSaveTheme = () => {
    if (localTheme) {
      updateTheme(localTheme);
    }
  };

  const presetThemes = [
    { 
      name: 'Ocean Blue', 
      primaryColor: '#0EA5E9', 
      secondaryColor: '#0284C7', 
      accentColor: '#0369A1',
      fontFamily: 'Inter' 
    },
    { 
      name: 'Sunset Orange', 
      primaryColor: '#EA580C', 
      secondaryColor: '#DC2626', 
      accentColor: '#B91C1C',
      fontFamily: 'Inter' 
    },
    { 
      name: 'Forest Green', 
      primaryColor: '#059669', 
      secondaryColor: '#047857', 
      accentColor: '#065F46',
      fontFamily: 'Inter' 
    },
    { 
      name: 'Royal Purple', 
      primaryColor: '#7C3AED', 
      secondaryColor: '#6D28D9', 
      accentColor: '#5B21B6',
      fontFamily: 'Inter' 
    },
    { 
      name: 'Rose Gold', 
      primaryColor: '#EC4899', 
      secondaryColor: '#DB2777', 
      accentColor: '#BE185D',
      fontFamily: 'Inter' 
    },
    { 
      name: 'Midnight', 
      primaryColor: '#1F2937', 
      secondaryColor: '#374151', 
      accentColor: '#4B5563',
      fontFamily: 'Inter' 
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            {t('settings', language)}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              {t('theme', language)}
            </TabsTrigger>
            <TabsTrigger value="folders" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              {t('folders', language)}
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Моделі
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Загальні
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme Presets */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Готові теми</h3>
                <div className="grid grid-cols-2 gap-3">
                  {presetThemes.map((preset) => (
                    <Button
                      key={preset.name}
                      onClick={() => setLocalTheme(preset)}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center space-y-2"
                    >
                      <div className="flex space-x-1">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: preset.secondaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: preset.accentColor }}
                        />
                      </div>
                      <span className="text-sm font-medium">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Theme Editor */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Налаштування кольорів</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="primary">Основний колір</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="primary"
                        type="color"
                        value={localTheme.primaryColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, primaryColor: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={localTheme.primaryColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, primaryColor: e.target.value })}
                        className="flex-1"
                        placeholder="#2563EB"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary">Додатковий колір</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="secondary"
                        type="color"
                        value={localTheme.secondaryColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, secondaryColor: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={localTheme.secondaryColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, secondaryColor: e.target.value })}
                        className="flex-1"
                        placeholder="#1D4ED8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent">Акцентний колір</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="accent"
                        type="color"
                        value={localTheme.accentColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, accentColor: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={localTheme.accentColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, accentColor: e.target.value })}
                        className="flex-1"
                        placeholder="#1E40AF"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="font">Шрифт</Label>
                    <Select 
                      value={localTheme.fontFamily} 
                      onValueChange={(value) => setLocalTheme({ ...localTheme, fontFamily: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Nunito">Nunito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveTheme} className="w-full">
                  Застосувати тему
                </Button>
              </div>
            </div>

            {/* Theme Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-3">Попередній перегляд</h4>
              <div 
                className="p-4 rounded-lg text-white"
                style={{ backgroundColor: localTheme.primaryColor }}
              >
                <h5 style={{ fontFamily: localTheme.fontFamily }}>Заголовок презентації</h5>
                <p className="text-sm opacity-90" style={{ fontFamily: localTheme.fontFamily }}>
                  Це приклад тексту з обраною темою
                </p>
                <div className="flex gap-2 mt-2">
                  <div 
                    className="px-3 py-1 rounded text-xs"
                    style={{ backgroundColor: localTheme.secondaryColor }}
                  >
                    Кнопка
                  </div>
                  <div 
                    className="px-3 py-1 rounded text-xs"
                    style={{ backgroundColor: localTheme.accentColor }}
                  >
                    Акцент
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="folders" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Управління папками</h3>
              
              <div>
                <Label htmlFor="projects-path">Папка проектів</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="projects-path"
                    value={projectsPath}
                    onChange={(e) => setProjectsPath(e.target.value)}
                    className="flex-1"
                    placeholder="/DocumentA/Projects"
                  />
                  <Button variant="outline">Обрати</Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Тут зберігаються всі ваші презентації та документи
                </p>
              </div>

              <div>
                <Label>Експорт та імпорт</Label>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" className="flex-1">
                    Експортувати налаштування
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Імпортувати налаштування
                  </Button>
                </div>
              </div>

              <div>
                <Label>Резервні копії</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Автоматичні резервні копії</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Частота створення копій (години)</span>
                    <div className="w-32">
                      <Slider defaultValue={[24]} max={168} min={1} step={1} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Налаштування ШІ</h3>
              
              <div>
                <Label htmlFor="ai-model">Основна модель</Label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (Рекомендовано)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o (Максимальна якість)</SelectItem>
                    <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="llama-3.1-70b">Llama 3.1 70B (Локально)</SelectItem>
                    <SelectItem value="mistral-large">Mistral Large</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  Обрана модель буде використовуватися для генерації контенту
                </p>
              </div>

              <div>
                <Label htmlFor="lora-model">LoRA адаптер</Label>
                <Select value={loraModel} onValueChange={setLoraModel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без адаптера</SelectItem>
                    <SelectItem value="business-presentations">Бізнес презентації</SelectItem>
                    <SelectItem value="academic-papers">Наукові роботи</SelectItem>
                    <SelectItem value="creative-writing">Креативне письмо</SelectItem>
                    <SelectItem value="technical-docs">Технічна документація</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  LoRA адаптери покращують якість для специфічних завдань
                </p>
              </div>

              <div>
                <Label>Параметри генерації</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Температура (креативність)</span>
                    <div className="w-32">
                      <Slider defaultValue={[0.7]} max={1} min={0} step={0.1} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Максимальна довжина відповіді</span>
                    <div className="w-32">
                      <Slider defaultValue={[2048]} max={4096} min={512} step={256} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Локальні моделі</Label>
                <div className="space-y-2 mt-2">
                  <Button variant="outline" className="w-full">
                    Завантажити нову модель
                  </Button>
                  <Button variant="outline" className="w-full">
                    Управління моделями
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Загальні налаштування</h3>
              
              <div>
                <Label>Мова інтерфейсу</Label>
                <Select value={language} onValueChange={(value: 'uk' | 'en') => updateLanguage(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uk">Українська</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Автозбереження</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Показувати анімації</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Звукові ефекти</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Темна тема системи</span>
                  <Switch />
                </div>
              </div>

              <div>
                <Label>Продуктивність</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Якість анімацій</span>
                    <Select defaultValue="high">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Низька</SelectItem>
                        <SelectItem value="medium">Середня</SelectItem>
                        <SelectItem value="high">Висока</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t('cancel', language)}
          </Button>
          <Button onClick={onClose}>
            {t('save', language)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}