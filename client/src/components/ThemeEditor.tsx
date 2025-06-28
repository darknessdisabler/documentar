import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/translations';

const colorOptions = [
  { value: '#2563EB', name: 'Blue', color: 'bg-blue-500' },
  { value: '#7C3AED', name: 'Purple', color: 'bg-purple-500' },
  { value: '#059669', name: 'Green', color: 'bg-green-500' },
  { value: '#DC2626', name: 'Red', color: 'bg-red-500' },
  { value: '#EA580C', name: 'Orange', color: 'bg-orange-500' },
  { value: '#0891B2', name: 'Cyan', color: 'bg-cyan-500' },
];

const fontOptions = [
  { value: 'Inter', name: 'Inter' },
  { value: 'Roboto', name: 'Roboto' },
  { value: 'Open Sans', name: 'Open Sans' },
  { value: 'Poppins', name: 'Poppins' },
  { value: 'Lato', name: 'Lato' },
];

export default function ThemeEditor() {
  const { theme, language, updateTheme, isUpdating } = useTheme();

  if (!theme) return null;

  return (
    <div>
      <h3 className="font-semibold mb-4 text-gray-700">{t('themeEditor', language)}</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('colorScheme', language)}</label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => updateTheme({ primaryColor: color.value })}
                className={`w-8 h-8 rounded cursor-pointer transition-all ${color.color} ${
                  theme.primaryColor === color.value 
                    ? 'ring-2 ring-offset-2 ring-gray-400' 
                    : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'
                }`}
                disabled={isUpdating}
              />
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">{t('font', language)}</label>
          <Select 
            value={theme.fontFamily} 
            onValueChange={(value) => updateTheme({ fontFamily: value })}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Card className="theme-preview">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-2">{t('preview', language)}</div>
            <div className="space-y-2">
              <div 
                className="h-2 rounded w-3/4"
                style={{ backgroundColor: theme.primaryColor }}
              ></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
