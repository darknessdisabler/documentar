import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Download, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/translations';
import { apiRequest } from '@/lib/queryClient';

interface AIModel {
  id: string;
  name: string;
  type: 'base' | 'lora';
  size: string;
  downloaded: boolean;
  downloading: boolean;
  progress: number;
}

interface FirstRunSetupProps {
  onComplete: () => void;
}

export default function FirstRunSetup({ onComplete }: FirstRunSetupProps) {
  const { language } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkFirstRun();
  }, []);

  const checkFirstRun = async () => {
    try {
      const response = await apiRequest('GET', '/api/models/first-run');
      const { isFirstRun } = await response.json();
      
      if (isFirstRun) {
        setIsOpen(true);
        await loadModels();
      }
    } catch (error) {
      console.error('Error checking first run:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await apiRequest('GET', '/api/models');
      const modelsData = await response.json();
      setModels(modelsData.filter((model: AIModel) => 
        model.id === 'phi3-mini' || model.id === 'ukrainian-lora'
      ));
    } catch (error) {
      console.error('Error loading models:', error);
      setError('Failed to load models');
    }
  };

  const startDownload = async () => {
    setIsDownloading(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/models/download-essential');
      
      if (!response.ok) {
        throw new Error('Failed to start download');
      }

      // Simulate download progress for UI
      simulateDownloadProgress();
    } catch (error) {
      setError('Failed to start download');
      setIsDownloading(false);
    }
  };

  const simulateDownloadProgress = () => {
    const essentialModels = ['phi3-mini', 'ukrainian-lora'];
    let modelIndex = 0;
    let progress = 0;

    const updateProgress = () => {
      if (modelIndex >= essentialModels.length) {
        setDownloadProgress(100);
        setCurrentModel('');
        setTimeout(() => {
          setIsDownloading(false);
          setIsOpen(false);
          onComplete();
        }, 1000);
        return;
      }

      setCurrentModel(essentialModels[modelIndex]);
      progress += 2;

      if (progress >= 100) {
        progress = 0;
        modelIndex++;
        setDownloadProgress(0);
      } else {
        setDownloadProgress(progress);
      }

      setTimeout(updateProgress, 100);
    };

    updateProgress();
  };

  const skipSetup = () => {
    setIsOpen(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={() => {}}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {language === 'uk' ? 'Перший запуск DocumentA®' : 'DocumentA® First Run Setup'}
                  </h2>
                  <p className="text-sm text-gray-600 font-normal">
                    {language === 'uk' 
                      ? 'Налаштування базових AI моделей для роботи' 
                      : 'Setting up essential AI models for operation'}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">
                      {language === 'uk' ? 'Автономна робота' : 'Autonomous Operation'}
                    </h3>
                    <p className="text-sm text-blue-800 mt-1">
                      {language === 'uk' 
                        ? 'DocumentA® працює повністю офлайн з локальними AI моделями. Ваші дані залишаються приватними.'
                        : 'DocumentA® works completely offline with local AI models. Your data stays private.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">
                  {language === 'uk' ? 'Базові моделі для завантаження:' : 'Essential models to download:'}
                </h3>
                
                <div className="space-y-3">
                  {models.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          model.downloaded ? 'bg-green-500' : 
                          isDownloading && currentModel === model.id ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-sm text-gray-600">{model.size}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {model.downloaded ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : isDownloading && currentModel === model.id ? (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isDownloading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {language === 'uk' ? 'Завантаження...' : 'Downloading...'}
                    </span>
                    <span className="text-sm text-gray-600">{downloadProgress}%</span>
                  </div>
                  <Progress value={downloadProgress} className="h-2" />
                  {currentModel && (
                    <p className="text-sm text-gray-600">
                      {language === 'uk' ? 'Поточна модель:' : 'Current model:'} {
                        models.find(m => m.id === currentModel)?.name || currentModel
                      }
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={startDownload} 
                  disabled={isDownloading}
                  className="flex-1"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'uk' ? 'Завантаження...' : 'Downloading...'}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      {language === 'uk' ? 'Завантажити моделі' : 'Download Models'}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={skipSetup}
                  disabled={isDownloading}
                >
                  {language === 'uk' ? 'Пропустити' : 'Skip'}
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}