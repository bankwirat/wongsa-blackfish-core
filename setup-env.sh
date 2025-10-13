#!/bin/bash

echo "Setting up environment variables..."

# Create .env file for backend
cat > backend/.env << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wongsa_core"
SUPABASE_URL="your_supabase_url"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# API Configuration
API_PORT=3000
FRONTEND_URL="http://localhost:3001"

# Environment
NODE_ENV="development"
EOF

# Create .env file for frontend
cat > frontend/.env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"
EOF

echo "Environment files created!"
echo "Please update the database credentials in backend/.env"
