import { useState, useCallback } from 'react';
import { Module } from '@/lib/types';

export function useDragDrop(modules: Module[], onModulesChange: (modules: Module[]) => void) {
  const [draggedModule, setDraggedModule] = useState<Module | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent, module: Module) => {
    setDraggedModule(module);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', module.id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedModule(null);
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedModule) return;

    const currentIndex = modules.findIndex(m => m.id === draggedModule.id);
    if (currentIndex === -1 || currentIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    const newModules = [...modules];
    const [movedModule] = newModules.splice(currentIndex, 1);
    newModules.splice(targetIndex, 0, movedModule);

    onModulesChange(newModules);
    handleDragEnd();
  }, [draggedModule, modules, onModulesChange, handleDragEnd]);

  const moveModule = useCallback((fromIndex: number, toIndex: number) => {
    const newModules = [...modules];
    const [movedModule] = newModules.splice(fromIndex, 1);
    newModules.splice(toIndex, 0, movedModule);
    onModulesChange(newModules);
  }, [modules, onModulesChange]);

  const updateModule = useCallback((moduleId: string, updates: Partial<Module>) => {
    const newModules = modules.map(module =>
      module.id === moduleId ? { ...module, ...updates } : module
    );
    onModulesChange(newModules);
  }, [modules, onModulesChange]);

  const deleteModule = useCallback((moduleId: string) => {
    const newModules = modules.filter(module => module.id !== moduleId);
    onModulesChange(newModules);
  }, [modules, onModulesChange]);

  const duplicateModule = useCallback((moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const newModule: Module = {
      ...module,
      id: `${module.id}_copy_${Date.now()}`,
    };

    const newModules = [...modules, newModule];
    onModulesChange(newModules);
  }, [modules, onModulesChange]);

  const addNewModule = useCallback((type: Module['type']) => {
    const newModule: Module = {
      id: `${type}-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      layout: {
        x: (modules.length % 3) * 4,
        y: Math.floor(modules.length / 3) * 4,
        w: 4,
        h: 4
      }
    };

    const newModules = [...modules, newModule];
    onModulesChange(newModules);
  }, [modules, onModulesChange]);

  const getDefaultContent = (type: Module['type']) => {
    switch (type) {
      case 'title':
        return { title: '', subtitle: '' };
      case 'content':
        return { text: '' };
      case 'image':
        return { url: '', alt: '' };
      case 'chart':
        return { data: [] };
      case 'list':
        return { items: [] };
      case 'quote':
        return { text: '', author: '' };
      default:
        return {};
    }
  };

  return {
    draggedModule,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    moveModule,
    updateModule,
    deleteModule,
    duplicateModule,
    addNewModule,
  };
}
