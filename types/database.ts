// Database types for Supabase
// These types match the database schema converted from Prisma

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string | null
          username: string | null
          is_admin: boolean
          payment_processor_user_id: string | null
          lemon_squeezy_customer_portal_url: string | null
          subscription_status: string | null
          subscription_plan: string | null
          date_paid: string | null
          credits: number
        }
        Insert: {
          id?: string
          created_at?: string
          email?: string | null
          username?: string | null
          is_admin?: boolean
          payment_processor_user_id?: string | null
          lemon_squeezy_customer_portal_url?: string | null
          subscription_status?: string | null
          subscription_plan?: string | null
          date_paid?: string | null
          credits?: number
        }
        Update: {
          id?: string
          created_at?: string
          email?: string | null
          username?: string | null
          is_admin?: boolean
          payment_processor_user_id?: string | null
          lemon_squeezy_customer_portal_url?: string | null
          subscription_status?: string | null
          subscription_plan?: string | null
          date_paid?: string | null
          credits?: number
        }
      }
      gpt_responses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          content?: string
        }
      }
      tasks: {
        Row: {
          id: string
          created_at: string
          user_id: string
          description: string
          time: string
          is_done: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          description: string
          time?: string
          is_done?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          description?: string
          time?: string
          is_done?: boolean
        }
      }
      files: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          type: string
          s3_key: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          type: string
          s3_key: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          type?: string
          s3_key?: string
        }
      }
      daily_stats: {
        Row: {
          id: number
          date: string
          total_views: number
          prev_day_views_change_percent: string
          user_count: number
          paid_user_count: number
          user_delta: number
          paid_user_delta: number
          total_revenue: number
          total_profit: number
        }
        Insert: {
          id?: number
          date?: string
          total_views?: number
          prev_day_views_change_percent?: string
          user_count?: number
          paid_user_count?: number
          user_delta?: number
          paid_user_delta?: number
          total_revenue?: number
          total_profit?: number
        }
        Update: {
          id?: number
          date?: string
          total_views?: number
          prev_day_views_change_percent?: string
          user_count?: number
          paid_user_count?: number
          user_delta?: number
          paid_user_delta?: number
          total_revenue?: number
          total_profit?: number
        }
      }
      page_view_sources: {
        Row: {
          date: string
          name: string
          daily_stats_id: number | null
          visitors: number
        }
        Insert: {
          date?: string
          name: string
          daily_stats_id?: number | null
          visitors: number
        }
        Update: {
          date?: string
          name?: string
          daily_stats_id?: number | null
          visitors?: number
        }
      }
      logs: {
        Row: {
          id: number
          created_at: string
          message: string
          level: string
        }
        Insert: {
          id?: number
          created_at?: string
          message: string
          level: string
        }
        Update: {
          id?: number
          created_at?: string
          message?: string
          level?: string
        }
      }
      contact_form_messages: {
        Row: {
          id: string
          created_at: string
          user_id: string
          content: string
          is_read: boolean
          replied_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          content: string
          is_read?: boolean
          replied_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          content?: string
          is_read?: boolean
          replied_at?: string | null
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
  }
}

// Helper types for camelCase conversion
export type User = Database['public']['Tables']['users']['Row']
export type GptResponse = Database['public']['Tables']['gpt_responses']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type File = Database['public']['Tables']['files']['Row']
export type DailyStats = Database['public']['Tables']['daily_stats']['Row']
export type PageViewSource = Database['public']['Tables']['page_view_sources']['Row']
export type Log = Database['public']['Tables']['logs']['Row']
export type ContactFormMessage = Database['public']['Tables']['contact_form_messages']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type GptResponseInsert = Database['public']['Tables']['gpt_responses']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type FileInsert = Database['public']['Tables']['files']['Insert']
export type DailyStatsInsert = Database['public']['Tables']['daily_stats']['Insert']
export type PageViewSourceInsert = Database['public']['Tables']['page_view_sources']['Insert']
export type LogInsert = Database['public']['Tables']['logs']['Insert']
export type ContactFormMessageInsert = Database['public']['Tables']['contact_form_messages']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type GptResponseUpdate = Database['public']['Tables']['gpt_responses']['Update']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type FileUpdate = Database['public']['Tables']['files']['Update']
export type DailyStatsUpdate = Database['public']['Tables']['daily_stats']['Update']
export type PageViewSourceUpdate = Database['public']['Tables']['page_view_sources']['Update']
export type LogUpdate = Database['public']['Tables']['logs']['Update']
export type ContactFormMessageUpdate = Database['public']['Tables']['contact_form_messages']['Update']
