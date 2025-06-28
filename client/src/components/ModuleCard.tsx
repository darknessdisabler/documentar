import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heading, 
  AlignLeft, 
  BarChart3, 
  Image as ImageIcon, 
  List, 
  Quote,
  Edit,
  GripVertical,
  Trash2,
  Copy
} from 'lucide-react';
import { Module } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/translations';

interface ModuleCardProps {
  module: Module;
  index: number;
  onEdit: (module: Module) => void;
  onDelete: (moduleId: string) => void;
  onDuplicate: (moduleId: string) => void;
  onDragStart: (module: Module) => void;
  isDragging: boolean;
  showTutorial?: boolean;
}

const moduleIcons = {
  title: Heading,
  content: AlignLeft,
  chart: BarChart3,
  image: ImageIcon,
  list: List,
  quote: Quote,
};

const moduleColors = {
  title: 'bg-primary-100 text-primary-600',
  content: 'bg-secondary-100 text-secondary-600',
  chart: 'bg-accent-100 text-accent-600',
  image: 'bg-green-100 text-green-600',
  list: 'bg-indigo-100 text-indigo-600',
  quote: 'bg-pink-100 text-pink-600',
};

export default function ModuleCard({ 
  module, 
  index, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onDragStart,
  isDragging,
  showTutorial = false
}: ModuleCardProps) {
  const { language } = useTheme();
  const Icon = moduleIcons[module.type];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('button')) return;
    onDragStart(module);
  };

  const renderContent = () => {
    switch (module.type) {
      case 'title':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {module.content.title || t('presentationTitle', language)}
            </h2>
            <p className="text-gray-600 mt-2">
              {module.content.subtitle || t('createdWithAI', language)}
            </p>
          </div>
        );
      
      case 'content':
        return (
          <p className="text-gray-700 leading-relaxed">
            {module.content.text || t('defaultContent', language)}
          </p>
        );
      
      case 'chart':
        return (
          <div className="space-y-2">
            {(module.content.data || [
              { label: 'Q1', value: 75 },
              { label: 'Q2', value: 50 },
              { label: 'Q3', value: 85 }
            ]).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: i % 2 === 0 ? 'var(--theme-accent, #F59E0B)' : 'var(--theme-primary, #2563EB)'
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        );
      
      case 'image':
        return (
          <img 
            src={module.content.url || "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"} 
            alt={module.content.alt || "Modern office workspace"}
            className="w-full h-32 object-cover rounded-lg" 
          />
        );
      
      case 'list':
        return (
          <ul className="space-y-2">
            {(module.content.items || [
              t('aiGeneration', language),
              t('offlineWork', language),
              t('customInterface', language)
            ]).map((item: string, i: number) => (
              <li key={i} className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--theme-primary, #2563EB)' }}
                ></div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        );
      
      case 'quote':
        return (
          <blockquote 
            className="border-l-4 pl-4"
            style={{ borderColor: 'var(--theme-primary, #2563EB)' }}
          >
            <p className="text-gray-700 italic">
              "{module.content.text || t('defaultQuote', language)}"
            </p>
            <footer className="text-sm text-gray-600 mt-2">
              — {module.content.author || t('quoteAuthor', language)}
            </footer>
          </blockquote>
        );
      
      default:
        return <div>Unknown module type</div>;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -100, rotate: 180 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        rotate: 0,
        scale: isDragging ? 1.05 : 1,
        zIndex: isDragging ? 1000 : 1
      }}
      transition={{ 
        type: "spring", 
        damping: 15, 
        stiffness: 200,
        delay: index * 0.1 
      }}
      whileHover={{ y: -4 }}
      className={`
        module-card bg-white rounded-xl p-6 border border-gray-200 cursor-grab
        transition-all duration-300 hover:shadow-lg
        ${isDragging ? 'cursor-grabbing shadow-2xl' : ''}
        ${showTutorial ? 'ring-4 ring-primary-300 ring-opacity-50 animate-pulse' : ''}
      `}
      onMouseDown={handleMouseDown}
      style={{ transform: isDragging ? 'rotate(5deg)' : 'rotate(0deg)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${moduleColors[module.type]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{t(module.type, language)}</h3>
            <p className="text-sm text-gray-600">
              {t(`${module.type === 'title' ? 'mainTitle' : 
                   module.type === 'content' ? 'textBlock' :
                   module.type === 'chart' ? 'dataVisualization' :
                   module.type === 'image' ? 'mediaContent' :
                   module.type === 'list' ? 'bulletList' : 'highlightedText'}`, language)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(module);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(module.id);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(module.id);
            }}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <div className="text-gray-400">
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        {renderContent()}
      </div>
    </motion.div>
  );
}
