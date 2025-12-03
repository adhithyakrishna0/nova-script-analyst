-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Viewer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nova_projects table
CREATE TABLE public.nova_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    passkey TEXT NOT NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(name)
);

-- Create nova_project_members table
CREATE TABLE public.nova_project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.nova_projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Viewer',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- Create nova_scenes table
CREATE TABLE public.nova_scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.nova_projects(id) ON DELETE CASCADE NOT NULL,
    scene_number INTEGER NOT NULL DEFAULT 1,
    heading TEXT,
    content TEXT,
    location_type TEXT DEFAULT 'INT',
    specific_location TEXT,
    time_of_day TEXT DEFAULT 'DAY',
    characters_present TEXT,
    speaking_roles TEXT,
    extras TEXT,
    functional_props TEXT,
    decorative_props TEXT,
    camera_movement TEXT,
    framing TEXT,
    lighting TEXT,
    lighting_mood TEXT,
    diegetic_sounds TEXT,
    scene_mood TEXT,
    emotional_arc TEXT,
    primary_action TEXT,
    pacing TEXT,
    shoot_type TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nova_budget_tracking table with proper structure to prevent duplicates
CREATE TABLE public.nova_budget_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.nova_projects(id) ON DELETE CASCADE NOT NULL,
    scene_id UUID REFERENCES public.nova_scenes(id) ON DELETE CASCADE NOT NULL,
    department TEXT NOT NULL,
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    proof_reason TEXT,
    proof_url TEXT,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_finalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    -- Prevent duplicate entries per scene/department/user
    UNIQUE(scene_id, department, submitted_by)
);

-- Create nova_shoot_days table
CREATE TABLE public.nova_shoot_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.nova_projects(id) ON DELETE CASCADE NOT NULL,
    shoot_date DATE NOT NULL,
    status TEXT DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(project_id, shoot_date)
);

-- Create nova_day_scenes table
CREATE TABLE public.nova_day_scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shoot_day_id UUID REFERENCES public.nova_shoot_days(id) ON DELETE CASCADE NOT NULL,
    scene_id UUID REFERENCES public.nova_scenes(id) ON DELETE CASCADE NOT NULL,
    scene_status TEXT DEFAULT 'planned',
    call_time TIME,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(shoot_day_id, scene_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_shoot_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_day_scenes ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check project membership
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.nova_project_members
    WHERE user_id = _user_id
      AND project_id = _project_id
  )
$$;

-- Create function to check if user is project creator
CREATE OR REPLACE FUNCTION public.is_project_creator(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.nova_projects
    WHERE id = _project_id
      AND creator_id = _user_id
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for nova_projects
CREATE POLICY "Users can view projects they created or are members of"
ON public.nova_projects FOR SELECT
TO authenticated
USING (
    creator_id = auth.uid() OR 
    public.is_project_member(auth.uid(), id)
);

CREATE POLICY "Users can create projects"
ON public.nova_projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their projects"
ON public.nova_projects FOR UPDATE
TO authenticated
USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete their projects"
ON public.nova_projects FOR DELETE
TO authenticated
USING (creator_id = auth.uid());

-- RLS Policies for nova_project_members
CREATE POLICY "Users can view members of their projects"
ON public.nova_project_members FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR 
    public.is_project_member(auth.uid(), project_id) OR
    public.is_project_creator(auth.uid(), project_id)
);

CREATE POLICY "Users can join projects"
ON public.nova_project_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave projects"
ON public.nova_project_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for nova_scenes
CREATE POLICY "Project members can view scenes"
ON public.nova_scenes FOR SELECT
TO authenticated
USING (
    public.is_project_member(auth.uid(), project_id) OR
    public.is_project_creator(auth.uid(), project_id)
);

CREATE POLICY "Project creators can insert scenes"
ON public.nova_scenes FOR INSERT
TO authenticated
WITH CHECK (public.is_project_creator(auth.uid(), project_id));

CREATE POLICY "Project creators can update scenes"
ON public.nova_scenes FOR UPDATE
TO authenticated
USING (public.is_project_creator(auth.uid(), project_id));

CREATE POLICY "Project creators can delete scenes"
ON public.nova_scenes FOR DELETE
TO authenticated
USING (public.is_project_creator(auth.uid(), project_id));

-- RLS Policies for nova_budget_tracking
CREATE POLICY "Project members can view budget"
ON public.nova_budget_tracking FOR SELECT
TO authenticated
USING (
    public.is_project_member(auth.uid(), project_id) OR
    public.is_project_creator(auth.uid(), project_id)
);

CREATE POLICY "Project members can insert budget"
ON public.nova_budget_tracking FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = submitted_by AND
    (public.is_project_member(auth.uid(), project_id) OR
     public.is_project_creator(auth.uid(), project_id))
);

CREATE POLICY "Users can update their own budget entries"
ON public.nova_budget_tracking FOR UPDATE
TO authenticated
USING (auth.uid() = submitted_by);

CREATE POLICY "Users can delete their own budget entries"
ON public.nova_budget_tracking FOR DELETE
TO authenticated
USING (auth.uid() = submitted_by);

-- RLS Policies for nova_shoot_days
CREATE POLICY "Project members can view shoot days"
ON public.nova_shoot_days FOR SELECT
TO authenticated
USING (
    public.is_project_member(auth.uid(), project_id) OR
    public.is_project_creator(auth.uid(), project_id)
);

CREATE POLICY "Project creators can manage shoot days"
ON public.nova_shoot_days FOR ALL
TO authenticated
USING (public.is_project_creator(auth.uid(), project_id));

-- RLS Policies for nova_day_scenes
CREATE POLICY "Users can view day scenes if member of project"
ON public.nova_day_scenes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.nova_shoot_days sd
        WHERE sd.id = shoot_day_id
        AND (public.is_project_member(auth.uid(), sd.project_id) OR
             public.is_project_creator(auth.uid(), sd.project_id))
    )
);

CREATE POLICY "Project creators can manage day scenes"
ON public.nova_day_scenes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.nova_shoot_days sd
        WHERE sd.id = shoot_day_id
        AND public.is_project_creator(auth.uid(), sd.project_id)
    )
);

-- Create function for joining projects with passkey
CREATE OR REPLACE FUNCTION public.join_project_with_passkey(
    p_project_name TEXT,
    p_passkey TEXT,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_project RECORD;
    v_existing RECORD;
    v_profile RECORD;
BEGIN
    -- Find the project
    SELECT * INTO v_project
    FROM public.nova_projects
    WHERE name = p_project_name AND passkey = p_passkey;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid project name or passkey');
    END IF;
    
    -- Check if already a member
    SELECT * INTO v_existing
    FROM public.nova_project_members
    WHERE project_id = v_project.id AND user_id = p_user_id;
    
    IF FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'You are already a member of this project');
    END IF;
    
    -- Get user profile for role
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE user_id = p_user_id;
    
    -- Add as member
    INSERT INTO public.nova_project_members (project_id, user_id, role)
    VALUES (v_project.id, p_user_id, COALESCE(v_profile.role, 'Viewer'));
    
    RETURN jsonb_build_object(
        'success', true,
        'project', jsonb_build_object('id', v_project.id, 'name', v_project.name)
    );
END;
$$;

-- Create storage bucket for proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('nova-proofs', 'nova-proofs', true);

-- Storage policies for nova-proofs bucket
CREATE POLICY "Authenticated users can upload proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'nova-proofs');

CREATE POLICY "Anyone can view proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'nova-proofs');

CREATE POLICY "Users can delete their own proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'nova-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nova_projects_updated_at
    BEFORE UPDATE ON public.nova_projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nova_scenes_updated_at
    BEFORE UPDATE ON public.nova_scenes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nova_budget_tracking_updated_at
    BEFORE UPDATE ON public.nova_budget_tracking
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();