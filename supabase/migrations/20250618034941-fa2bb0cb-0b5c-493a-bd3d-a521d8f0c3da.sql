
-- Create a table to store platform information
CREATE TABLE public.platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the supported platforms
INSERT INTO public.platforms (name, icon, color) VALUES
  ('Codeforces', 'Code', 'bg-blue-500'),
  ('LeetCode', 'Trophy', 'bg-orange-500'),
  ('CodeChef', 'Target', 'bg-amber-600'),
  ('InterviewBit', 'Brain', 'bg-purple-500'),
  ('GeeksforGeeks', 'Zap', 'bg-green-500'),
  ('HackerRank', 'Award', 'bg-emerald-600');

-- Create a table to store student platform handles
CREATE TABLE public.student_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.platforms(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  current_rating INTEGER DEFAULT 0,
  max_rating INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  contests_participated INTEGER DEFAULT 0,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, platform_id)
);

-- Create a table to store platform scores (calculated metrics)
CREATE TABLE public.platform_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.platforms(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  avg_rating DECIMAL(8,2) DEFAULT 0,
  contests_participated INTEGER DEFAULT 0,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, platform_id)
);

-- Add RLS policies for student_platforms
ALTER TABLE public.student_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on student_platforms" 
  ON public.student_platforms 
  FOR ALL 
  USING (true);

-- Add RLS policies for platform_scores
ALTER TABLE public.platform_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on platform_scores" 
  ON public.platform_scores 
  FOR ALL 
  USING (true);

-- Add RLS policies for platforms (read-only for most users)
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to platforms" 
  ON public.platforms 
  FOR SELECT 
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_student_platforms_updated_at 
  BEFORE UPDATE ON public.student_platforms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_scores_updated_at 
  BEFORE UPDATE ON public.platform_scores 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
