export interface Profile {
  id: string;
  user_id: string;
  email: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  passkey: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: Profile;
  nova_projects?: Project;
}

export interface Scene {
  id: string;
  project_id: string;
  scene_number: number;
  heading?: string;
  content?: string;
  location_type?: string;
  specific_location?: string;
  time_of_day?: string;
  characters_present?: string;
  speaking_roles?: string;
  extras?: string;
  functional_props?: string;
  decorative_props?: string;
  camera_movement?: string;
  framing?: string;
  lighting?: string;
  lighting_mood?: string;
  diegetic_sounds?: string;
  scene_mood?: string;
  emotional_arc?: string;
  primary_action?: string;
  pacing?: string;
  shoot_type?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetEntry {
  id: string;
  project_id: string;
  scene_id: string;
  department: string;
  estimated_cost: number;
  actual_cost: number;
  proof_reason?: string;
  proof_url?: string;
  submitted_by: string;
  is_finalized: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShootDay {
  id: string;
  project_id: string;
  shoot_date: string;
  status: string;
  notes?: string;
  created_at: string;
  nova_day_scenes?: DayScene[];
}

export interface DayScene {
  id: string;
  shoot_day_id: string;
  scene_id: string;
  scene_status: string;
  call_time?: string;
  created_at: string;
  nova_scenes?: Scene;
}

// Role mappings
export const MANAGER_ROLES = [
  'Producer',
  'Executive Producer',
  'Line Producer',
  'Director',
  'Production Manager',
  'Assistant Director'
];

export const DEPARTMENTS = [
  'Camera',
  'Lighting',
  'Sound',
  'Art Department',
  'Costumes',
  'Makeup & Hair',
  'Props',
  'Location',
  'Cast',
  'Crew',
  'Equipment Rental',
  'Transportation',
  'Catering',
  'Post-Production',
  'VFX',
  'Music',
  'Insurance',
  'Permits',
  'Miscellaneous'
];

export const ROLE_TO_DEPARTMENT: Record<string, string> = {
  'Director of Photography': 'Camera',
  'Camera Operator': 'Camera',
  '1st AC': 'Camera',
  '2nd AC': 'Camera',
  'DIT': 'Camera',
  'Steadicam Operator': 'Camera',
  'Drone Operator': 'Camera',
  'Gaffer': 'Lighting',
  'Best Boy Electric': 'Lighting',
  'Electrician': 'Lighting',
  'Key Grip': 'Lighting',
  'Best Boy Grip': 'Lighting',
  'Dolly Grip': 'Lighting',
  'Production Sound Mixer': 'Sound',
  'Boom Operator': 'Sound',
  'Sound Assistant': 'Sound',
  'Sound Designer': 'Sound',
  'Production Designer': 'Art Department',
  'Art Director': 'Art Department',
  'Set Designer': 'Art Department',
  'Set Decorator': 'Art Department',
  'Construction Coordinator': 'Art Department',
  'Props Master': 'Props',
  'Costume Designer': 'Costumes',
  'Wardrobe Supervisor': 'Costumes',
  'Makeup Department Head': 'Makeup & Hair',
  'Hair Department Head': 'Makeup & Hair',
  'Special Effects Makeup': 'Makeup & Hair',
  'Editor': 'Post-Production',
  'Assistant Editor': 'Post-Production',
  'Colorist': 'Post-Production',
  'VFX Supervisor': 'VFX',
  'VFX Artist': 'VFX',
  'Compositor': 'VFX',
  'Location Manager': 'Location',
  'Location Scout': 'Location'
};

export const ALL_ROLES = [
  // Leadership
  'Producer', 'Executive Producer', 'Line Producer', 'Director', 'Assistant Director',
  // Production
  'Production Manager', 'Production Coordinator', 'Production Assistant',
  // Camera
  'Director of Photography', 'Camera Operator', '1st AC', '2nd AC', 'DIT', 'Steadicam Operator', 'Drone Operator',
  // Lighting
  'Gaffer', 'Best Boy Electric', 'Electrician', 'Key Grip', 'Best Boy Grip', 'Dolly Grip',
  // Sound
  'Production Sound Mixer', 'Boom Operator', 'Sound Assistant', 'Sound Designer',
  // Art
  'Production Designer', 'Art Director', 'Set Designer', 'Set Decorator', 'Construction Coordinator',
  // Costume & Makeup
  'Costume Designer', 'Wardrobe Supervisor', 'Makeup Department Head', 'Hair Department Head', 'Special Effects Makeup',
  // Post-Production
  'Editor', 'Assistant Editor', 'Colorist', 'VFX Supervisor', 'VFX Artist', 'Compositor',
  // Creative
  'Writer', 'Storyboard Artist', 'Concept Artist',
  // Other
  'Location Manager', 'Location Scout', 'Casting Director', 'Stunt Coordinator', 'Choreographer',
  'Composer', 'Publicist', 'Still Photographer', 'Props Master', 'Viewer'
];
