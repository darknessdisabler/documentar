import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save, Download } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/translations';
import { Module } from '@/lib/types';

import WindowTitleBar from '@/components/WindowTitleBar';
import Sidebar from '@/components/Sidebar';
import ModulesGrid from '@/components/ModulesGrid';
import LoadingScreen from '@/components/LoadingScreen';
import TutorialOverlay from '@/components/TutorialOverlay';

const defaultModules: Module[] = [
  {
    id: 'title-1',
    type: 'title',
    content: {
      title: '',
      subtitle: ''
    },
    layout: { x: 0, y: 0, w: 4, h: 2 }
  },
  {
    id: 'content-1',
    type: 'content',
    content: {
      text: ''
    },
    layout: { x: 4, y: 0, w: 4, h: 4 }
  },
  {
    id: 'chart-1',
    type: 'chart',
    content: {
      data: []
    },
    layout: { x: 8, y: 0, w: 4, h: 4 }
  },
  {
    id: 'image-1',
    type: 'image',
    content: {
      url: '',
      alt: ''
    },
    layout: { x: 0, y: 4, w: 4, h: 3 }
  },
  {
    id: 'list-1',
    type: 'list',
    content: {
      items: []
    },
    layout: { x: 4, y: 4, w: 4, h: 4 }
  },
  {
    id: 'quote-1',
    type: 'quote',
    content: {
      text: '',
      author: ''
    },
    layout: { x: 8, y: 4, w: 4, h: 3 }
  },
];

export default function Dashboard() {
  const [modules, setModules] = useState<Module[]>(defaultModules);
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  
  const { language } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize app
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  // Save project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      if (currentProject?.id) {
        const response = await apiRequest('PUT', `/api/projects/${currentProject.id}`, projectData);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/projects', projectData);
        return response.json();
      }
    },
    onSuccess: (data) => {
      setCurrentProject(data);
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: language === 'uk' ? 'Проект збережено' : 'Project saved',
        description: language === 'uk' ? 'Ваш проект успішно збережено' : 'Your project has been saved successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'uk' ? 'Помилка' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // AI Generation mutations
  const generatePresentationMutation = useMutation({
    mutationFn: async (topic: string) => {
      const response = await apiRequest('POST', '/api/ai/generate-presentation', {
        topic,
        language,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setModules(data.slides || defaultModules);
      toast({
        title: language === 'uk' ? 'Презентацію створено' : 'Presentation created',
        description: language === 'uk' ? 'ШІ згенерував презентацію для вас' : 'AI has generated a presentation for you',
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'uk' ? 'Помилка генерації' : 'Generation error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const generateDocumentMutation = useMutation({
    mutationFn: async (topic: string) => {
      const response = await apiRequest('POST', '/api/ai/generate-document', {
        topic,
        language,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setModules(data.slides || defaultModules);
      toast({
        title: language === 'uk' ? 'Документ створено' : 'Document created',
        description: language === 'uk' ? 'ШІ згенерував документ для вас' : 'AI has generated a document for you',
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'uk' ? 'Помилка генерації' : 'Generation error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const improveTextMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', '/api/ai/improve-text', {
        text,
        language,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: language === 'uk' ? 'Текст покращено' : 'Text improved',
        description: data.improvedText,
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'uk' ? 'Помилка покращення' : 'Improvement error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    const projectData = {
      title: currentProject?.title || 'New Project',
      type: 'presentation',
      content: {
        modules,
        theme: {
          primaryColor: '#2563EB',
          secondaryColor: '#7C3AED',
          accentColor: '#F59E0B',
          fontFamily: 'Inter'
        }
      }
    };
    
    saveProjectMutation.mutate(projectData);
  };

  const handleExport = () => {
    toast({
      title: language === 'uk' ? 'Експорт' : 'Export',
      description: language === 'uk' ? 'Функція експорту в розробці' : 'Export functionality in development',
    });
  };

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      <TutorialOverlay isVisible={showTutorial} onClose={closeTutorial} />
      
      <div className="app-window bg-white h-screen flex flex-col">
        <WindowTitleBar />
        
        <div className="flex-1 flex">
          <Sidebar
            onGeneratePresentation={generatePresentationMutation.mutate}
            onGenerateDocument={generateDocumentMutation.mutate}
            onImproveText={improveTextMutation.mutate}
          />
          
          {/* Main Workspace */}
          <div className="flex-1 p-8 bg-gray-50 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('workspace', language)}</h1>
                  <p className="text-gray-600">{t('dragModules', language)}</p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSave}
                    disabled={saveProjectMutation.isPending}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t('save', language)}
                  </Button>
                  <Button
                    onClick={handleExport}
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                    style={{ backgroundColor: 'var(--theme-primary, #2563EB)' }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('export', language)}
                  </Button>
                </div>
              </div>
            </motion.div>

            <ModulesGrid
              modules={modules}
              onModulesChange={setModules}
              showTutorial={showTutorial}
            />
          </div>
        </div>
      </div>
    </>
  );
}
