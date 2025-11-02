# Fix: lucide-react Module Resolution

## Problem
The workspace package `@wongsa/sales-order` couldn't resolve `lucide-react` when imported from the frontend.

## Root Cause
1. Workspace package wasn't declared as a dependency in frontend's package.json
2. Next.js webpack needed explicit dependency resolution configuration
3. Old `modules/` directory still exists and might be interfering

## Solutions Applied

### 1. Added Workspace Package Dependency
**File**: `core/apps/frontend/package.json`
```json
{
  "dependencies": {
    "@wongsa/sales-order": "workspace:*"
  }
}
```

### 2. Updated Webpack Configuration
**File**: `core/apps/frontend/next.config.ts`
- Added explicit aliases for common dependencies (lucide-react, react, etc.)
- Prioritized frontend's node_modules for dependency resolution
- Added workspace packages to module resolution paths

### 3. Updated Package Peer Dependencies
**File**: `packages/@wongsa/sales-order/package.json`
- Added `lucide-react` as peerDependency
- Added `react` and `react-dom` as peerDependencies

### 4. Enhanced Plugin Registry
**File**: `core/apps/frontend/src/lib/plugin-registry.ts`
- Multiple import strategies with fallbacks
- Better error handling and logging

## Next Steps

1. **Restart the dev server** to clear Next.js cache:
   ```bash
   pnpm run kill:ports
   pnpm run dev
   ```

2. **Verify workspace symlink**:
   ```bash
   ls -la core/apps/frontend/node_modules/@wongsa/sales-order
   # Should show a symlink
   ```

3. **Check console logs** - should see:
   ```
   [Plugin Registry] ✅ Loaded via workspace package (@wongsa/sales-order/frontend)
   ```

4. **Optional: Remove old modules directory** (once verified working):
   ```bash
   rm -rf modules/sales-order
   ```

## How It Works Now

1. `@wongsa/sales-order` is symlinked in frontend's node_modules via workspace protocol
2. When importing `@wongsa/sales-order/frontend`, Next.js resolves it via the symlink
3. Dependencies like `lucide-react` resolve from frontend's node_modules (via webpack config)
4. Hot reload works immediately - no build step needed!

