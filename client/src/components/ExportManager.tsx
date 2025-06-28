import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Presentation, Table, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ExportManagerProps {
  title: string;
  modules: any[];
  theme: any;
}

interface ExportJob {
  id: string;
  format: 'pptx' | 'docx' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  fileName?: string;
  downloadUrl?: string;
  error?: string;
}

export default function ExportManager({ title, modules, theme }: ExportManagerProps) {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: async ({ format }: { format: 'pptx' | 'docx' | 'xlsx' }) => {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          modules,
          theme
        })
      });

      if (!response.ok) {
        throw new Error('Помилка експорту');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      setExportJobs(prev => prev.map(job => 
        job.format === variables.format && job.status === 'processing'
          ? { ...job, status: 'completed', progress: 100, fileName: data.fileName, downloadUrl: data.downloadUrl }
          : job
      ));
      
      toast({
        title: "Експорт завершено",
        description: `Файл ${getFormatName(variables.format)} готовий до завантаження`,
      });
    },
    onError: (error, variables) => {
      setExportJobs(prev => prev.map(job => 
        job.format === variables.format && job.status === 'processing'
          ? { ...job, status: 'error', error: error.message }
          : job
      ));
      
      toast({
        title: "Помилка експорту",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleExport = (format: 'pptx' | 'docx' | 'xlsx') => {
    const jobId = Date.now().toString();
    const newJob: ExportJob = {
      id: jobId,
      format,
      status: 'processing',
      progress: 0
    };

    setExportJobs(prev => [...prev.filter(j => j.format !== format), newJob]);

    // Симулюємо прогрес
    const progressInterval = setInterval(() => {
      setExportJobs(prev => prev.map(job => 
        job.id === jobId && job.status === 'processing'
          ? { ...job, progress: Math.min(job.progress + 10, 90) }
          : job
      ));
    }, 200);

    exportMutation.mutate({ format });

    setTimeout(() => {
      clearInterval(progressInterval);
    }, 2000);
  };

  const handleDownload = async (downloadUrl: string, fileName: string) => {
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Завантажено",
        description: `Файл ${fileName} завантажено успішно`,
      });
    } catch (error) {
      toast({
        title: "Помилка завантаження",
        description: "Не вдалося завантажити файл",
        variant: "destructive"
      });
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pptx': return <Presentation className="w-5 h-5" />;
      case 'docx': return <FileText className="w-5 h-5" />;
      case 'xlsx': return <Table className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getFormatName = (format: string) => {
    switch (format) {
      case 'pptx': return 'PowerPoint презентація';
      case 'docx': return 'Word документ';
      case 'xlsx': return 'Excel таблиця';
      default: return 'Невідомий формат';
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'pptx': return 'Повноцінна презентація з слайдами, діаграмами та зображеннями';
      case 'docx': return 'Структурований документ з форматуванням та стилями';
      case 'xlsx': return 'Таблиця з даними проекту та статистикою модулів';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default: return null;
    }
  };

  const exportFormats = [
    {
      format: 'pptx' as const,
      icon: <Presentation className="w-8 h-8" />,
      title: 'PowerPoint',
      description: 'Експорт у формат презентації',
      features: ['Слайди з контентом', 'Діаграми та графіки', 'Кастомна тема', 'Зображення']
    },
    {
      format: 'docx' as const,
      icon: <FileText className="w-8 h-8" />,
      title: 'Word',
      description: 'Експорт у формат документа',
      features: ['Структурований текст', 'Заголовки та стилі', 'Списки та таблиці', 'Форматування']
    },
    {
      format: 'xlsx' as const,
      icon: <Table className="w-8 h-8" />,
      title: 'Excel',
      description: 'Експорт у формат таблиці',
      features: ['Дані проекту', 'Інформація модулів', 'Дані діаграм', 'Статистика']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Експорт проекту</h3>
        <p className="text-sm text-muted-foreground">
          Експортуйте свій проект в різних форматах для подальшого використання
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportFormats.map((format) => {
          const job = exportJobs.find(j => j.format === format.format);
          
          return (
            <Card key={format.format} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {format.icon}
                    <div>
                      <CardTitle className="text-lg">{format.title}</CardTitle>
                      <CardDescription>{format.description}</CardDescription>
                    </div>
                  </div>
                  {job && getStatusIcon(job.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {format.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>

                {job?.status === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Експорт...</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="w-full" />
                  </div>
                )}

                {job?.status === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    Помилка: {job.error}
                  </div>
                )}

                <div className="flex gap-2">
                  {(!job || job.status === 'error') && (
                    <Button 
                      onClick={() => handleExport(format.format)}
                      disabled={exportMutation.isPending}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Експорт
                    </Button>
                  )}
                  
                  {job?.status === 'completed' && job.downloadUrl && (
                    <Button 
                      onClick={() => handleDownload(job.downloadUrl!, job.fileName!)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Завантажити
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {exportJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Історія експорту</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {getFormatIcon(job.format)}
                    <div>
                      <div className="font-medium">{getFormatName(job.format)}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.fileName || `Експорт ${job.format.toUpperCase()}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'error' ? 'destructive' :
                      'secondary'
                    }>
                      {job.status === 'completed' ? 'Завершено' :
                       job.status === 'error' ? 'Помилка' :
                       'Обробка'}
                    </Badge>
                    
                    {job.status === 'completed' && job.downloadUrl && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(job.downloadUrl!, job.fileName!)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}