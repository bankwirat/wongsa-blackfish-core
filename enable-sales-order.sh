#!/bin/bash
echo "🔧 Enabling sales-order module..."

# Check if backend is running
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
  echo "❌ Backend is not running on port 3000"
  echo "   Please start the backend first: pnpm run dev:core:backend"
  exit 1
fi

# Try to enable via direct database update (if backend API needs auth)
echo "💡 Option 1: Enable via API (requires authentication)"
echo "   Run this in browser console:"
echo ""
echo "   fetch('http://localhost:3000/modules/sales-order/enable', {"
echo "     method: 'POST',"
echo "     headers: {"
echo "       'Authorization': \`Bearer \${document.cookie.match(/access_token=([^;]+)/)?.[1]}\`,"
echo "       'Content-Type': 'application/json'"
echo "     }"
echo "   }).then(r => r.json()).then(d => { console.log('✅', d); window.location.reload(); });"
echo ""
echo "💡 Option 2: Re-run seed script"
echo "   pnpm run db:seed"
echo ""
echo "💡 Option 3: Enable directly in database"
echo "   This will enable it immediately without restarting backend"
