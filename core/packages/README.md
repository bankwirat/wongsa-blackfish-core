# @wongsa Packages

This directory contains the exportable base modules for Wongsa Core platform.

## 📦 Available Packages

### `@wongsa/core-shared`
Shared types, utilities, and API client.

**Usage:**
```typescript
import { User, Workspace, ApiClient } from '@wongsa/core-shared'
import type { LoginRequest, AuthResponse } from '@wongsa/core-shared'
```

**Exports:**
- Types (`./types`)
- API Client (`./api-client`)

---

### `@wongsa/plugin-system`
Plugin framework for workspace modules.

**Usage:**
```typescript
import { PluginRegistry, pluginRegistry } from '@wongsa/plugin-system'
import type { PluginModule } from '@wongsa/plugin-system'
```

**Exports:**
- Plugin Types (`./types`)
- Plugin Registry (`./registry`)

---

## 🚀 Using in Another Project

### As Git Submodule:

```bash
# Add as submodule
git submodule add https://github.com/your-org/wongsa-core.git packages/wongsa-core
```

**In package.json:**
```json
{
  "dependencies": {
    "@wongsa/core-shared": "file:../packages/wongsa-core/packages/core-shared",
    "@wongsa/plugin-system": "file:../packages/wongsa-core/packages/plugin-system"
  }
}
```

**Import:**
```typescript
import { ApiClient } from '@wongsa/core-shared'
import { pluginRegistry } from '@wongsa/plugin-system'
```

---

## 📁 Package Structure

Each package follows this structure:

```
package-name/
├── src/
│   ├── index.ts           # Main exports
│   └── ...                # Source files
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript config
└── README.md              # Package docs (optional)
```

---

## 🔧 Development

### Install dependencies:
```bash
pnpm install
```

### Build packages:
```bash
cd packages/@wongsa/core-shared
pnpm build
```

### Use in apps:
Packages are linked via workspace protocol: `workspace:*`

