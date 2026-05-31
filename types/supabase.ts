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
      ai_events: {
        Row: {
          cached: boolean
          created_at: string
          credits_used: number
          error_message: string | null
          feature: string
          id: string
          input_tokens: number | null
          latency_ms: number | null
          metadata: Json | null
          model: string
          output_tokens: number | null
          provider: string
          resume_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          cached?: boolean
          created_at?: string
          credits_used?: number
          error_message?: string | null
          feature: string
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json | null
          model: string
          output_tokens?: number | null
          provider: string
          resume_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          cached?: boolean
          created_at?: string
          credits_used?: number
          error_message?: string | null
          feature?: string
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json | null
          model?: string
          output_tokens?: number | null
          provider?: string
          resume_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_events_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_packages: {
        Row: {
          active: boolean
          created_at: string
          credits: number
          currency: string
          id: string
          metadata: Json | null
          name: string
          price: number
          razorpay_plan_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          credits: number
          currency?: string
          id?: string
          metadata?: Json | null
          name: string
          price: number
          razorpay_plan_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          credits?: number
          currency?: string
          id?: string
          metadata?: Json | null
          name?: string
          price?: number
          razorpay_plan_id?: string | null
        }
        Relationships: []
      }
      credits_ledger: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: string
          metadata: Json | null
          reason: string
          related_entity_id: string | null
          related_entity_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reason: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parse_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_used: number | null
          error_message: string | null
          external_job_id: string | null
          failed_at: string | null
          id: string
          metadata: Json | null
          pages_count: number | null
          parsed_items: Json | null
          parsed_json: Json | null
          parser_mode: string | null
          provider: string
          quality_score: number | null
          raw_markdown: string | null
          raw_text: string | null
          refunded: boolean
          resume_file_id: string
          retry_count: number
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_used?: number | null
          error_message?: string | null
          external_job_id?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          pages_count?: number | null
          parsed_items?: Json | null
          parsed_json?: Json | null
          parser_mode?: string | null
          provider: string
          quality_score?: number | null
          raw_markdown?: string | null
          raw_text?: string | null
          refunded?: boolean
          resume_file_id: string
          retry_count?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_used?: number | null
          error_message?: string | null
          external_job_id?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          pages_count?: number | null
          parsed_items?: Json | null
          parsed_json?: Json | null
          parser_mode?: string | null
          provider?: string
          quality_score?: number | null
          raw_markdown?: string | null
          raw_text?: string | null
          refunded?: boolean
          resume_file_id?: string
          retry_count?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parse_jobs_resume_file_id_fkey"
            columns: ["resume_file_id"]
            isOneToOne: false
            referencedRelation: "resume_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parse_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          credits_added: number
          currency: string
          id: string
          metadata: Json | null
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits_added?: number
          currency?: string
          id?: string
          metadata?: Json | null
          provider: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits_added?: number
          currency?: string
          id?: string
          metadata?: Json | null
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          auto_enabled: boolean
          cover_letter_enabled: boolean
          created_at: string
          id: string
          monthly_ai_credit_limit: number | null
          monthly_parse_limit: number
          nano_enabled: boolean
          nano_mini_enabled: boolean
          nano_pro_enabled: boolean
          plan: string
          public_resume_limit: number
          updated_at: string
        }
        Insert: {
          auto_enabled?: boolean
          cover_letter_enabled?: boolean
          created_at?: string
          id?: string
          monthly_ai_credit_limit?: number | null
          monthly_parse_limit: number
          nano_enabled?: boolean
          nano_mini_enabled?: boolean
          nano_pro_enabled?: boolean
          plan: string
          public_resume_limit: number
          updated_at?: string
        }
        Update: {
          auto_enabled?: boolean
          cover_letter_enabled?: boolean
          created_at?: string
          id?: string
          monthly_ai_credit_limit?: number | null
          monthly_parse_limit?: number
          nano_enabled?: boolean
          nano_mini_enabled?: boolean
          nano_pro_enabled?: boolean
          plan?: string
          public_resume_limit?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          billing_cycle_end: string | null
          billing_cycle_start: string | null
          created_at: string
          credits_balance: number
          description: string | null
          email: string
          full_name: string | null
          id: string
          last_credit_reset_at: string | null
          location_city: string | null
          monthly_ai_credits_used: number
          monthly_parse_count: number
          phone_number: string | null
          plan: string
          professional_role: string | null
          profile_completed: boolean
          public_resume_count: number
          published_resume_slug: string | null
          published_resume_url: string | null
          social_links: Json
          status: string
          updated_at: string
          username: string | null
          years_of_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          billing_cycle_end?: string | null
          billing_cycle_start?: string | null
          created_at?: string
          credits_balance?: number
          description?: string | null
          email: string
          full_name?: string | null
          id: string
          last_credit_reset_at?: string | null
          location_city?: string | null
          monthly_ai_credits_used?: number
          monthly_parse_count?: number
          phone_number?: string | null
          plan?: string
          professional_role?: string | null
          profile_completed?: boolean
          public_resume_count?: number
          published_resume_slug?: string | null
          published_resume_url?: string | null
          social_links?: Json
          status?: string
          updated_at?: string
          username?: string | null
          years_of_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          billing_cycle_end?: string | null
          billing_cycle_start?: string | null
          created_at?: string
          credits_balance?: number
          description?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_credit_reset_at?: string | null
          location_city?: string | null
          monthly_ai_credits_used?: number
          monthly_parse_count?: number
          phone_number?: string | null
          plan?: string
          professional_role?: string | null
          profile_completed?: boolean
          public_resume_count?: number
          published_resume_slug?: string | null
          published_resume_url?: string | null
          social_links?: Json
          status?: string
          updated_at?: string
          username?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      published_resumes: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          published_at: string
          resume_id: string
          slug: string
          unpublished_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          published_at?: string
          resume_id: string
          slug: string
          unpublished_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          published_at?: string
          resume_id?: string
          slug?: string
          unpublished_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "published_resumes_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_analytics: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          referrer: string | null
          resume_id: string
          user_agent: string | null
          visitor_hash: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          resume_id: string
          user_agent?: string | null
          visitor_hash?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          resume_id?: string
          user_agent?: string | null
          visitor_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_analytics_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_files: {
        Row: {
          checksum: string | null
          created_at: string
          deleted_at: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          original_filename: string
          pages_count: number | null
          parse_status: string
          parser_mode: string | null
          resume_id: string | null
          storage_path: string
          uploaded_from: string | null
          user_id: string
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          original_filename: string
          pages_count?: number | null
          parse_status?: string
          parser_mode?: string | null
          resume_id?: string | null
          storage_path: string
          uploaded_from?: string | null
          user_id: string
        }
        Update: {
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string
          pages_count?: number | null
          parse_status?: string
          parser_mode?: string | null
          resume_id?: string | null
          storage_path?: string
          uploaded_from?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_files_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_versions: {
        Row: {
          change_summary: string | null
          created_at: string
          id: string
          resume_id: string
          resume_json: Json
          user_id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          id?: string
          resume_id: string
          resume_json: Json
          user_id: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          id?: string
          resume_id?: string
          resume_json?: Json
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "resume_versions_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_versions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ats_score: number | null
          created_at: string
          id: string
          last_exported_at: string | null
          published: boolean
          published_at: string | null
          resume_json: Json
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          source_parse_job_id: string | null
          theme: string
          title: string
          updated_at: string
          user_id: string
          version_number: number
          visibility: string
        }
        Insert: {
          ats_score?: number | null
          created_at?: string
          id?: string
          last_exported_at?: string | null
          published?: boolean
          published_at?: string | null
          resume_json?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          source_parse_job_id?: string | null
          theme?: string
          title: string
          updated_at?: string
          user_id: string
          version_number?: number
          visibility?: string
        }
        Update: {
          ats_score?: number | null
          created_at?: string
          id?: string
          last_exported_at?: string | null
          published?: boolean
          published_at?: string | null
          resume_json?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          source_parse_job_id?: string | null
          theme?: string
          title?: string
          updated_at?: string
          user_id?: string
          version_number?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_reason: string
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_user_id: string
        }
        Returns: number
      }
      deduct_credits: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_reason: string
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_user_id: string
        }
        Returns: number
      }
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
