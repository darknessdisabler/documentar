export interface Module {
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

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface Project {
  id: number;
  title: string;
  type: 'presentation' | 'document';
  content: {
    modules: Module[];
    theme: Theme;
  };
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: number;
  userId: number;
  theme: Theme;
  language: 'uk' | 'en';
  layout?: any;
}

export type Language = 'uk' | 'en';
