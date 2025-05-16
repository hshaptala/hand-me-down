# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Hand Me Down frontend application.

## Prerequisites

1. Create a Supabase account (https://app.supabase.com/)
2. Create a new project in Supabase
3. Get your project URL and anon key from the Supabase dashboard

## Setup Steps

1. **Create .env file**

   Copy the `.env.example` file to create a new file named `.env`:

   ```bash
   cp .env.example .env
   ```

   Then, add your Supabase URL and anon key to the `.env` file:

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Enable Email Auth in Supabase**

   In your Supabase dashboard:
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure email templates if desired

3. **Configure Email Confirmation Settings (Optional)**

   By default, Supabase requires email confirmation. You can modify this in:
   - Authentication > Settings > Email auth
   - Disable or enable "Confirm Email" based on your requirements

4. **Start the application**

   ```bash
   npm run dev
   ```

## Authentication Flow

The application provides the following authentication features:

- **Registration**: Users can sign up with email/password
- **Login**: Users can sign in with email/password
- **Protected Routes**: Certain routes require authentication
- **User Profile**: Access user data after authentication
- **Sign Out**: Users can log out

## Authentication Context Usage

The application uses a React context for authentication:

```tsx
import { useAuth } from '@/context/auth-context';

function MyComponent() {
  const { user, signIn, signUp, signOut, loading } = useAuth();

  // Check if user is authenticated
  if (user) {
    // User is logged in
    console.log(user.email);
    console.log(user.user_metadata); // Access first_name, last_name
  }

  // Sign out
  const handleSignOut = () => {
    signOut();
  };

  return (
    // Your component JSX
  );
}
```

## Supabase User Metadata

When registering users, we store first and last name in user metadata:

```tsx
// Access user metadata
const firstName = user?.user_metadata?.first_name;
const lastName = user?.user_metadata?.last_name;
```

## Customization

You can extend the authentication system by:

1. Adding social login providers (Google, Facebook, etc.)
2. Implementing password reset functionality
3. Adding multi-factor authentication
4. Creating custom user roles and permissions
