# Quick Fix: Enable Sales Order Module

## The Issue
The console shows `[App Sidebar] Enabled modules from API: []` - the module exists but isn't enabled.

## Quick Fix (Browser Console)

1. **Open browser console** (F12)
2. **Run this code**:

```javascript
// Enable the sales-order module
fetch('http://localhost:3000/modules/sales-order/enable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${document.cookie.match(/access_token=([^;]+)/)?.[1] || ''}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Module enabled:', data);
  alert('Module enabled! Refreshing page...');
  window.location.reload();
})
.catch(err => {
  console.error('❌ Error enabling module:', err);
  alert('Error: ' + err.message);
});
```

## Or Use Swagger UI

1. Go to: http://localhost:3000/api
2. Authorize with your JWT token (from browser cookies)
3. POST `/modules/sales-order/enable`
4. Refresh the frontend page

## After Enabling

The module should appear in the sidebar and `/workspace/[slug]/sales/orders` should work!

