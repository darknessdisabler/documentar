# DocumentA® - AI-Powered Document Creation Platform

## Overview

DocumentA® is a modern web application for creating presentations and documents using AI assistance. The platform provides a modular, drag-and-drop interface where users can arrange different content types (titles, text blocks, charts, images, lists, quotes) to build professional presentations and documents. The application leverages OpenAI's GPT models to generate content automatically based on user prompts.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Animations**: Framer Motion for smooth transitions and interactions
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **Development**: Custom Vite middleware integration for HMR

### Module System
The application uses a modular content system where each module represents a different type of content:
- **Title Module**: Main headings and subtitles
- **Content Module**: Rich text blocks
- **Chart Module**: Data visualization components
- **Image Module**: Media content with alt text
- **List Module**: Bullet point or numbered lists
- **Quote Module**: Highlighted text or testimonials

## Key Components

### Data Flow
1. **User Input**: Users interact with the UI to create/edit projects or request AI-generated content
2. **API Layer**: Express routes handle CRUD operations for projects and AI service calls
3. **Storage Layer**: In-memory storage (development) with PostgreSQL schema defined for production
4. **AI Integration**: OpenAI API integration for content generation and text improvement
5. **Real-time Updates**: React Query manages cache invalidation and optimistic updates

### Authentication & Authorization
- Placeholder user system (userId: 1 hardcoded)
- Session-based authentication infrastructure ready for implementation
- User settings per-user with theme and language preferences

### Theme System
- Dynamic CSS variable-based theming
- Customizable color schemes (primary, secondary, accent)
- Font family selection
- Real-time theme application to DOM
- Persistent user preferences

### Internationalization
- Multi-language support (Ukrainian and English)
- Translation system with language switching
- Localized content generation via AI

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration toolkit
- **@tanstack/react-query**: Server state management
- **openai**: Official OpenAI API client
- **express**: Web application framework
- **@radix-ui/***: Accessible UI primitive components

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-***: Replit-specific development plugins

### UI Components
- Complete shadcn/ui component library implementation
- Custom components for modular content editing
- Drag-and-drop interface components
- Loading screens and tutorial overlays

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Express server with middleware integration
- In-memory storage for rapid prototyping
- Environment variable configuration for API keys

### Production Build
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations for schema deployment
- **Environment**: Node.js production server serving static assets and API

### Database Schema
- **Users Table**: Authentication and user management
- **Projects Table**: Document/presentation storage with JSON content
- **User Settings Table**: Theme preferences and UI configurations
- **Migration System**: Drizzle-kit for schema versioning

## Recent Changes
- June 28, 2025: Added comprehensive Electron desktop application support with main.js and preload.js
- June 28, 2025: Implemented fully interactive theme editor with color presets, live preview, and export/import
- June 28, 2025: Created animated gradient background system with 7 preset options and customization
- June 28, 2025: Built comprehensive AI model manager with language/image/multimodal categories
- June 28, 2025: Added LoRA model support with dependency tracking and requirements
- June 28, 2025: Implemented complete export system for PPTX, DOCX, and XLSX formats
- June 28, 2025: Created AI image generation service with Sharp processing and style options
- June 28, 2025: Built interactive image generator with enhancement tools and gallery
- June 28, 2025: Added model downloading progress tracking and status management
- June 28, 2025: Enhanced settings modal with 4 comprehensive tabs
- June 28, 2025: Integrated export manager with download progress and file management
- June 28, 2025: Added image editing features (resize, enhance, color adjustment)
- June 28, 2025: Implemented complete desktop app architecture with menu system

## User Preferences

Preferred communication style: Simple, everyday language (українською мовою).
Interface requirements: 
- Offline functionality without external API providers
- Customizable drag-and-drop interface with epic animations
- Full module editing capabilities
- Tutorial system with dismissible overlays
