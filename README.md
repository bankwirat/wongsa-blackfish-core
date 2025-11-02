# Wongsa Core - Monorepo Platform

A modern SAAS platform built with Next.js 15+ and NestJS, featuring workspace management, authentication, and an Odoo-style module system.

## 🏗️ Monorepo Structure

```
wongsa-core/
├── core/                           # Base platform
│   ├── apps/
│   │   ├── backend/               # NestJS API
│   │   └── frontend/               # Next.js App
│   └── packages/
│       └── @wongsa/
│           ├── core-shared/        # Shared types & API
│           └── plugin-system/      # Plugin framework
│
└── modules/                         # Odoo-style modules
    └── sales-order/                 # Sales Order module example
        ├── manifest.json
        ├── backend/
        └── frontend/
```

## 🚀 Quick Start

### Install Dependencies
```bash
pnpm install
```

### Development
```bash
# Run core (backend + frontend)
pnpm run dev

# Or run individually
pnpm run dev:core:backend   # Backend only (Port 3000)
pnpm run dev:core:frontend  # Frontend only (Port 3001)
```

### Access Applications
- **Core Frontend**: http://localhost:3001
- **Core Backend**: http://localhost:3000

## 📦 Packages

### Core Packages (Exportable)

- **`@wongsa/core-shared`**: Types, API client, utilities
- **`@wongsa/plugin-system`**: Plugin framework and registry

## 🎯 Features

- ✅ Workspace management
- ✅ Authentication (JWT + Google OAuth)
- ✅ Odoo-style module system
- ✅ Dynamic module discovery and loading
- ✅ Type-safe shared packages

## 📦 Module System

Modules are discovered from the `modules/` directory and can be enabled/disabled dynamically:

```bash
# List all modules
GET /modules

# Enable a module
POST /modules/{moduleId}/enable

# Disable a module
POST /modules/{moduleId}/disable
```

See `modules/sales-order/` for an example module structure.

## 📚 Documentation

- `core/packages/README.md` - Package documentation

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, Prisma, PostgreSQL
- **Package Manager**: pnpm (workspaces)

## 📝 License

MIT
