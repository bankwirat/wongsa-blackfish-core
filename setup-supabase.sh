#!/bin/bash

echo "🔗 Setting up Supabase connection..."
echo ""

echo "Please follow these steps:"
echo ""
echo "1. Go to your Supabase project: https://supabase.com/dashboard"
echo "2. Navigate to Settings → Database"
echo "3. Copy the Connection String (it looks like: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres)"
echo "4. Also go to Settings → API and copy:"
echo "   - URL (for SUPABASE_URL)"
echo "   - anon public key (for SUPABASE_ANON_KEY)"
echo "   - service_role key (for SUPABASE_SERVICE_ROLE_KEY)"
echo ""

# Create .env file template
cat > backend/.env << 'EOF'
# Database - Replace with your Supabase connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# JWT Secret (already generated)
JWT_SECRET="your-jwt-secret-here"

# Supabase Configuration - Replace with your actual values
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
EOF

echo "✅ Created backend/.env template"
echo ""
echo "📝 Now edit backend/.env and replace the placeholder values with your actual Supabase credentials"
echo ""
echo "After updating the .env file, run:"
echo "  cd backend && npx prisma migrate dev --name init"
echo "  cd backend && npx prisma db seed"
echo ""
