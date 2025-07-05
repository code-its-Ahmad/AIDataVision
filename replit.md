# ML Analytics Platform

## Overview

This is a comprehensive Machine Learning Analytics Platform built with a modern full-stack architecture. The application provides real-time ML model monitoring, data processing capabilities, AI-powered insights, and interactive dashboards for data scientists and ML engineers.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket integration for live data streaming

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Real-time Communication**: WebSocket server for live updates
- **File Processing**: Multer for handling file uploads
- **AI Integration**: Google Gemini API for intelligent insights

### ML/AI Integration
- **Client-side ML**: TensorFlow.js for browser-based model inference
- **AI Services**: Google Gemini API for pattern analysis and insights generation
- **Data Processing**: Custom ML service for dataset processing and model training simulation

## Key Components

### Database Schema
- **Users**: Authentication and role-based access
- **Datasets**: File storage metadata and processing status
- **ML Models**: Model configuration, performance metrics, and status tracking
- **Training Sessions**: Real-time training progress and hyperparameter tracking
- **Predictions**: Model inference results and batch processing
- **AI Insights**: Automated insights from Gemini API analysis
- **System Metrics**: Performance monitoring and system health

### Real-time Features
- **WebSocket Server**: Live updates for training progress, system metrics, and insights
- **Dashboard Updates**: Real-time metric updates and performance monitoring
- **Training Progress**: Live epoch tracking and loss/accuracy visualization
- **System Monitoring**: Real-time system health and resource usage

### AI-Powered Insights
- **Pattern Analysis**: Automated data pattern recognition using Gemini API
- **Model Recommendations**: AI-generated suggestions for model improvement
- **Anomaly Detection**: Intelligent identification of data anomalies
- **Training Optimization**: AI-driven hyperparameter tuning suggestions

## Data Flow

1. **Data Upload**: Users upload datasets through the web interface
2. **Processing Pipeline**: Files are processed, analyzed, and stored with metadata
3. **Model Training**: ML models are configured and trained with real-time progress tracking
4. **Inference**: Trained models make predictions on new data
5. **Analysis**: AI services analyze patterns and generate insights
6. **Visualization**: Results are displayed in interactive dashboards with real-time updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connectivity
- **@google/genai**: Google Gemini API for AI-powered insights
- **@tensorflow/tfjs**: Client-side machine learning capabilities
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI component primitives
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Static type checking and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint/Prettier**: Code quality and formatting

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Neon Database with environment-based configuration
- **Build Process**: Vite for client build, esbuild for server bundling

### Production Deployment
- **Build Command**: `npm run build` - creates optimized client and server bundles
- **Start Command**: `npm start` - runs the production server
- **Environment Variables**: DATABASE_URL, GEMINI_API_KEY required
- **Static Assets**: Served from dist/public directory

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Connection**: Pooled connections using Neon's serverless driver
- **Schema**: Centralized schema definition in shared/schema.ts

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 03, 2025. Initial setup