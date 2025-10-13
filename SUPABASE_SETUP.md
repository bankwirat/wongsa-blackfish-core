# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be ready

## 2. Get Your Supabase Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Update Environment Variables

Edit `frontend/.env.local` and replace the placeholder values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 4. Configure Supabase Auth

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3001`
3. Under **Redirect URLs**, add: `http://localhost:3001/**`

## 5. Test the Application

1. Start the backend: `npm run dev:backend`
2. Start the frontend: `npm run dev:frontend`
3. Go to `http://localhost:3001`
4. Try registering a new account
5. Try logging in

## 6. Database Setup

The backend will automatically create user profiles in your database when users register through Supabase Auth.

## Troubleshooting

- **404 errors**: Make sure your Supabase URL and keys are correct
- **CORS errors**: Check that your Site URL and Redirect URLs are configured correctly
- **Database errors**: Ensure your `DATABASE_URL` in `backend/.env` is correct
