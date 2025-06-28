import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Palette, Download, Upload, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

const colorPresets: ColorPreset[] = [
  { name: 'Класична синя', primary: '#2563EB', secondary: '#7C3AED', accent: '#F59E0B' },
  { name: 'Зелена природа', primary: '#059669', secondary: '#0D9488', accent: '#F97316' },
  { name: 'Рожевий захід', primary: '#E11D48', secondary: '#C2410C', accent: '#7C2D12' },
  { name: 'Фіолетова магія', primary: '#7C3AED', secondary: '#C026D3', accent: '#0EA5E9' },
  { name: 'Помаранчевий вогонь', primary: '#EA580C', secondary: '#DC2626', accent: '#65A30D' },
  { name: 'Морський бриз', primary: '#0EA5E9', secondary: '#06B6D4', accent: '#84CC16' }
];

const fontFamilies = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro' },
  { name: 'Nunito', value: 'Nunito' }
];

const gradientPresets = [
  { name: 'Веселка', class: 'gradient-rainbow' },
  { name: 'Захід', class: 'gradient-sunset' },
  { name: 'Океан', class: 'gradient-ocean' },
  { name: 'Ліс', class: 'gradient-forest' },
  { name: 'Вогонь', class: 'gradient-fire' },
  { name: 'Космос', class: 'gradient-space' },
  { name: 'Кастомний', class: 'gradient-custom' },
  { name: 'Вимкнений', class: 'static-background' }
];

export default function ThemeEditor() {
  const { theme, updateTheme } = useTheme();
  const defaultTheme = {
    primaryColor: '#2563EB',
    secondaryColor: '#7C3AED',
    accentColor: '#F59E0B',
    fontFamily: 'Inter'
  };
  
  const [currentTheme, setCurrentTheme] = useState(theme || defaultTheme);
  const [animatedBackground, setAnimatedBackground] = useState(true);
  const [selectedGradient, setSelectedGradient] = useState('gradient-rainbow');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
    }
  }, [theme]);

  // Завантаження налаштувань фону
  useEffect(() => {
    const savedBackground = localStorage.getItem('animatedBackground');
    const savedGradient = localStorage.getItem('selectedGradient');
    
    if (savedBackground !== null) {
      setAnimatedBackground(savedBackground === 'true');
    }
    if (savedGradient) {
      setSelectedGradient(savedGradient);
    }
    
    applyBackgroundSettings();
  }, []);

  const applyBackgroundSettings = () => {
    const body = document.body;
    body.className = body.className.replace(/gradient-\w+|static-background/g, '');
    
    if (animatedBackground && selectedGradient !== 'static-background') {
      body.classList.add(selectedGradient);
    } else {
      body.classList.add('static-background');
    }
  };

  const handleColorChange = (field: keyof typeof currentTheme, value: string) => {
    const newTheme = { ...currentTheme, [field]: value };
    setCurrentTheme(newTheme);
    if (previewMode) {
      updateTheme(newTheme);
    }
  };

  const handlePresetApply = (preset: ColorPreset) => {
    const newTheme = {
      ...currentTheme,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    };
    setCurrentTheme(newTheme);
    if (previewMode) {
      updateTheme(newTheme);
    }
  };

  const handleSave = () => {
    updateTheme(currentTheme);
    localStorage.setItem('animatedBackground', animatedBackground.toString());
    localStorage.setItem('selectedGradient', selectedGradient);
    applyBackgroundSettings();
  };

  const handleReset = () => {
    const defaultTheme = {
      primaryColor: '#2563EB',
      secondaryColor: '#7C3AED',
      accentColor: '#F59E0B',
      fontFamily: 'Inter'
    };
    setCurrentTheme(defaultTheme);
    setAnimatedBackground(true);
    setSelectedGradient('gradient-rainbow');
  };

  const handleExport = () => {
    const themeData = {
      theme: currentTheme,
      background: {
        animated: animatedBackground,
        gradient: selectedGradient
      }
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string);
        if (themeData.theme) {
          setCurrentTheme(themeData.theme);
        }
        if (themeData.background) {
          setAnimatedBackground(themeData.background.animated);
          setSelectedGradient(themeData.background.gradient);
        }
      } catch (error) {
        console.error('Помилка імпорту теми:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleBackgroundChange = (enabled: boolean) => {
    setAnimatedBackground(enabled);
    if (!enabled) {
      setSelectedGradient('static-background');
    } else if (selectedGradient === 'static-background') {
      setSelectedGradient('gradient-rainbow');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold">Редактор тем</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Вимкнути перегляд' : 'Увімкнути перегляд'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Експорт
          </Button>
          
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Імпорт
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Скинути
          </Button>
          
          <Button onClick={handleSave}>
            Зберегти тему
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">Кольори</TabsTrigger>
          <TabsTrigger value="background">Фон</TabsTrigger>
          <TabsTrigger value="typography">Шрифти</TabsTrigger>
          <TabsTrigger value="preview">Перегляд</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Пресети кольорів</CardTitle>
              <CardDescription>Оберіть готову колірну схему</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {colorPresets.map((preset) => (
                  <Card
                    key={preset.name}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                    onClick={() => handlePresetApply(preset)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <p className="text-sm font-medium">{preset.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Основний колір</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={currentTheme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-12 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={currentTheme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="h-8 rounded border" style={{ backgroundColor: currentTheme.primaryColor }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Вторинний колір</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={currentTheme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={currentTheme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="h-8 rounded border" style={{ backgroundColor: currentTheme.secondaryColor }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Акцентний колір</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={currentTheme.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-12 h-12 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={currentTheme.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="h-8 rounded border" style={{ backgroundColor: currentTheme.accentColor }} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="background" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Налаштування фону</CardTitle>
              <CardDescription>Керуйте анімованим градієнтним фоном</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="animated-bg">Анімований фон</Label>
                  <p className="text-sm text-muted-foreground">Увімкнути анімований градієнтний фон</p>
                </div>
                <Switch
                  id="animated-bg"
                  checked={animatedBackground}
                  onCheckedChange={handleBackgroundChange}
                />
              </div>

              {animatedBackground && (
                <div>
                  <Label>Тип градієнта</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {gradientPresets.filter(g => g.class !== 'static-background').map((gradient) => (
                      <Card
                        key={gradient.class}
                        className={`cursor-pointer hover:shadow-md transition-all border-2 ${
                          selectedGradient === gradient.class ? 'border-primary' : 'border-border'
                        }`}
                        onClick={() => setSelectedGradient(gradient.class)}
                      >
                        <CardContent className="p-4">
                          <div className={`h-12 rounded mb-2 ${gradient.class}`} style={{
                            background: gradient.class === 'gradient-custom' 
                              ? `linear-gradient(-45deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor}, ${currentTheme.accentColor}, ${currentTheme.primaryColor})`
                              : undefined
                          }} />
                          <p className="text-sm font-medium text-center">{gradient.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Шрифти</CardTitle>
              <CardDescription>Оберіть основний шрифт для додатка</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Сімейство шрифтів</Label>
                  <Select
                    value={currentTheme.fontFamily}
                    onValueChange={(value) => handleColorChange('fontFamily', value)}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Оберіть шрифт" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <p style={{ fontFamily: currentTheme.fontFamily }} className="text-lg">
                      Приклад тексту з обраним шрифтом. Це демонстрація того, як буде виглядати текст у вашому додатку.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Перегляд теми</CardTitle>
              <CardDescription>Подивіться, як буде виглядати ваша тема</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card style={{ borderColor: currentTheme.primaryColor }}>
                    <CardContent className="p-4">
                      <div 
                        className="h-8 rounded mb-2"
                        style={{ backgroundColor: currentTheme.primaryColor }}
                      />
                      <p style={{ fontFamily: currentTheme.fontFamily, color: currentTheme.primaryColor }}>
                        Основний колір
                      </p>
                    </CardContent>
                  </Card>

                  <Card style={{ borderColor: currentTheme.secondaryColor }}>
                    <CardContent className="p-4">
                      <div 
                        className="h-8 rounded mb-2"
                        style={{ backgroundColor: currentTheme.secondaryColor }}
                      />
                      <p style={{ fontFamily: currentTheme.fontFamily, color: currentTheme.secondaryColor }}>
                        Вторинний колір
                      </p>
                    </CardContent>
                  </Card>

                  <Card style={{ borderColor: currentTheme.accentColor }}>
                    <CardContent className="p-4">
                      <div 
                        className="h-8 rounded mb-2"
                        style={{ backgroundColor: currentTheme.accentColor }}
                      />
                      <p style={{ fontFamily: currentTheme.fontFamily, color: currentTheme.accentColor }}>
                        Акцентний колір
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Badge style={{ backgroundColor: currentTheme.primaryColor, color: 'white' }}>
                    Основний бейдж
                  </Badge>
                  <Badge variant="secondary" style={{ backgroundColor: currentTheme.secondaryColor, color: 'white' }}>
                    Вторинний бейдж
                  </Badge>
                  <Badge variant="outline" style={{ borderColor: currentTheme.accentColor, color: currentTheme.accentColor }}>
                    Акцентний бейдж
                  </Badge>
                </div>

                <Button style={{ backgroundColor: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>
                  Приклад кнопки
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
