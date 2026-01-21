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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bills: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          paid_at: string | null
          society_id: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          paid_at?: string | null
          society_id: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          paid_at?: string | null
          society_id?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          society_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          society_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          society_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          society_id: string
          title: string
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          society_id: string
          title: string
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          category?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          society_id?: string
          title?: string
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          phone: string
          society_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          phone: string
          society_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          phone?: string
          society_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          society_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          society_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          society_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facilities_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_bookings: {
        Row: {
          booking_date: string
          created_at: string | null
          end_time: string
          facility_id: string
          id: string
          society_id: string
          start_time: string
          user_id: string
        }
        Insert: {
          booking_date: string
          created_at?: string | null
          end_time: string
          facility_id: string
          id?: string
          society_id: string
          start_time: string
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string | null
          end_time?: string
          facility_id?: string
          id?: string
          society_id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_bookings_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_logs: {
        Row: {
          created_at: string
          entry_time: string
          exit_time: string | null
          flat_number: string
          id: string
          logged_by: string
          purpose: string
          security_notes: string | null
          society_id: string
          updated_at: string
          vehicle_number: string | null
          vehicle_type: string | null
          visitor_id: string | null
          visitor_name: string
        }
        Insert: {
          created_at?: string
          entry_time?: string
          exit_time?: string | null
          flat_number: string
          id?: string
          logged_by: string
          purpose: string
          security_notes?: string | null
          society_id: string
          updated_at?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
          visitor_id?: string | null
          visitor_name: string
        }
        Update: {
          created_at?: string
          entry_time?: string
          exit_time?: string | null
          flat_number?: string
          id?: string
          logged_by?: string
          purpose?: string
          security_notes?: string | null
          society_id?: string
          updated_at?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
          visitor_id?: string | null
          visitor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "gate_logs_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          created_at: string | null
          created_by: string
          description: string
          id: string
          link: string | null
          society_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          link?: string | null
          society_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          link?: string | null
          society_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notices_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          society_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          society_id: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          society_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      societies: {
        Row: {
          address: string
          city: string
          created_at: string | null
          id: string
          name: string
          pincode: string
          secretary_id: string | null
          state: string
          status: string
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          id?: string
          name: string
          pincode: string
          secretary_id?: string | null
          state: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          id?: string
          name?: string
          pincode?: string
          secretary_id?: string | null
          state?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      society_members: {
        Row: {
          availability_status: string
          created_at: string | null
          id: string
          role: string
          society_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability_status?: string
          created_at?: string | null
          id?: string
          role?: string
          society_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability_status?: string
          created_at?: string | null
          id?: string
          role?: string
          society_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "society_members_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          created_at: string | null
          created_by: string
          flat_number: string
          id: string
          purpose: string
          resident_id: string | null
          society_id: string
          status: string
          updated_at: string | null
          visitor_name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          flat_number: string
          id?: string
          purpose: string
          resident_id?: string | null
          society_id: string
          status?: string
          updated_at?: string | null
          visitor_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          flat_number?: string
          id?: string
          purpose?: string
          resident_id?: string | null
          society_id?: string
          status?: string
          updated_at?: string | null
          visitor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitors_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "resident" | "watchman" | "secretary" | "admin"
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
      app_role: ["resident", "watchman", "secretary", "admin"],
    },
  },
} as const
