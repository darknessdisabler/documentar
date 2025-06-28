import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Save, Plus } from 'lucide-react';
import { Module } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/translations';

interface ModuleEditModalProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (module: Module) => void;
}

export default function ModuleEditModal({ module, isOpen, onClose, onSave }: ModuleEditModalProps) {
  const { language } = useTheme();
  const [editedModule, setEditedModule] = useState<Module | null>(module);

  // Update edited module when prop changes
  useEffect(() => {
    setEditedModule(module);
  }, [module]);

  if (!module || !editedModule) return null;

  const handleSave = () => {
    onSave(editedModule);
    onClose();
  };

  const updateContent = (field: string, value: any) => {
    setEditedModule({
      ...editedModule,
      content: {
        ...editedModule.content,
        [field]: value
      }
    });
  };

  const renderEditFields = () => {
    switch (editedModule.type) {
      case 'title':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">{t('title', language)}</Label>
              <Input
                id="title"
                value={editedModule.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder={language === 'uk' ? 'Введіть заголовок...' : 'Enter title...'}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">{language === 'uk' ? 'Підзаголовок' : 'Subtitle'}</Label>
              <Input
                id="subtitle"
                value={editedModule.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                placeholder={language === 'uk' ? 'Введіть підзаголовок...' : 'Enter subtitle...'}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 'content':
        return (
          <div>
            <Label htmlFor="text">{t('content', language)}</Label>
            <Textarea
              id="text"
              value={editedModule.content.text || ''}
              onChange={(e) => updateContent('text', e.target.value)}
              placeholder={language === 'uk' ? 'Введіть текст...' : 'Enter text...'}
              rows={6}
              className="mt-2"
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">{language === 'uk' ? 'URL зображення' : 'Image URL'}</Label>
              <Input
                id="url"
                value={editedModule.content.url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="alt">{language === 'uk' ? 'Опис зображення' : 'Alt text'}</Label>
              <Input
                id="alt"
                value={editedModule.content.alt || ''}
                onChange={(e) => updateContent('alt', e.target.value)}
                placeholder={language === 'uk' ? 'Опис зображення...' : 'Image description...'}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 'list':
        return (
          <div>
            <Label>{t('list', language)}</Label>
            <div className="space-y-2 mt-2">
              {(editedModule.content.items || []).map((item: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(editedModule.content.items || [])];
                      newItems[index] = e.target.value;
                      updateContent('items', newItems);
                    }}
                    placeholder={`${language === 'uk' ? 'Пункт' : 'Item'} ${index + 1}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItems = [...(editedModule.content.items || [])];
                      newItems.splice(index, 1);
                      updateContent('items', newItems);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newItems = [...(editedModule.content.items || []), ''];
                  updateContent('items', newItems);
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'uk' ? 'Додати пункт' : 'Add item'}
              </Button>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="quote-text">{language === 'uk' ? 'Текст цитати' : 'Quote text'}</Label>
              <Textarea
                id="quote-text"
                value={editedModule.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder={language === 'uk' ? 'Введіть цитату...' : 'Enter quote...'}
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="author">{language === 'uk' ? 'Автор' : 'Author'}</Label>
              <Input
                id="author"
                value={editedModule.content.author || ''}
                onChange={(e) => updateContent('author', e.target.value)}
                placeholder={language === 'uk' ? 'Ім\'я автора...' : 'Author name...'}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 'chart':
        return (
          <div>
            <Label>{t('chart', language)}</Label>
            <div className="space-y-2 mt-2">
              {(editedModule.content.data || []).map((item: any, index: number) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={item.label || ''}
                    onChange={(e) => {
                      const newData = [...(editedModule.content.data || [])];
                      newData[index] = { ...newData[index], label: e.target.value };
                      updateContent('data', newData);
                    }}
                    placeholder={language === 'uk' ? 'Назва' : 'Label'}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={item.value || 0}
                    onChange={(e) => {
                      const newData = [...(editedModule.content.data || [])];
                      newData[index] = { ...newData[index], value: parseInt(e.target.value) || 0 };
                      updateContent('data', newData);
                    }}
                    placeholder="0-100"
                    className="w-20"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newData = [...(editedModule.content.data || [])];
                      newData.splice(index, 1);
                      updateContent('data', newData);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newData = [...(editedModule.content.data || []), { label: '', value: 0 }];
                  updateContent('data', newData);
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'uk' ? 'Додати дані' : 'Add data'}
              </Button>
            </div>
          </div>
        );

      default:
        return <div>{language === 'uk' ? 'Невідомий тип модуля' : 'Unknown module type'}</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{language === 'uk' ? 'Редагувати модуль' : 'Edit Module'}</span>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                {language === 'uk' ? 'Зберегти' : 'Save'}
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-4">
              {language === 'uk' ? 'Тип модуля:' : 'Module Type:'} {t(editedModule.type, language)}
            </h3>
            {renderEditFields()}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}