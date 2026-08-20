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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      money_records: {
        Row: {
          created_at: string
          date_started: string
          demand_note: string | null
          id: string
          is_demo: boolean
          monthly_extra_amount: number
          monthly_extra_start_date: string | null
          notes: string | null
          person_id: string
          principal_amount: number
          principal_demand_date: string | null
          principal_demand_status: Database["public"]["Enums"]["demand_status"]
          principal_due_date: string | null
          principal_repayment_condition: Database["public"]["Enums"]["repayment_condition"]
          type: Database["public"]["Enums"]["money_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_started: string
          demand_note?: string | null
          id?: string
          is_demo?: boolean
          monthly_extra_amount?: number
          monthly_extra_start_date?: string | null
          notes?: string | null
          person_id: string
          principal_amount: number
          principal_demand_date?: string | null
          principal_demand_status?: Database["public"]["Enums"]["demand_status"]
          principal_due_date?: string | null
          principal_repayment_condition?: Database["public"]["Enums"]["repayment_condition"]
          type: Database["public"]["Enums"]["money_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_started?: string
          demand_note?: string | null
          id?: string
          is_demo?: boolean
          monthly_extra_amount?: number
          monthly_extra_start_date?: string | null
          notes?: string | null
          person_id?: string
          principal_amount?: number
          principal_demand_date?: string | null
          principal_demand_status?: Database["public"]["Enums"]["demand_status"]
          principal_due_date?: string | null
          principal_repayment_condition?: Database["public"]["Enums"]["repayment_condition"]
          type?: Database["public"]["Enums"]["money_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "money_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          currency: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_demo: boolean
          money_record_id: string
          notes: string | null
          person_id: string
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["txn_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          is_demo?: boolean
          money_record_id: string
          notes?: string | null
          person_id: string
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["txn_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_demo?: boolean
          money_record_id?: string
          notes?: string | null
          person_id?: string
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["txn_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_money_record_id_fkey"
            columns: ["money_record_id"]
            isOneToOne: false
            referencedRelation: "money_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_demo_data: { Args: never; Returns: undefined }
      seed_demo_data: { Args: never; Returns: undefined }
    }
    Enums: {
      demand_status:
        | "not_demanded"
        | "demanded"
        | "partially_paid"
        | "fully_paid"
      money_type: "taken" | "given"
      repayment_condition: "on_demand" | "specific_date" | "flexible"
      txn_type: "principal_payment" | "monthly_extra" | "other" | "adjustment"
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
      demand_status: [
        "not_demanded",
        "demanded",
        "partially_paid",
        "fully_paid",
      ],
      money_type: ["taken", "given"],
      repayment_condition: ["on_demand", "specific_date", "flexible"],
      txn_type: ["principal_payment", "monthly_extra", "other", "adjustment"],
    },
  },
} as const
