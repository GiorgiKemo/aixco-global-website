export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          role: "customer" | "broker" | "developer_partner" | "admin";
          company_name: string | null;
          phone: string | null;
          onboarding_status: "new" | "in_review" | "approved" | "rejected" | "archived";
          metadata: Json;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          role?: "customer" | "broker" | "developer_partner" | "admin";
          company_name?: string | null;
          phone?: string | null;
          onboarding_status?: "new" | "in_review" | "approved" | "rejected" | "archived";
          metadata?: Json;
        };
        Update: {
          updated_at?: string;
          full_name?: string | null;
          role?: "customer" | "broker" | "developer_partner" | "admin";
          company_name?: string | null;
          phone?: string | null;
          onboarding_status?: "new" | "in_review" | "approved" | "rejected" | "archived";
          metadata?: Json;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          request_reference: string;
          created_at: string;
          updated_at: string;
          source: "contact_form";
          name: string;
          email: string;
          email_normalized: string;
          interest: string | null;
          message: string;
          locale: string | null;
          page_path: string | null;
          user_agent: string | null;
          status: "new" | "contacted" | "qualified" | "archived";
          metadata: Json;
        };
        Insert: {
          id?: string;
          request_reference?: never;
          created_at?: string;
          updated_at?: string;
          source?: "contact_form";
          name: string;
          email: string;
          email_normalized?: never;
          interest?: string | null;
          message: string;
          locale?: string | null;
          page_path?: string | null;
          user_agent?: string | null;
          status?: "new" | "contacted" | "qualified" | "archived";
          metadata?: Json;
        };
        Update: {
          request_reference?: never;
          updated_at?: string;
          source?: "contact_form";
          name?: string;
          email?: string;
          email_normalized?: never;
          interest?: string | null;
          message?: string;
          locale?: string | null;
          page_path?: string | null;
          user_agent?: string | null;
          status?: "new" | "contacted" | "qualified" | "archived";
          metadata?: Json;
        };
      };
      chat_transcripts: {
        Row: {
          id: string;
          session_id: string | null;
          created_at: string;
          updated_at: string;
          source: "live_chat";
          interest: string | null;
          transcript: string;
          messages: Json;
          message_count: number;
          locale: string | null;
          page_path: string | null;
          user_agent: string | null;
          status: "new" | "contacted" | "qualified" | "archived";
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          session_id?: string | null;
          source?: "live_chat";
          interest?: string | null;
          transcript: string;
          messages: Json;
          message_count: number;
          locale?: string | null;
          page_path?: string | null;
          user_agent?: string | null;
          status?: "new" | "contacted" | "qualified" | "archived";
          metadata?: Json;
        };
        Update: {
          updated_at?: string;
          session_id?: string | null;
          source?: "live_chat";
          interest?: string | null;
          transcript?: string;
          messages?: Json;
          message_count?: number;
          locale?: string | null;
          page_path?: string | null;
          user_agent?: string | null;
          status?: "new" | "contacted" | "qualified" | "archived";
          metadata?: Json;
        };
      };
      portal_click_events: {
        Row: {
          id: string;
          created_at: string;
          source: "access_modal" | "chat_widget";
          mode: "login" | "register";
          role_title: string;
          action: string;
          portal_url: string;
          locale: string | null;
          page_path: string | null;
          user_agent: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          source?: "access_modal" | "chat_widget";
          mode: "login" | "register";
          role_title: string;
          action: string;
          portal_url: string;
          locale?: string | null;
          page_path?: string | null;
          user_agent?: string | null;
          metadata?: Json;
        };
        Update: {
          source?: "access_modal" | "chat_widget";
          mode?: "login" | "register";
          role_title?: string;
          action?: string;
          portal_url?: string;
          locale?: string | null;
          page_path?: string | null;
          user_agent?: string | null;
          metadata?: Json;
        };
      };
      site_content_entries: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          section: string;
          entry_key: string;
          locale: string;
          sort_order: number;
          is_published: boolean;
          payload: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          section: string;
          entry_key: string;
          locale?: string;
          sort_order?: number;
          is_published?: boolean;
          payload?: Json;
        };
        Update: {
          updated_at?: string;
          section?: string;
          entry_key?: string;
          locale?: string;
          sort_order?: number;
          is_published?: boolean;
          payload?: Json;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
