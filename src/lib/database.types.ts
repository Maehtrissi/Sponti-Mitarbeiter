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
      crm_employees: {
        Row: {
          active: boolean
          user_id: string
        }
        Insert: {
          active?: boolean
          user_id: string
        }
        Update: {
          active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      crm_notes: {
        Row: {
          author: string
          author_id: string
          body: string
          created_at: string
          customer_id: number | null
          id: string
          provider_id: string | null
        }
        Insert: {
          author?: string
          author_id?: string
          body: string
          created_at?: string
          customer_id?: number | null
          id?: string
          provider_id?: string | null
        }
        Update: {
          author?: string
          author_id?: string
          body?: string
          created_at?: string
          customer_id?: number | null
          id?: string
          provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "Kunden - Users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "Kursanbieter"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          created_at: string
          created_by: string
          customer_id: number | null
          done: boolean
          due_date: string
          id: string
          provider_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          customer_id?: number | null
          done?: boolean
          due_date: string
          id?: string
          provider_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_id?: number | null
          done?: boolean
          due_date?: string
          id?: string
          provider_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "Kunden - Users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "Kursanbieter"
            referencedColumns: ["id"]
          },
        ]
      }
      "Kunden - Users": {
        Row: {
          ContactChannel: string | null
          created_at: string
          crm_message: string
          crm_source: string
          crm_status: string
          Email: string | null
          id: number
          Interest: string | null
          Name: string | null
          Phone: string | null
        }
        Insert: {
          ContactChannel?: string | null
          created_at?: string
          crm_message?: string
          crm_source?: string
          crm_status?: string
          Email?: string | null
          id?: number
          Interest?: string | null
          Name?: string | null
          Phone?: string | null
        }
        Update: {
          ContactChannel?: string | null
          created_at?: string
          crm_message?: string
          crm_source?: string
          crm_status?: string
          Email?: string | null
          id?: number
          Interest?: string | null
          Name?: string | null
          Phone?: string | null
        }
        Relationships: []
      }
      Kursanbieter: {
        Row: {
          category: string
          company: string
          contact: string
          created_at: string
          crm_source: string
          crm_status: string
          email: string
          id: string
          message: string
          offer_type: string | null
          phone: string
        }
        Insert: {
          category: string
          company: string
          contact: string
          created_at?: string
          crm_source?: string
          crm_status?: string
          email: string
          id?: string
          message?: string
          offer_type?: string | null
          phone?: string
        }
        Update: {
          category?: string
          company?: string
          contact?: string
          created_at?: string
          crm_source?: string
          crm_status?: string
          email?: string
          id?: string
          message?: string
          offer_type?: string | null
          phone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crm_is_employee: { Args: never; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

