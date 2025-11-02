# Enable Sales Order Module

## The Problem
The console shows `[Plugin Registry] Found 0 enabled module(s): []` - the module needs to be enabled.

## Solution: Restart Backend (Auto-Enable Works)

I've added **auto-enable in development mode**. Just restart the backend:

```bash
# Kill and restart
pnpm run kill:ports
pnpm run dev
```

You should see in backend logs:
```
🔧 Development mode: Auto-enabling 1 module(s)...
   ✅ Auto-enabled: sales-order
```

Then refresh frontend - module should load!

## Alternative: Enable Manually (If Auto-Enable Doesn't Work)

**Browser Console (F12):**

```javascript
const token = document.cookie.match(/access_token=([^;]+)/)?.[1];
fetch('http://localhost:3000/modules/sales-order/enable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Module enabled!', data);
  window.location.reload();
});
```

## Check Backend Logs

After restart, backend should show:
- `✅ Found X modules:` (should list sales-order)
- `🔧 Development mode: Auto-enabling...`
- `✅ Auto-enabled: sales-order`

If you don't see these, the backend may not have restarted with the new code.

