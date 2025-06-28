import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Languages, FileText, Settings } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/translations';
import SettingsModal from './SettingsModal';

export default function WindowTitleBar() {
  const { language, updateLanguage } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: 'var(--theme-primary, #2563EB)' }}
          >
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm">{t('appName', language)}</div>
            <div className="text-xs text-gray-500">{t('appSubtitle', language)}</div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Languages className="w-4 h-4 text-gray-500" />
          <Select value={language} onValueChange={(value: 'uk' | 'en') => updateLanguage(value)}>
            <SelectTrigger className="w-[120px] border-none bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uk">Українська</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="flex items-center space-x-1"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">{t('settings', language)}</span>
        </Button>
      </div>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}
