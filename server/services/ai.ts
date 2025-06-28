// Offline AI service - no external dependencies required

export interface GenerateContentRequest {
  type: 'presentation' | 'document';
  topic: string;
  language: 'uk' | 'en';
  slideCount?: number;
  style?: string;
}

export interface GeneratedSlide {
  id: string;
  type: 'title' | 'content' | 'image' | 'chart' | 'list' | 'quote';
  content: any;
  layout?: { x: number; y: number; w: number; h: number };
}

export interface GeneratedContent {
  title: string;
  slides: GeneratedSlide[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export async function generatePresentation(request: GenerateContentRequest): Promise<GeneratedContent> {
  // Offline AI - generate presentation content locally
  const slideCount = request.slideCount || 5;
  const isUkrainian = request.language === 'uk';
  
  const templates = {
    uk: {
      titles: [
        'Вступ до теми',
        'Основні поняття',
        'Переваги та особливості',
        'Практичне застосування',
        'Висновки'
      ],
      contents: [
        'DocumentA® надає потужні можливості для створення презентацій та документів за допомогою штучного інтелекту.',
        'Основні функції включають drag-and-drop інтерфейс, кастомізацію тем та офлайн роботу.',
        'Переваги: швидке створення контенту, інтуїтивний інтерфейс, повна кастомізація.',
        'Використовуйте для створення бізнес-презентацій, навчальних матеріалів та звітів.',
        'DocumentA® - це майбутнє створення контенту з використанням ШІ технологій.'
      ]
    },
    en: {
      titles: [
        'Introduction to Topic',
        'Key Concepts',
        'Benefits and Features',
        'Practical Applications',
        'Conclusions'
      ],
      contents: [
        'DocumentA® provides powerful capabilities for creating presentations and documents using artificial intelligence.',
        'Core features include drag-and-drop interface, theme customization, and offline functionality.',
        'Benefits: rapid content creation, intuitive interface, complete customization.',
        'Use for business presentations, educational materials, and reports.',
        'DocumentA® is the future of content creation with AI technologies.'
      ]
    }
  };

  const template = templates[isUkrainian ? 'uk' : 'en'];
  const slides: GeneratedSlide[] = [];

  for (let i = 0; i < slideCount; i++) {
    const slideTypes: Array<'title' | 'content' | 'chart' | 'list' | 'quote'> = ['title', 'content', 'chart', 'list', 'quote'];
    const type = i === 0 ? 'title' : slideTypes[i % slideTypes.length];
    
    let content;
    switch (type) {
      case 'title':
        content = {
          title: `${request.topic} - ${template.titles[i] || template.titles[0]}`,
          subtitle: isUkrainian ? 'Створено за допомогою DocumentA®' : 'Created with DocumentA®'
        };
        break;
      case 'content':
        content = {
          text: template.contents[i % template.contents.length].replace('DocumentA®', request.topic)
        };
        break;
      case 'chart':
        content = {
          data: [
            { label: 'Q1', value: Math.floor(Math.random() * 100) },
            { label: 'Q2', value: Math.floor(Math.random() * 100) },
            { label: 'Q3', value: Math.floor(Math.random() * 100) },
            { label: 'Q4', value: Math.floor(Math.random() * 100) }
          ]
        };
        break;
      case 'list':
        content = {
          items: isUkrainian ? [
            'ШІ генерація контенту',
            'Офлайн робота',
            'Кастомний інтерфейс',
            'Drag & Drop модулі'
          ] : [
            'AI content generation',
            'Offline functionality',
            'Custom interface',
            'Drag & Drop modules'
          ]
        };
        break;
      case 'quote':
        content = {
          text: isUkrainian ? 
            'Штучний інтелект змінює спосіб створення контенту' : 
            'Artificial intelligence is changing how we create content',
          author: 'DocumentA® Team'
        };
        break;
    }

    slides.push({
      id: `slide-${i + 1}`,
      type,
      content,
      layout: {
        x: (i % 3) * 4,
        y: Math.floor(i / 3) * 4,
        w: 4,
        h: 4
      }
    });
  }

  return {
    title: `${request.topic} - ${isUkrainian ? 'Презентація' : 'Presentation'}`,
    slides,
    theme: {
      primaryColor: '#2563EB',
      secondaryColor: '#7C3AED',
      fontFamily: 'Inter'
    }
  };
}

export async function generateDocument(request: GenerateContentRequest): Promise<GeneratedContent> {
  // Offline AI - generate document content locally
  const isUkrainian = request.language === 'uk';
  
  const documentSections = {
    uk: {
      sections: [
        'Вступ',
        'Огляд основних концепцій',
        'Детальний аналіз',
        'Висновки та рекомендації'
      ],
      contents: [
        `Цей документ розглядає тему "${request.topic}" з різних аспектів та надає комплексний огляд.`,
        'Основні принципи та підходи, які використовуються в даній сфері.',
        'Детальний розбір ключових елементів та їх практичне застосування.',
        'Підсумки дослідження та практичні рекомендації для впровадження.'
      ],
      listItems: [
        'Теоретичні основи',
        'Практичні підходи',
        'Інноваційні рішення',
        'Майбутні перспективи'
      ]
    },
    en: {
      sections: [
        'Introduction',
        'Core Concepts Overview',
        'Detailed Analysis',
        'Conclusions and Recommendations'
      ],
      contents: [
        `This document examines the topic "${request.topic}" from various aspects and provides a comprehensive overview.`,
        'Key principles and approaches used in this field.',
        'Detailed breakdown of core elements and their practical application.',
        'Research summary and practical recommendations for implementation.'
      ],
      listItems: [
        'Theoretical foundations',
        'Practical approaches',
        'Innovative solutions',
        'Future prospects'
      ]
    }
  };

  const template = documentSections[isUkrainian ? 'uk' : 'en'];
  const slides: GeneratedSlide[] = [];

  // Generate document sections
  template.sections.forEach((section, i) => {
    // Title slide for each section
    slides.push({
      id: `section-title-${i + 1}`,
      type: 'title',
      content: {
        title: section,
        subtitle: i === 0 ? (isUkrainian ? 'Документ створено в DocumentA®' : 'Document created in DocumentA®') : ''
      },
      layout: {
        x: (slides.length % 2) * 6,
        y: Math.floor(slides.length / 2) * 4,
        w: 6,
        h: 3
      }
    });

    // Content slide for each section
    slides.push({
      id: `section-content-${i + 1}`,
      type: 'content',
      content: {
        text: template.contents[i]
      },
      layout: {
        x: (slides.length % 2) * 6,
        y: Math.floor(slides.length / 2) * 4,
        w: 6,
        h: 4
      }
    });
  });

  // Add a list section
  slides.push({
    id: 'key-points',
    type: 'list',
    content: {
      items: template.listItems
    },
    layout: {
      x: (slides.length % 2) * 6,
      y: Math.floor(slides.length / 2) * 4,
      w: 6,
      h: 4
    }
  });

  // Add a quote
  slides.push({
    id: 'conclusion-quote',
    type: 'quote',
    content: {
      text: isUkrainian ? 
        'Знання - це сила, а правильно організована інформація - це успіх' : 
        'Knowledge is power, and well-organized information is success',
      author: 'DocumentA® Team'
    },
    layout: {
      x: (slides.length % 2) * 6,
      y: Math.floor(slides.length / 2) * 4,
      w: 6,
      h: 3
    }
  });

  return {
    title: `${request.topic} - ${isUkrainian ? 'Документ' : 'Document'}`,
    slides,
    theme: {
      primaryColor: '#2563EB',
      secondaryColor: '#7C3AED',
      fontFamily: 'Inter'
    }
  };
}

export async function improveText(text: string, language: 'uk' | 'en'): Promise<string> {
  // Offline text improvement - basic formatting and structure enhancement
  if (!text || text.trim().length === 0) {
    return language === 'uk' ? 
      'Введіть текст для покращення' : 
      'Enter text to improve';
  }

  // Basic text improvements
  let improvedText = text.trim();
  
  // Capitalize first letter of sentences
  improvedText = improvedText.replace(/(^|\. )(\w)/g, (match, p1, p2) => p1 + p2.toUpperCase());
  
  // Remove extra spaces
  improvedText = improvedText.replace(/\s+/g, ' ');
  
  // Add period at the end if missing
  if (!improvedText.match(/[.!?]$/)) {
    improvedText += '.';
  }

  // Add some professional touches based on language
  const improvements = {
    uk: {
      prefix: 'Покращений текст:\n\n',
      suffix: '\n\n(Текст оброблено за допомогою DocumentA®)'
    },
    en: {
      prefix: 'Improved text:\n\n',
      suffix: '\n\n(Text processed with DocumentA®)'
    }
  };

  const improvement = improvements[language];
  return improvement.prefix + improvedText + improvement.suffix;
}
