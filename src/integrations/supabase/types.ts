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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          scene: string
          text: string
          user_id: string
          world_code: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          scene?: string
          text: string
          user_id: string
          world_code?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          scene?: string
          text?: string
          user_id?: string
          world_code?: string | null
        }
        Relationships: []
      }
      couple_meta: {
        Row: {
          anniversary_date: string
          couple_name: string | null
          her_site_url: string | null
          id: number
        }
        Insert: {
          anniversary_date?: string
          couple_name?: string | null
          her_site_url?: string | null
          id?: number
        }
        Update: {
          anniversary_date?: string
          couple_name?: string | null
          her_site_url?: string | null
          id?: number
        }
        Relationships: []
      }
      gifts: {
        Row: {
          created_at: string
          from_user: string
          gift_type: string
          id: string
          message: string | null
          opened: boolean
          scene: string
          world_code: string | null
          x: number
          y: number
        }
        Insert: {
          created_at?: string
          from_user: string
          gift_type?: string
          id?: string
          message?: string | null
          opened?: boolean
          scene?: string
          world_code?: string | null
          x: number
          y: number
        }
        Update: {
          created_at?: string
          from_user?: string
          gift_type?: string
          id?: string
          message?: string | null
          opened?: boolean
          scene?: string
          world_code?: string | null
          x?: number
          y?: number
        }
        Relationships: []
      }
      missions_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          mission_id: string
          progress: number
          updated_at: string
          world_code: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          mission_id: string
          progress?: number
          updated_at?: string
          world_code: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          mission_id?: string
          progress?: number
          updated_at?: string
          world_code?: string
        }
        Relationships: []
      }
      pet_state: {
        Row: {
          happiness: number
          hunger: number
          last_fed: string
          last_pet: string
          name: string
          updated_at: string
          world_code: string
          x: number
          y: number
        }
        Insert: {
          happiness?: number
          hunger?: number
          last_fed?: string
          last_pet?: string
          name?: string
          updated_at?: string
          world_code: string
          x?: number
          y?: number
        }
        Update: {
          happiness?: number
          hunger?: number
          last_fed?: string
          last_pet?: string
          name?: string
          updated_at?: string
          world_code?: string
          x?: number
          y?: number
        }
        Relationships: []
      }
      player_state: {
        Row: {
          direction: string
          holding_hands: boolean
          is_online: boolean
          last_seen: string
          scene: string
          updated_at: string
          user_id: string
          world_code: string | null
          x: number
          y: number
        }
        Insert: {
          direction?: string
          holding_hands?: boolean
          is_online?: boolean
          last_seen?: string
          scene?: string
          updated_at?: string
          user_id: string
          world_code?: string | null
          x?: number
          y?: number
        }
        Update: {
          direction?: string
          holding_hands?: boolean
          is_online?: boolean
          last_seen?: string
          scene?: string
          updated_at?: string
          user_id?: string
          world_code?: string | null
          x?: number
          y?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_color: string
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          avatar_color?: string
          created_at?: string
          display_name?: string
          id: string
        }
        Update: {
          avatar_color?: string
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      story_progress: {
        Row: {
          chapter_id: number
          unlocked: boolean
          unlocked_at: string | null
          world_code: string
        }
        Insert: {
          chapter_id: number
          unlocked?: boolean
          unlocked_at?: string | null
          world_code: string
        }
        Update: {
          chapter_id?: number
          unlocked?: boolean
          unlocked_at?: string | null
          world_code?: string
        }
        Relationships: []
      }
      wall_notes: {
        Row: {
          color: string
          created_at: string
          id: string
          text: string
          user_id: string
          world_code: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          text: string
          user_id: string
          world_code?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          text?: string
          user_id?: string
          world_code?: string | null
        }
        Relationships: []
      }
      worlds: {
        Row: {
          code: string
          created_at: string
          created_by: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
