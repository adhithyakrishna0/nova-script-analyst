export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      nova_budget_tracking: {
        Row: {
          actual_cost: number | null
          created_at: string
          department: string
          estimated_cost: number | null
          id: string
          is_finalized: boolean | null
          project_id: string
          proof_reason: string | null
          proof_url: string | null
          scene_id: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          created_at?: string
          department: string
          estimated_cost?: number | null
          id?: string
          is_finalized?: boolean | null
          project_id: string
          proof_reason?: string | null
          proof_url?: string | null
          scene_id: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          created_at?: string
          department?: string
          estimated_cost?: number | null
          id?: string
          is_finalized?: boolean | null
          project_id?: string
          proof_reason?: string | null
          proof_url?: string | null
          scene_id?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nova_budget_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "nova_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nova_budget_tracking_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "nova_scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_day_scenes: {
        Row: {
          call_time: string | null
          created_at: string
          id: string
          scene_id: string
          scene_status: string | null
          shoot_day_id: string
        }
        Insert: {
          call_time?: string | null
          created_at?: string
          id?: string
          scene_id: string
          scene_status?: string | null
          shoot_day_id: string
        }
        Update: {
          call_time?: string | null
          created_at?: string
          id?: string
          scene_id?: string
          scene_status?: string | null
          shoot_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nova_day_scenes_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "nova_scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nova_day_scenes_shoot_day_id_fkey"
            columns: ["shoot_day_id"]
            isOneToOne: false
            referencedRelation: "nova_shoot_days"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          project_id: string | null
          related_scene_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          project_id?: string | null
          related_scene_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          project_id?: string | null
          related_scene_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nova_notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "nova_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nova_notifications_related_scene_id_fkey"
            columns: ["related_scene_id"]
            isOneToOne: false
            referencedRelation: "nova_scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_project_members: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nova_project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "nova_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_projects: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          name: string
          passkey: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          name: string
          passkey: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          name?: string
          passkey?: string
          updated_at?: string
        }
        Relationships: []
      }
      nova_scenes: {
        Row: {
          camera_movement: string | null
          characters_present: string | null
          content: string | null
          created_at: string
          decorative_props: string | null
          diegetic_sounds: string | null
          emotional_arc: string | null
          extras: string | null
          framing: string | null
          functional_props: string | null
          heading: string | null
          id: string
          lighting: string | null
          lighting_mood: string | null
          location_type: string | null
          pacing: string | null
          primary_action: string | null
          project_id: string
          scene_mood: string | null
          scene_number: number
          shoot_type: string | null
          speaking_roles: string | null
          specific_location: string | null
          status: string | null
          time_of_day: string | null
          updated_at: string
        }
        Insert: {
          camera_movement?: string | null
          characters_present?: string | null
          content?: string | null
          created_at?: string
          decorative_props?: string | null
          diegetic_sounds?: string | null
          emotional_arc?: string | null
          extras?: string | null
          framing?: string | null
          functional_props?: string | null
          heading?: string | null
          id?: string
          lighting?: string | null
          lighting_mood?: string | null
          location_type?: string | null
          pacing?: string | null
          primary_action?: string | null
          project_id: string
          scene_mood?: string | null
          scene_number?: number
          shoot_type?: string | null
          speaking_roles?: string | null
          specific_location?: string | null
          status?: string | null
          time_of_day?: string | null
          updated_at?: string
        }
        Update: {
          camera_movement?: string | null
          characters_present?: string | null
          content?: string | null
          created_at?: string
          decorative_props?: string | null
          diegetic_sounds?: string | null
          emotional_arc?: string | null
          extras?: string | null
          framing?: string | null
          functional_props?: string | null
          heading?: string | null
          id?: string
          lighting?: string | null
          lighting_mood?: string | null
          location_type?: string | null
          pacing?: string | null
          primary_action?: string | null
          project_id?: string
          scene_mood?: string | null
          scene_number?: number
          shoot_type?: string | null
          speaking_roles?: string | null
          specific_location?: string | null
          status?: string | null
          time_of_day?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nova_scenes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "nova_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_shoot_days: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          project_id: string
          shoot_date: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          project_id: string
          shoot_date: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string
          shoot_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nova_shoot_days_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "nova_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_project_creator: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      join_project_with_passkey: {
        Args: { p_passkey: string; p_project_name: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
