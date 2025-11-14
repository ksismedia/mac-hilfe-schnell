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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accessibility_cache: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          result: Json
          url: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          result: Json
          url: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          result?: Json
          url?: string
        }
        Relationships: []
      }
      ai_review_status: {
        Row: {
          analysis_id: string
          category_name: string
          created_at: string
          id: string
          is_reviewed: boolean
          review_notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          updated_at: string
        }
        Insert: {
          analysis_id: string
          category_name: string
          created_at?: string
          id?: string
          is_reviewed?: boolean
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          updated_at?: string
        }
        Update: {
          analysis_id?: string
          category_name?: string
          created_at?: string
          id?: string
          is_reviewed?: boolean
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          ai_function: string
          ai_model: string
          analysis_id: string | null
          confidence_score: number | null
          created_at: string
          id: string
          input_data: Json | null
          output_data: Json | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          user_id: string
          was_reviewed: boolean | null
        }
        Insert: {
          ai_function: string
          ai_model: string
          analysis_id?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id: string
          was_reviewed?: boolean | null
        }
        Update: {
          ai_function?: string
          ai_model?: string
          analysis_id?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id?: string
          was_reviewed?: boolean | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_name: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_retention_settings: {
        Row: {
          auto_delete_enabled: boolean | null
          created_at: string
          id: string
          last_cleanup_at: string | null
          retention_days: number
          updated_at: string
        }
        Insert: {
          auto_delete_enabled?: boolean | null
          created_at?: string
          id?: string
          last_cleanup_at?: string | null
          retention_days?: number
          updated_at?: string
        }
        Update: {
          auto_delete_enabled?: boolean | null
          created_at?: string
          id?: string
          last_cleanup_at?: string | null
          retention_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      saved_analyses: {
        Row: {
          business_data: Json
          created_at: string
          id: string
          manual_data: Json
          name: string
          real_data: Json
          saved_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_data: Json
          created_at?: string
          id?: string
          manual_data: Json
          name: string
          real_data: Json
          saved_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_data?: Json
          created_at?: string
          id?: string
          manual_data?: Json
          name?: string
          real_data?: Json
          saved_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_consent: {
        Row: {
          consent_type: string
          consent_version: string
          consented_at: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          consent_version: string
          consented_at?: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          consent_version?: string
          consented_at?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_accessibility_cache: { Args: never; Returns: undefined }
      cleanup_old_data: { Args: never; Returns: undefined }
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
