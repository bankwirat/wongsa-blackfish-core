# Auto-Enable Module on Seed

## What Changed
The seed script now automatically enables the `sales-order` module when you run `pnpm run db:seed`.

## How to Use

### Option 1: Re-run Seed (Recommended)
```bash
# This will enable the sales-order module automatically
pnpm run db:seed
```

### Option 2: Just Enable the Module (Without Re-seeding)
If you don't want to re-seed everything, you can just enable the module via:

**Browser Console:**
```javascript
fetch('http://localhost:3000/modules/sales-order/enable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${document.cookie.match(/access_token=([^;]+)/)?.[1] || ''}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Module enabled!', data);
  window.location.reload();
});
```

**Or via Swagger:** http://localhost:3000/api → `POST /modules/sales-order/enable`

## After Enabling

1. **Restart backend** (if needed) to load the module
2. **Refresh frontend** - plugin should appear
3. **Check console** - should see:
   ```
   [Plugin Registry] Found 1 enabled module(s): ['sales-order']
   ```

## For Future Modules

To auto-enable new modules, add them to `core/apps/backend/prisma/seed.ts` in the same way!

