#!/bin/bash

echo "Setting up frontend environment variables..."

# Create .env.local file for frontend
cat > frontend/.env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

echo "✅ Frontend .env.local created!"
echo ""
echo "Please update the following values in frontend/.env.local:"
echo "1. NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL"
echo "2. NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anon key"
echo ""
echo "You can find these values in your Supabase dashboard:"
echo "https://supabase.com/dashboard/project/[your-project]/settings/api"
