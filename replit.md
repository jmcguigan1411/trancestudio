# TranceForge - Browser-Based Music Production App

## Overview

TranceForge is a modern, browser-based music production application focused on trance and house music creation. The app provides a comprehensive digital audio workstation (DAW) experience with a clean, intuitive interface suitable for both beginners and experienced producers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Audio Engine**: Tone.js for Web Audio API abstraction and audio processing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with JSON responses
- **File Upload**: Multer middleware for handling audio file uploads
- **Development**: Hot module replacement with Vite integration

### Database & Storage
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Schema**: Three main entities - samples, tracks, and projects
- **File Storage**: Local filesystem for uploaded audio samples (configurable for cloud storage)

## Key Components

### Core Audio Features
1. **Sound Library**: Categorized sample browser with 1000+ preloaded sounds
2. **Sequencer**: Grid-based step sequencer with drag-and-drop functionality
3. **Mixer**: Multi-track mixing console with volume, pan, mute, and solo controls
4. **Audio Engine**: Real-time audio processing and playback using Tone.js

### UI Components
1. **Header**: Transport controls, project management, and global settings
2. **SoundLibrary**: Sample browser with category filters and search
3. **TrackList**: Track management with individual controls
4. **SequencerGrid**: Step sequencer interface with visual feedback
5. **MixerSection**: Mixing controls with custom knob components

### Data Models
- **Samples**: Audio files with metadata (category, BPM, tags, duration)
- **Tracks**: Individual sequencer tracks with effects and routing
- **Projects**: Complete arrangements with multiple tracks and global settings

## Data Flow

### Audio Processing Pipeline
1. Sample loading from filesystem or database
2. Audio buffer creation and management via Tone.js
3. Real-time playback through Web Audio API
4. Effects processing and mixing

### User Interaction Flow
1. Sample selection from library
2. Drag-and-drop to sequencer tracks
3. Step programming via grid interface
4. Real-time playback with transport controls
5. Project saving and loading

### API Communication
- RESTful endpoints for CRUD operations on samples, tracks, and projects
- File upload handling for user-contributed samples
- Real-time state synchronization between client and server

## External Dependencies

### Core Libraries
- **Tone.js**: Web Audio API abstraction for audio processing
- **Drizzle ORM**: Type-safe database operations
- **TanStack React Query**: Server state management and caching
- **Radix UI**: Accessible UI component primitives
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Build tool with HMR and optimized bundling
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production server builds

### Audio Processing
- **Web Audio API**: Browser-native audio processing
- **Multer**: File upload middleware for sample management
- **Various audio format support**: WAV, MP3, OGG file handling

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Automatic database schema updates via Drizzle Kit
- File watching and hot reloading for rapid development

### Production Build
- Vite production build for optimized client bundle
- ESBuild bundling for server-side code
- Static asset serving through Express
- Environment-based configuration for database and external services

### Database Management
- Drizzle migrations for schema versioning
- PostgreSQL with connection pooling for production
- Neon serverless database integration for scalability

### File Storage Considerations
- Local filesystem storage for development
- Configurable for cloud storage providers (S3, etc.) in production
- Audio file optimization and compression strategies