# Wongsa Core

A modern SAAS platform built with Next.js 15+ and NestJS, featuring workspace management, authentication, and a beautiful UI.

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui
- **UI Primitives**: Radix UI
- **Icons**: Lucide React
- **Build Tool**: Turbopack (Next.js)

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Class Validator
- **Serialization**: Class Transformer
- **Authentication**: PassportJS + JWT

## 📁 Project Structure

```
wongsa-core/
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package.json for workspace
├── README.md                    # This file
├── backend/                     # NestJS Backend
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   ├── users/              # Users module
│   │   ├── workspaces/         # Workspaces module
│   │   ├── prisma/             # Prisma service
│   │   └── main.ts             # Application entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── package.json
└── frontend/                    # Next.js Frontend
    ├── src/
    │   ├── app/                # App Router pages
    │   ├── components/         # React components
    │   ├── lib/                # Utilities and API client
    │   └── types/              # TypeScript types
    └── package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+
- PostgreSQL database (or Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wongsa-core
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API keys
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # (Optional) Seed the database
   npm run db:seed
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Backend API on `http://localhost:3000`
- Frontend on `http://localhost:3001`
- Swagger documentation on `http://localhost:3000/api`

## 📚 API Documentation

Once the backend is running, you can access the Swagger documentation at `http://localhost:3000/api`.

## 🗄️ Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **User**: User accounts with authentication
- **Workspace**: Team workspaces
- **WorkspaceMember**: Many-to-many relationship between users and workspaces

## 🔐 Authentication

The application uses JWT-based authentication with:
- User registration and login
- Protected routes
- Role-based access control for workspaces

## 🎨 UI Components

Built with shadcn/ui and Radix UI primitives:
- Responsive design
- Dark mode support
- Accessible components
- Modern animations

## 📝 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications
- `npm run start` - Start both applications in production mode
- `npm run install:all` - Install dependencies for all workspaces

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database

### Linting & Type Checking
- `npm run lint` - Lint all code
- `npm run type-check` - Type check all TypeScript code

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build:backend`
2. Set up environment variables
3. Run database migrations
4. Start the application: `npm run start:backend`

### Frontend Deployment
1. Build the application: `npm run build:frontend`
2. Deploy the `frontend/out` directory to your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.