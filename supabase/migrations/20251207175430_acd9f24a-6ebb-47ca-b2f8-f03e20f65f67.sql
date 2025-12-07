-- Create notifications table
CREATE TABLE public.nova_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.nova_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    type TEXT NOT NULL, -- 'script_uploaded', 'budget_submitted', 'scene_updated', 'cost_submitted', 'member_joined'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_scene_id UUID REFERENCES public.nova_scenes(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.nova_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.nova_notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.nova_notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.nova_notifications FOR DELETE
USING (auth.uid() = user_id);

-- Project members can insert notifications for other members
CREATE POLICY "Project members can create notifications"
ON public.nova_notifications FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL AND
    (project_id IS NULL OR public.is_project_member(auth.uid(), project_id) OR public.is_project_creator(auth.uid(), project_id))
);