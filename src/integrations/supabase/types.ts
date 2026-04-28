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
      cached_recipes: {
        Row: {
          calories: number
          carbs: number
          category: string
          confidence: number
          created_at: string
          difficulty: string
          fat: number
          fiber: number
          hits: number
          id: string
          image_url: string | null
          ingredients: Json
          name: string
          prep_minutes: number
          protein: number
          servings: number
          source: string
          steps: Json
          tagline: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          calories?: number
          carbs?: number
          category: string
          confidence?: number
          created_at?: string
          difficulty?: string
          fat?: number
          fiber?: number
          hits?: number
          id: string
          image_url?: string | null
          ingredients?: Json
          name: string
          prep_minutes?: number
          protein?: number
          servings?: number
          source?: string
          steps?: Json
          tagline?: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          calories?: number
          carbs?: number
          category?: string
          confidence?: number
          created_at?: string
          difficulty?: string
          fat?: number
          fiber?: number
          hits?: number
          id?: string
          image_url?: string | null
          ingredients?: Json
          name?: string
          prep_minutes?: number
          protein?: number
          servings?: number
          source?: string
          steps?: Json
          tagline?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          ai_plan: Json | null
          avoid_foods: string[]
          avoid_other: string | null
          biological_sex: string | null
          budget: string
          cooking_frequency: string | null
          created_at: string
          current_weight: number | null
          favorite_proteins: string[]
          goal: string
          goal_text: string | null
          goal_why: string | null
          gym_focus: string | null
          gym_frequency: string | null
          height_cm: number | null
          height_ft: number | null
          height_in: number | null
          height_unit: string | null
          id: string
          meals_per_day: number
          notes: string | null
          onboarded: boolean
          restrictions: string[]
          skill: string
          spice_tolerance: string | null
          target_weight: number | null
          timeline: string | null
          updated_at: string
          user_id: string
          weight_unit: string | null
          workout_timing: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          ai_plan?: Json | null
          avoid_foods?: string[]
          avoid_other?: string | null
          biological_sex?: string | null
          budget?: string
          cooking_frequency?: string | null
          created_at?: string
          current_weight?: number | null
          favorite_proteins?: string[]
          goal?: string
          goal_text?: string | null
          goal_why?: string | null
          gym_focus?: string | null
          gym_frequency?: string | null
          height_cm?: number | null
          height_ft?: number | null
          height_in?: number | null
          height_unit?: string | null
          id?: string
          meals_per_day?: number
          notes?: string | null
          onboarded?: boolean
          restrictions?: string[]
          skill?: string
          spice_tolerance?: string | null
          target_weight?: number | null
          timeline?: string | null
          updated_at?: string
          user_id: string
          weight_unit?: string | null
          workout_timing?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          ai_plan?: Json | null
          avoid_foods?: string[]
          avoid_other?: string | null
          biological_sex?: string | null
          budget?: string
          cooking_frequency?: string | null
          created_at?: string
          current_weight?: number | null
          favorite_proteins?: string[]
          goal?: string
          goal_text?: string | null
          goal_why?: string | null
          gym_focus?: string | null
          gym_frequency?: string | null
          height_cm?: number | null
          height_ft?: number | null
          height_in?: number | null
          height_unit?: string | null
          id?: string
          meals_per_day?: number
          notes?: string | null
          onboarded?: boolean
          restrictions?: string[]
          skill?: string
          spice_tolerance?: string | null
          target_weight?: number | null
          timeline?: string | null
          updated_at?: string
          user_id?: string
          weight_unit?: string | null
          workout_timing?: string | null
        }
        Relationships: []
      }
      user_seen_recipes: {
        Row: {
          id: string
          recipe_id: string
          seen_at: string
          user_id: string
        }
        Insert: {
          id?: string
          recipe_id: string
          seen_at?: string
          user_id: string
        }
        Update: {
          id?: string
          recipe_id?: string
          seen_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_unseen_cached_recipes: {
        Args: { _category: string; _tags: string[]; _user_id: string }
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
