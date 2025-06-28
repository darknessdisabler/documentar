import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Hand, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/translations';

interface TutorialOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function TutorialOverlay({ isVisible, onClose }: TutorialOverlayProps) {
  const { language } = useTheme();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--theme-primary, #2563EB)' }}
              >
                <Hand className="text-white text-2xl" />
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold mb-4"
              >
                {t('tutorialTitle', language)}
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-6"
              >
                {t('tutorialText', language)}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3 justify-center"
              >
                <Button
                  onClick={onClose}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                  style={{ 
                    backgroundColor: 'var(--theme-primary, #2563EB)',
                    borderColor: 'var(--theme-primary, #2563EB)'
                  }}
                >
                  {t('understood', language)}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('close', language)}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
