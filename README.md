# TaskFlow - Modern Task Management Platform

A modern, full-stack task management application built with Next.js 16, featuring real-time collaboration, comprehensive project management capabilities, and a beautiful user interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192)

## Features

### Core Functionality
- **Complete CRUD Operations**: Create, Read, Update, and Delete tasks, projects, and comments
- **Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Project Management**: Organize tasks into projects with team collaboration
- **Task Management**: Full-featured task system with priorities, statuses, due dates, and assignments
- **Analytics Dashboard**: Real-time insights into task completion, team productivity, and project progress

### Smart Features
- **Intelligent Organization**: Smart task categorization and priority management
- **Advanced Filtering**: Multiple filter options for efficient task management
- **Quick Search**: Fast full-text search across tasks and projects

### Advanced Features
- **Real-time Updates**: Optimistic UI updates for instant feedback
- **Activity Feed**: Track all team activities and changes
- **Comment System**: Collaborative discussions on tasks
- **Advanced Filtering**: Filter tasks by status, priority, project, and assignee
- **Search Functionality**: Full-text search across tasks and projects
- **Responsive Design**: Mobile-first UI that works on all devices

## Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router and Server Components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible component library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Next-generation ORM for PostgreSQL
- **NextAuth.js**: Authentication for Next.js
- **Zod**: Schema validation

### AI Integration
- **OpenAI GPT-4**: AI-powered task suggestions
- **Vercel AI SDK**: Streaming AI responses

### Database
- **PostgreSQL**: Reliable relational database

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- OpenAI API key (optional - AI features will be disabled if not provided)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # AI (Optional - leave empty to disable AI features)
   OPENAI_API_KEY=""
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
my-project/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── api/              # API routes
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── auth/             # Authentication components
│   │   └── layout/           # Layout components
│   ├── lib/
│   │   ├── auth/             # Authentication logic
│   │   ├── prisma.ts         # Prisma client
│   │   └── utils.ts          # Utility functions
│   └── types/                # TypeScript type definitions
└── package.json
```

## API Documentation

### Tasks API
- `GET /api/tasks` - Get all tasks with filtering
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get a single task
- `PATCH /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task

### Projects API
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update a project
- `DELETE /api/projects/[id]` - Delete a project

### AI API
- `POST /api/ai/suggest-tasks` - Generate AI task suggestions

### Analytics API
- `GET /api/analytics` - Get dashboard analytics

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import to [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

### Environment Variables for Production
Make sure to set all required environment variables in your deployment platform.

## Security

- JWT-based authentication with NextAuth.js
- Password hashing with bcrypt
- SQL injection protection with Prisma
- XSS protection with React
- CSRF protection built-in

## Performance

- Server Components by default
- Automatic code splitting
- Database indexing
- Image optimization
- API route caching

## Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

---

Built with ❤️ using Next.js 16, TypeScript, and modern web technologies
