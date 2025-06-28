import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heading, AlignLeft, BarChart3, Image as ImageIcon, List, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModuleCard from './ModuleCard';
import ModuleEditModal from './ModuleEditModal';
import { Module } from '@/lib/types';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/translations';

interface ModulesGridProps {
  modules: Module[];
  onModulesChange: (modules: Module[]) => void;
  showTutorial: boolean;
}

export default function ModulesGrid({ modules, onModulesChange, showTutorial }: ModulesGridProps) {
  const { language } = useTheme();
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  const {
    draggedModule,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    updateModule,
    deleteModule,
    duplicateModule,
    addNewModule,
  } = useDragDrop(modules, onModulesChange);

  const handleEdit = (module: Module) => {
    setEditingModule(module);
  };

  const handleSaveEdit = (updatedModule: Module) => {
    updateModule(updatedModule.id, updatedModule);
    setEditingModule(null);
  };

  const handleAddModule = (type: Module['type']) => {
    addNewModule(type);
    setShowAddMenu(false);
  };

  return (
    <div className="space-y-4 max-h-screen overflow-y-auto p-2">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto"
        layout
      >
        <AnimatePresence>
          {modules.map((module, index) => (
            <div
              key={module.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="relative"
            >
              <ModuleCard
                module={module}
                index={index}
                onEdit={handleEdit}
                onDelete={deleteModule}
                onDuplicate={duplicateModule}
                onDragStart={handleDragStart}
                isDragging={draggedModule?.id === module.id}
                showTutorial={showTutorial && index === 0}
              />
            </div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Drop Zone */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="border-2 border-dashed border-primary-300 bg-primary-50 rounded-xl p-8 text-center"
            onMouseUp={handleDragEnd}
          >
            <Plus 
              className="text-primary-500 text-2xl mb-2 mx-auto" 
              style={{ color: 'var(--theme-primary, #2563EB)' }} 
            />
            <p 
              className="text-primary-600"
              style={{ color: 'var(--theme-primary, #2563EB)' }}
            >
              {t('dropModuleHere', language)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Module Button */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="bg-primary-500 hover:bg-primary-600 text-white"
          style={{ backgroundColor: 'var(--theme-primary, #2563EB)' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('addNewModule', language)}
        </Button>
      </div>

      {/* Add Module Menu */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
              {t('selectModuleType', language)}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { type: 'title' as const, icon: Heading, color: 'bg-blue-100 text-blue-600' },
                { type: 'content' as const, icon: AlignLeft, color: 'bg-purple-100 text-purple-600' },
                { type: 'chart' as const, icon: BarChart3, color: 'bg-yellow-100 text-yellow-600' },
                { type: 'image' as const, icon: ImageIcon, color: 'bg-green-100 text-green-600' },
                { type: 'list' as const, icon: List, color: 'bg-indigo-100 text-indigo-600' },
                { type: 'quote' as const, icon: Quote, color: 'bg-pink-100 text-pink-600' },
              ].map(({ type, icon: Icon, color }) => (
                <Button
                  key={type}
                  onClick={() => handleAddModule(type)}
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto p-4 hover:bg-gray-50"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{t(type, language)}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <ModuleEditModal
        module={editingModule}
        isOpen={!!editingModule}
        onClose={() => setEditingModule(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
