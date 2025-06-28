import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Bot, FileText, Wand2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/translations';
import { Project } from '@/lib/types';
import ThemeEditor from './ThemeEditor';

interface SidebarProps {
  onGeneratePresentation: (topic: string) => void;
  onGenerateDocument: (topic: string) => void;
  onImproveText: (text: string) => void;
}

export default function Sidebar({ onGeneratePresentation, onGenerateDocument, onImproveText }: SidebarProps) {
  const { language } = useTheme();
  const [generationTopic, setGenerationTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await apiRequest('POST', '/api/projects', projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });

  const handleGeneratePresentation = async () => {
    if (!generationTopic.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGeneratePresentation(generationTopic);
      setGenerationTopic('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDocument = async () => {
    if (!generationTopic.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGenerateDocument(generationTopic);
      setGenerationTopic('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-r flex flex-col">
      {/* Projects Section */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('projects', language)}</h2>
          <Button
            size="sm"
            className="bg-primary-500 hover:bg-primary-600"
            style={{ backgroundColor: 'var(--theme-primary, #2563EB)' }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg p-3 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            projects.slice(0, 2).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg p-3 cursor-pointer transition-colors ${
                  index === 0 
                    ? 'bg-primary-50 border border-primary-200' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className={`font-medium ${index === 0 ? 'text-primary-700' : ''}`}>
                  {project.title}
                </div>
                <div className={`text-sm ${index === 0 ? 'text-primary-600' : 'text-gray-600'}`}>
                  {index === 0 ? t('updatedHoursAgo', language, { hours: 2 }) : t('updatedYesterday', language)}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No projects yet
            </div>
          )}
        </div>
      </div>

      {/* AI Tools Section */}
      <div className="p-6 border-b">
        <h3 className="font-semibold mb-4 text-gray-700">{t('aiTools', language)}</h3>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder={language === 'uk' ? 'Введіть тему...' : 'Enter topic...'}
            value={generationTopic}
            onChange={(e) => setGenerationTopic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            style={{ focusRingColor: 'var(--theme-primary, #2563EB)' }}
          />
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={handleGeneratePresentation}
            disabled={!generationTopic.trim() || isGenerating}
            className="w-full bg-secondary-500 hover:bg-secondary-600 text-white"
            style={{ backgroundColor: 'var(--theme-secondary, #7C3AED)' }}
          >
            <Bot className="w-4 h-4 mr-2" />
            {t('generatePresentation', language)}
          </Button>
          
          <Button
            onClick={handleGenerateDocument}
            disabled={!generationTopic.trim() || isGenerating}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white"
            style={{ backgroundColor: 'var(--theme-accent, #F59E0B)' }}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('createDocument', language)}
          </Button>
          
          <Button
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50"
            onClick={() => onImproveText('Sample text to improve...')}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {t('improveText', language)}
          </Button>
        </div>
      </div>

      {/* Theme Editor Section */}
      <div className="p-6 flex-1">
        <ThemeEditor />
      </div>
    </div>
  );
}
