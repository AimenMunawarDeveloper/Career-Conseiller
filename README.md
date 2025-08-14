# Career Conseiller

A comprehensive AI-powered career guidance platform that helps users navigate their professional journey with personalized insights, skill analysis, and interactive tools.

## �� Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

## Overview

Career Conseiller is a full-stack web application designed to provide comprehensive career guidance and professional development tools. The platform leverages AI technologies including Google Gemini and Retell to offer personalized career advice, skill analysis, and interactive interview experiences.

## Features

### AI-Powered Chat Assistant
- **Intelligent Career Guidance**: Get personalized career advice and recommendations
- **Real-time Conversations**: Interactive chat interface powered by Google Gemini AI
- **Chat History**: Save and review previous conversations for reference

### Resume Analysis & Enhancement
- **PDF Resume Upload**: Upload and analyze your resume in PDF format
- **AI-Powered Analysis**: Get detailed feedback on resume content, structure, and optimization suggestions
- **Skill Extraction**: Automatically identify and highlight key skills from your resume

### Skill Gap Analysis
- **Comprehensive Assessment**: Analyze your current skills against industry requirements
- **Personalized Recommendations**: Get specific suggestions for skill development
- **Progress Tracking**: Monitor your skill development journey

### Career Roadmap Generator
- **Personalized Roadmaps**: Create customized career development plans
- **Step-by-Step Guidance**: Detailed pathways to achieve your career goals
- **Interactive Planning**: Visual representation of career progression

### AI-Powered Mock Interviews
- **Voice-Based Interviews**: Conduct realistic interviews using Retell's voice AI
- **Real-time Feedback**: Get instant feedback on your responses
- **Interview Practice**: Improve your interview skills with AI-powered simulations

### Latest Job Opportunities
- **Job Listings**: Browse current job openings in your field
- **Filtered Results**: Find relevant positions based on your skills and preferences
- **Application Tracking**: Keep track of job applications

### Skills Information Hub
- **Skill Database**: Comprehensive information about various professional skills
- **Learning Resources**: Access to educational materials and courses
- **Industry Insights**: Stay updated with current industry trends

### User Management
- **Secure Authentication**: JWT-based user registration and login
- **Progress Tracking**: Monitor your career development progress

## Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - User notifications
- **React Icons** - Icon library
- **React PDF** - PDF viewing and manipulation
- **React Dropzone** - File upload functionality
- **HTML2Canvas & jsPDF** - PDF generation
- **Retell Client SDK** - Voice AI integration

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud file storage
- **PDF Processing Libraries**:
  - `pdf-parse` - PDF text extraction
  - `pdf-lib` - PDF manipulation
  - `pdf2json` - PDF to JSON conversion
  - `mammoth` - DOCX processing
  - `docx` - DOCX generation

### AI & External Services
- **Google Gemini AI** - Advanced AI chat and analysis
- **Retell AI** - Voice AI for mock interviews
- **Cloudinary** - Cloud storage for file uploads

### Development & Deployment
- **Vercel** - Frontend and backend deployment
- **MongoDB Atlas** - Cloud database hosting
- **Environment Variables** - Secure configuration management

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Google Gemini API key
- Retell API key
- Cloudinary account

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm start
```

## API Endpoints

### Authentication
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile

### AI Services
- `POST /api/ai/chat` - AI chat conversations
- `POST /api/ai/analyze-resume` - Resume analysis
- `POST /api/ai/skill-gap-analysis` - Skill gap assessment

### Career Services
- `GET /api/career/information` - Career information
- `POST /api/roadmap/generate` - Generate career roadmap
- `GET /api/roadmap/user-roadmaps` - Get user roadmaps

### File Management
- `POST /api/files/upload` - File upload
- `GET /api/files/:filename` - Download files

### Voice AI
- `POST /api/retell/create-call` - Create voice call
- `POST /api/retell/end-call` - End voice call

### Chat History
- `GET /api/chat-history` - Get chat history
- `POST /api/chat-history` - Save chat message

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy frontend and backend as separate projects
4. Update CORS settings with production URLs

### Environment Setup
- Set up MongoDB Atlas cluster
- Configure Cloudinary for file storage
- Set up Google Gemini and Retell API keys
- Configure Vercel environment variables

## Author

**Aimen Munawar**
- GitHub: [@AimenMunawarDeveloper](https://github.com/AimenMunawarDeveloper)

## Acknowledgments

- Google Gemini AI for intelligent career guidance
- Retell AI for voice-based interview simulations
- MongoDB Atlas for reliable database hosting
- Vercel for seamless deployment experience
