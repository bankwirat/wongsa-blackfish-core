# Enable Sales Order Module

## Problem
The logs show `[App Sidebar] Enabled modules from API: []` which means no modules are enabled.

## Solution: Enable the Module

### Option 1: Via Swagger UI (Easiest)

1. **Open Swagger**: http://localhost:3000/api
2. **Authorize**:
   - Click the green "Authorize" button
   - Login via `/auth/login` endpoint first to get a token
   - Or use an existing token from browser cookies
3. **Enable Module**:
   - Find `POST /modules/{id}/enable`
   - Click "Try it out"
   - Enter `sales-order` as the `id` parameter
   - Click "Execute"
4. **Verify**:
   - Check `GET /modules` - should show `sales-order` with `enabled: true`

### Option 2: Via Browser Console (Quick)

1. **Open browser console** (F12)
2. **Run this code** (after logging in):

```javascript
// Get auth token
const token = document.cookie
  .split('; ')
  .find(row => row.startsWith('access_token='))
  ?.split('=')[1];

// Enable module
fetch('http://localhost:3000/modules/sales-order/enable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Module enabled:', data);
  // Refresh page to see changes
  window.location.reload();
})
.catch(err => console.error('❌ Error:', err));
```

### Option 3: Via API Client (Programmatic)

Add this method to test enabling:

```typescript
// In api-client.ts
async enableModule(moduleId: string): Promise<any> {
  const response = await this.client.post(`/modules/${moduleId}/enable`)
  return response.data
}

// Then call:
await apiClient.enableModule('sales-order')
```

## After Enabling

1. **Refresh the page** - plugins should load
2. **Check console** - should see:
   ```
   [Plugin Registry] Found 1 enabled module(s): ['sales-order']
   [Plugin Registry] ✅ Successfully imported sales-order plugin
   ```
3. **Check sidebar** - "Sales Orders" should appear in navigation
4. **Navigate to**: `/workspace/[slug]/sales/orders`

## Troubleshooting

If module still doesn't appear:
1. Check backend logs - should see module discovered at startup
2. Verify module exists in `packages/@wongsa/sales-order/` or `modules/sales-order/`
3. Check database - module should have `enabled: true` in `modules` table
4. Restart backend if needed

