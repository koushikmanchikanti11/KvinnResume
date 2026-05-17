export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_events: {
        Row: {
          created_at: string
          feature: string
          id: string
          input_tokens: number
          model: string
          output_tokens: number
          provider: string
          resume_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          input_tokens?: number
          model: string
          output_tokens?: number
          provider: string
          resume_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          input_tokens?: number
          model?: string
          output_tokens?: number
          provider?: string
          resume_id?: string | null
          user_id?: string
        }
      }
      credits_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          related_job_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          related_job_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          related_job_id?: string | null
          user_id?: string
        }
      }
      parse_jobs: {
        Row: {
          created_at: string
          credits_used: number
          error_message: string | null
          external_job_id: string | null
          id: string
          parsed_items: Json | null
          parsed_json: Json | null
          parsed_text: string | null
          parser_mode: string
          provider: string
          raw_markdown: string | null
          raw_text: string | null
          resume_file_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          error_message?: string | null
          external_job_id?: string | null
          id?: string
          parsed_items?: Json | null
          parsed_json?: Json | null
          parsed_text?: string | null
          parser_mode: string
          provider: string
          raw_markdown?: string | null
          raw_text?: string | null
          resume_file_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          error_message?: string | null
          external_job_id?: string | null
          id?: string
          parsed_items?: Json | null
          parsed_json?: Json | null
          parsed_text?: string | null
          parser_mode?: string
          provider?: string
          raw_markdown?: string | null
          raw_text?: string | null
          resume_file_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits_balance: number
          email: string
          full_name: string | null
          id: string
          plan: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits_balance?: number
          email: string
          full_name?: string | null
          id: string
          plan?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits_balance?: number
          email?: string
          full_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
        }
      }
      resume_analytics: {
        Row: {
          country: string | null
          created_at: string
          event_type: string
          id: string
          resume_id: string
          visitor_hash: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          event_type: string
          id?: string
          resume_id: string
          visitor_hash: string
        }
        Update: {
          country?: string | null
          created_at?: string
          event_type?: string
          id?: string
          resume_id?: string
          visitor_hash?: string
        }
      }
      resume_files: {
        Row: {
          created_at: string
          file_size: number
          id: string
          mime_type: string
          original_filename: string
          parse_status: string
          resume_id: string | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size: number
          id?: string
          mime_type: string
          original_filename: string
          parse_status?: string
          resume_id?: string | null
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_size?: number
          id?: string
          mime_type?: string
          original_filename?: string
          parse_status?: string
          resume_id?: string | null
          storage_path?: string
          user_id?: string
        }
      }
      resume_versions: {
        Row: {
          created_at: string
          id: string
          resume_id: string
          resume_json: Json
        }
        Insert: {
          created_at?: string
          id?: string
          resume_id: string
          resume_json: Json
        }
        Update: {
          created_at?: string
          id?: string
          resume_id?: string
          resume_json?: Json
        }
      }
      resumes: {
        Row: {
          ats_score: number | null
          created_at: string
          id: string
          published: boolean
          resume_json: Json
          slug: string | null
          theme: string
          title: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          ats_score?: number | null
          created_at?: string
          id?: string
          published?: boolean
          resume_json?: Json
          slug?: string | null
          theme?: string
          title: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          ats_score?: number | null
          created_at?: string
          id?: string
          published?: boolean
          resume_json?: Json
          slug?: string | null
          theme?: string
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
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
