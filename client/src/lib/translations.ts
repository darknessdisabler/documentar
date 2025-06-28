export const translations = {
  uk: {
    // Window and App
    appName: "DocumentA®",
    appSubtitle: "ДокументаР",
    loading: "Завантаження модулів ШІ...",
    
    // Navigation
    projects: "Проекти",
    aiTools: "ШІ Інструменти",
    themeEditor: "Редактор Тем",
    workspace: "Робоча Область",
    
    // Projects
    myPresentation: "Моя Презентація",
    projectDocument: "Документ Проекту",
    updatedHoursAgo: "Оновлено {{hours}} години тому",
    updatedYesterday: "Оновлено вчора",
    
    // AI Tools
    generatePresentation: "Генерувати Презентацію",
    createDocument: "Створити Документ",
    improveText: "Покращити Текст",
    
    // Theme Editor
    colorScheme: "Колірна Схема",
    font: "Шрифт",
    preview: "Попередній Перегляд",
    
    // Workspace
    dragModules: "Перетягуйте модулі для створення макету",
    save: "Зберегти",
    export: "Експорт",
    
    // Modules
    title: "Заголовок",
    content: "Контент",
    chart: "Діаграма",
    image: "Зображення",
    list: "Список",
    quote: "Цитата",
    
    // Module descriptions
    mainTitle: "Головний заголовок",
    textBlock: "Текстовий блок",
    dataVisualization: "Візуалізація даних",
    mediaContent: "Медіа контент",
    bulletList: "Маркований список",
    highlightedText: "Виділений текст",
    
    // Tutorial
    tutorialTitle: "Перетягуйте модулі!",
    tutorialText: "Ви можете переміщувати модулі по робочій області для створення ідеального макету.",
    understood: "Зрозуміло!",
    
    // Actions
    edit: "Редагувати",
    delete: "Видалити",
    duplicate: "Дублювати",
    close: "Закрити",
    cancel: "Скасувати",
    
    // Drop zone
    dropModuleHere: "Перетягніть модуль сюди",
    addNewModule: "Додати новий модуль",
    selectModuleType: "Оберіть тип модуля",
    
    // Default content
    presentationTitle: "Презентація DocumentA®",
    createdWithAI: "Створено за допомогою ШІ",
    defaultContent: "DocumentA® - це потужний інструмент для створення презентацій та документів за допомогою штучного інтелекту. Працює локально на вашому комп'ютері.",
    aiGeneration: "ШІ генерація контенту",
    offlineWork: "Offline робота",
    customInterface: "Кастомний інтерфейс",
    defaultQuote: "Штучний інтелект - це майбутнє створення контенту",
    quoteAuthor: "DocumentA® Team"
  },
  en: {
    // Window and App
    appName: "DocumentA®",
    appSubtitle: "ДокументаР",
    loading: "Loading AI modules...",
    
    // Navigation
    projects: "Projects",
    aiTools: "AI Tools",
    themeEditor: "Theme Editor",
    workspace: "Workspace",
    
    // Projects
    myPresentation: "My Presentation",
    projectDocument: "Project Document",
    updatedHoursAgo: "Updated {{hours}} hours ago",
    updatedYesterday: "Updated yesterday",
    
    // AI Tools
    generatePresentation: "Generate Presentation",
    createDocument: "Create Document",
    improveText: "Improve Text",
    
    // Theme Editor
    colorScheme: "Color Scheme",
    font: "Font",
    preview: "Preview",
    
    // Workspace
    dragModules: "Drag modules to create layout",
    save: "Save",
    export: "Export",
    
    // Modules
    title: "Title",
    content: "Content",
    chart: "Chart",
    image: "Image",
    list: "List",
    quote: "Quote",
    
    // Module descriptions
    mainTitle: "Main title",
    textBlock: "Text block",
    dataVisualization: "Data visualization",
    mediaContent: "Media content",
    bulletList: "Bullet list",
    highlightedText: "Highlighted text",
    
    // Tutorial
    tutorialTitle: "Drag modules!",
    tutorialText: "You can move modules around the workspace to create the perfect layout.",
    understood: "Got it!",
    
    // Actions
    edit: "Edit",
    delete: "Delete",
    duplicate: "Duplicate",
    close: "Close",
    cancel: "Cancel",
    
    // Drop zone
    dropModuleHere: "Drop module here",
    addNewModule: "Add New Module",
    selectModuleType: "Select module type",
    
    // Default content
    presentationTitle: "DocumentA® Presentation",
    createdWithAI: "Created with AI",
    defaultContent: "DocumentA® is a powerful tool for creating presentations and documents using artificial intelligence. Works locally on your computer.",
    aiGeneration: "AI content generation",
    offlineWork: "Offline work",
    customInterface: "Custom interface",
    defaultQuote: "Artificial intelligence is the future of content creation",
    quoteAuthor: "DocumentA® Team"
  }
};

export function t(key: string, language: 'uk' | 'en', variables?: Record<string, any>): string {
  const languageTranslations = translations[language] as Record<string, string>;
  let text = languageTranslations[key] || key;
  
  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(`{{${varKey}}}`, value);
    });
  }
  
  return text;
}
