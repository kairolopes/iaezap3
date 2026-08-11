-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  is_master BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to read all
CREATE POLICY "Admins can read all user roles" ON public.user_roles
  FOR SELECT
  USING (true);

-- Insert or update master user
INSERT INTO public.user_roles (email, role, is_master)
VALUES ('kairolopes@gmail.com', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_master = true,
  updated_at = NOW();

-- Verify the user was created
SELECT email, role, is_master FROM public.user_roles WHERE email = 'kairolopes@gmail.com';
