import { promises as fs } from 'fs';
import { join } from 'path';
import PptxGenJS from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';

interface Module {
  id: string;
  type: 'title' | 'content' | 'image' | 'chart' | 'list' | 'quote';
  content: any;
  layout?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface ExportOptions {
  title: string;
  modules: Module[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  format: 'pptx' | 'docx' | 'xlsx';
}

export class ExportService {
  private exportsDir = join(process.cwd(), 'exports');

  constructor() {
    this.ensureExportsDirectory();
  }

  private async ensureExportsDirectory() {
    try {
      await fs.access(this.exportsDir);
    } catch {
      await fs.mkdir(this.exportsDir, { recursive: true });
    }
  }

  async exportPresentation(options: ExportOptions): Promise<string> {
    const pptx = new PptxGenJS();
    
    // Налаштування теми
    pptx.theme = {
      headFontFace: options.theme.fontFamily,
      bodyFontFace: options.theme.fontFamily
    };

    // Титульний слайд
    const titleSlide = pptx.addSlide();
    titleSlide.addText(options.title, {
      x: 1,
      y: 2,
      w: 8,
      h: 2,
      fontSize: 44,
      bold: true,
      color: options.theme.primaryColor.replace('#', ''),
      align: 'center'
    });

    titleSlide.addText('Створено з DocumentA®', {
      x: 1,
      y: 4.5,
      w: 8,
      h: 0.5,
      fontSize: 18,
      color: options.theme.secondaryColor.replace('#', ''),
      align: 'center'
    });

    // Додаємо слайди для кожного модуля
    for (const module of options.modules) {
      const slide = pptx.addSlide();
      
      switch (module.type) {
        case 'title':
          slide.addText(module.content.text || 'Заголовок', {
            x: 0.5,
            y: 1,
            w: 9,
            h: 1.5,
            fontSize: 36,
            bold: true,
            color: options.theme.primaryColor.replace('#', ''),
            align: 'center'
          });
          break;

        case 'content':
          slide.addText(module.content.title || 'Контент', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 1,
            fontSize: 28,
            bold: true,
            color: options.theme.primaryColor.replace('#', '')
          });
          
          slide.addText(module.content.text || 'Текст контенту', {
            x: 0.5,
            y: 1.8,
            w: 9,
            h: 4,
            fontSize: 18,
            color: '000000',
            valign: 'top'
          });
          break;

        case 'list':
          slide.addText(module.content.title || 'Список', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 1,
            fontSize: 28,
            bold: true,
            color: options.theme.primaryColor.replace('#', '')
          });

          const listItems = module.content.items || ['Пункт 1', 'Пункт 2', 'Пункт 3'];
          listItems.forEach((item: string, index: number) => {
            slide.addText(`• ${item}`, {
              x: 1,
              y: 2 + (index * 0.6),
              w: 8,
              h: 0.5,
              fontSize: 18,
              color: '000000'
            });
          });
          break;

        case 'chart':
          slide.addText(module.content.title || 'Діаграма', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 1,
            fontSize: 28,
            bold: true,
            color: options.theme.primaryColor.replace('#', '')
          });

          // Додаємо просту діаграму
          const chartData = module.content.data || [
            { name: 'Категорія 1', value: 30 },
            { name: 'Категорія 2', value: 45 },
            { name: 'Категорія 3', value: 25 }
          ];

          slide.addChart(pptx.ChartType.bar, chartData, {
            x: 1.5,
            y: 2,
            w: 6,
            h: 4,
            chartColors: [
              options.theme.primaryColor,
              options.theme.secondaryColor,
              options.theme.accentColor
            ]
          });
          break;

        case 'quote':
          slide.addText(`"${module.content.text || 'Цитата'}"`, {
            x: 1,
            y: 2,
            w: 8,
            h: 2,
            fontSize: 24,
            italic: true,
            color: options.theme.accentColor.replace('#', ''),
            align: 'center'
          });
          
          if (module.content.author) {
            slide.addText(`— ${module.content.author}`, {
              x: 1,
              y: 4.5,
              w: 8,
              h: 0.5,
              fontSize: 18,
              color: options.theme.secondaryColor.replace('#', ''),
              align: 'right'
            });
          }
          break;
      }
    }

    const fileName = `presentation_${Date.now()}.pptx`;
    const filePath = join(this.exportsDir, fileName);
    await pptx.writeFile({ fileName: filePath });
    
    return fileName;
  }

  async exportDocument(options: ExportOptions): Promise<string> {
    const doc = new Document({
      styles: {
        default: {
          heading1: {
            run: {
              size: 32,
              bold: true,
              color: options.theme.primaryColor.replace('#', '')
            },
            paragraph: {
              spacing: { after: 300 }
            }
          },
          heading2: {
            run: {
              size: 24,
              bold: true,
              color: options.theme.secondaryColor.replace('#', '')
            },
            paragraph: {
              spacing: { after: 200 }
            }
          }
        }
      },
      sections: [
        {
          children: [
            // Титульна сторінка
            new Paragraph({
              text: options.title,
              heading: HeadingLevel.TITLE,
              alignment: 'center'
            }),
            new Paragraph({
              text: 'Створено з DocumentA®',
              alignment: 'center'
            }),
            new Paragraph({ text: '' }), // Порожній рядок
            
            // Зміст з модулів
            ...options.modules.flatMap(module => {
              const paragraphs = [];
              
              switch (module.type) {
                case 'title':
                  paragraphs.push(new Paragraph({
                    text: module.content.text || 'Заголовок',
                    heading: HeadingLevel.HEADING_1
                  }));
                  break;

                case 'content':
                  if (module.content.title) {
                    paragraphs.push(new Paragraph({
                      text: module.content.title,
                      heading: HeadingLevel.HEADING_2
                    }));
                  }
                  paragraphs.push(new Paragraph({
                    text: module.content.text || 'Текст контенту'
                  }));
                  break;

                case 'list':
                  if (module.content.title) {
                    paragraphs.push(new Paragraph({
                      text: module.content.title,
                      heading: HeadingLevel.HEADING_2
                    }));
                  }
                  const items = module.content.items || ['Пункт 1', 'Пункт 2'];
                  items.forEach((item: string) => {
                    paragraphs.push(new Paragraph({
                      text: `• ${item}`,
                      bullet: { level: 0 }
                    }));
                  });
                  break;

                case 'quote':
                  paragraphs.push(new Paragraph({
                    children: [
                      new TextRun({
                        text: `"${module.content.text || 'Цитата'}"`,
                        italics: true,
                        color: options.theme.accentColor.replace('#', '')
                      })
                    ],
                    alignment: 'center'
                  }));
                  if (module.content.author) {
                    paragraphs.push(new Paragraph({
                      text: `— ${module.content.author}`,
                      alignment: 'right'
                    }));
                  }
                  break;
              }
              
              paragraphs.push(new Paragraph({ text: '' })); // Порожній рядок між модулями
              return paragraphs;
            })
          ]
        }
      ]
    });

    const fileName = `document_${Date.now()}.docx`;
    const filePath = join(this.exportsDir, fileName);
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(filePath, buffer);
    
    return fileName;
  }

  async exportSpreadsheet(options: ExportOptions): Promise<string> {
    const workbook = XLSX.utils.book_new();
    
    // Головний аркуш з інформацією про проект
    const mainData = [
      ['Назва проекту', options.title],
      ['Дата створення', new Date().toLocaleDateString('uk-UA')],
      ['Кількість модулів', options.modules.length],
      ['Тема'],
      ['Основний колір', options.theme.primaryColor],
      ['Вторинний колір', options.theme.secondaryColor],
      ['Акцентний колір', options.theme.accentColor],
      ['Шрифт', options.theme.fontFamily]
    ];
    
    const mainSheet = XLSX.utils.aoa_to_sheet(mainData);
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Інформація');

    // Аркуш з модулями
    const moduleHeaders = ['ID', 'Тип', 'Заголовок', 'Контент', 'Додаткові дані'];
    const moduleData = [
      moduleHeaders,
      ...options.modules.map(module => [
        module.id,
        module.type,
        module.content.title || module.content.text || '',
        JSON.stringify(module.content),
        module.layout ? JSON.stringify(module.layout) : ''
      ])
    ];
    
    const moduleSheet = XLSX.utils.aoa_to_sheet(moduleData);
    XLSX.utils.book_append_sheet(workbook, moduleSheet, 'Модулі');

    // Якщо є діаграми, створюємо окремий аркуш з даними
    const chartModules = options.modules.filter(m => m.type === 'chart');
    if (chartModules.length > 0) {
      const chartData = [
        ['Назва діаграми', 'Категорія', 'Значення']
      ];
      
      chartModules.forEach(module => {
        const title = module.content.title || `Діаграма ${module.id}`;
        const data = module.content.data || [];
        data.forEach((item: any) => {
          chartData.push([title, item.name || '', item.value || 0]);
        });
      });
      
      const chartSheet = XLSX.utils.aoa_to_sheet(chartData);
      XLSX.utils.book_append_sheet(workbook, chartSheet, 'Дані діаграм');
    }

    const fileName = `spreadsheet_${Date.now()}.xlsx`;
    const filePath = join(this.exportsDir, fileName);
    XLSX.writeFile(workbook, filePath);
    
    return fileName;
  }

  async generateTableData(modules: Module[]): Promise<any[][]> {
    const headers = ['Модуль', 'Тип', 'Заголовок', 'Контент'];
    const data = [headers];
    
    modules.forEach((module, index) => {
      let content = '';
      switch (module.type) {
        case 'title':
        case 'content':
          content = module.content.text || '';
          break;
        case 'list':
          content = (module.content.items || []).join(', ');
          break;
        case 'quote':
          content = `"${module.content.text || ''}" - ${module.content.author || ''}`;
          break;
        case 'chart':
          content = `Діаграма з ${(module.content.data || []).length} елементами`;
          break;
        default:
          content = JSON.stringify(module.content);
      }
      
      data.push([
        `Модуль ${index + 1}`,
        module.type,
        module.content.title || '',
        content
      ]);
    });
    
    return data;
  }

  async getExportedFile(fileName: string): Promise<Buffer> {
    const filePath = join(this.exportsDir, fileName);
    return await fs.readFile(filePath);
  }

  async cleanupOldFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.exportsDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = join(this.exportsDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Помилка очищення старих файлів:', error);
    }
  }
}

export const exportService = new ExportService();