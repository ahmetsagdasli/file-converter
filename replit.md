# File Converter - Document Processing Web Application

## Overview
File Converter is a comprehensive document manipulation web application that provides professional PDF processing tools and Office document conversion capabilities. Built as a full-stack TypeScript application, it offers core functionalities including PDF merging, splitting, compression, image-to-PDF conversion, PDF-to-image conversion, page reordering, and document format conversions (Word, Excel, CSV). The application emphasizes security, privacy, and user experience with a modern, accessible sidebar-based interface and dark/light mode support.

## User Preferences
- Preferred communication style: Simple, everyday language
- Application name: File Converter 
- Developer attribution: Ahmet Sağdaşlı with GitHub (https://github.com/ahmetsagdasli) and LinkedIn (https://www.linkedin.com/in/ahmet-sagdasli/) links
- Language: English-only (no Turkish translations)
- UI: Modern sidebar navigation with dark/light mode toggle
- No references to development platform in final application

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark/light mode support
- **Layout**: Modern sidebar-based navigation with responsive mobile design
- **Theme System**: Context-based theme provider with system preference detection and localStorage persistence
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state and React hooks for local state
- **Internationalization**: Simplified English-only translation system
- **File Handling**: Custom file upload components with drag-and-drop support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **File Processing**: PDF-lib for PDF manipulation, Sharp for image processing, mammoth for Word processing, xlsx for Excel/CSV operations
- **Document Services**: Comprehensive documentService with support for Word↔Excel, Document→PDF, Excel↔CSV conversions
- **File Upload**: Multer middleware with file type validation and size limits
- **Rate Limiting**: In-memory request tracking with configurable limits
- **Error Handling**: Centralized error middleware with structured responses

### Data Storage Solutions
- **Database**: PostgreSQL via Neon Database for user data and file metadata
- **File Storage**: Temporary local storage for processing with Google Cloud Storage integration
- **Session Management**: In-memory storage for processing sessions
- **File Cleanup**: TTL-based automatic deletion after 15 minutes or download

### Authentication and Authorization
- **Current State**: Basic user schema exists but authentication is not fully implemented
- **Planned**: User registration/login system with session-based authentication
- **File Access**: One-time download URLs with expiration timestamps
- **Rate Limiting**: IP-based request throttling (60 requests/minute, 120 burst)

### External Dependencies
- **Cloud Storage**: Google Cloud Storage for scalable file storage
- **Database**: Neon Database (PostgreSQL) for production data persistence
- **PDF Processing**: PDF-lib library for client-side PDF manipulation
- **Image Processing**: Sharp library for server-side image operations
- **File Upload**: Uppy.js components for enhanced upload experience
- **Development**: Vite with hot module replacement and TypeScript support

### Key Design Patterns
- **Monorepo Structure**: Shared schema and types between client and server
- **Component-Based UI**: Reusable UI components with consistent design system
- **API-First Design**: REST endpoints with structured request/response patterns
- **File Processing Pipeline**: Upload → Process → Store → Deliver → Cleanup
- **Error Boundaries**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Mobile-first approach with accessibility compliance

### Security Measures
- **File Validation**: Type checking and size limits on upload
- **Temporary Storage**: No permanent file retention, automatic cleanup
- **Rate Limiting**: Prevents abuse with configurable request limits
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Input Sanitization**: Validation of all user inputs and file parameters

### Performance Optimizations
- **Lazy Loading**: Route-based code splitting with React.lazy
- **Asset Optimization**: Vite bundling with tree-shaking and minification
- **Database Indexing**: Optimized queries with Drizzle ORM
- **File Streaming**: Efficient file processing with stream-based operations
- **Memory Management**: Cleanup of temporary files and processing artifacts