#!/bin/bash
echo "🔍 Checking Sales Order Module Status"
echo ""
echo "1. Checking if module exists in filesystem..."
if [ -f "modules/sales-order/manifest.json" ]; then
  echo "   ✅ Module manifest found"
  cat modules/sales-order/manifest.json | grep -E '"name"|"id"|"route"'
else
  echo "   ❌ Module manifest not found!"
fi

echo ""
echo "2. To enable the module, run:"
echo "   curl -X POST http://localhost:3000/modules/sales-order/enable \\"
echo "     -H 'Authorization: Bearer YOUR_TOKEN'"
echo ""
echo "3. Or check Swagger UI: http://localhost:3000/api"
echo "   Then POST /modules/sales-order/enable"
