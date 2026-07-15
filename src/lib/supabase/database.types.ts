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
          email_delivery_status:
            | "not_scheduled"
            | "queued"
            | "processing"
            | "retrying"
            | "provider_accepted"
            | "partially_accepted"
            | "failed";
          email_delivery_updated_at: string;
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
          email_delivery_status?:
            | "not_scheduled"
            | "queued"
            | "processing"
            | "retrying"
            | "provider_accepted"
            | "partially_accepted"
            | "failed";
          email_delivery_updated_at?: string;
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
          email_delivery_status?:
            | "not_scheduled"
            | "queued"
            | "processing"
            | "retrying"
            | "provider_accepted"
            | "partially_accepted"
            | "failed";
          email_delivery_updated_at?: string;
          metadata?: Json;
        };
      };
      contact_email_deliveries: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          contact_submission_id: string;
          request_reference: string;
          channel: "lead_notification" | "contact_confirmation";
          status: "pending" | "processing" | "retrying" | "provider_accepted" | "failed";
          idempotency_key: string;
          payload: Json;
          attempts: number;
          max_attempts: number;
          next_attempt_at: string;
          last_attempt_at: string | null;
          locked_at: string | null;
          lock_token: string | null;
          provider_message_id: string | null;
          provider_accepted_at: string | null;
          last_error: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          contact_submission_id: string;
          request_reference: string;
          channel: "lead_notification" | "contact_confirmation";
          status?: "pending" | "processing" | "retrying" | "provider_accepted" | "failed";
          idempotency_key: string;
          payload: Json;
          attempts?: number;
          max_attempts?: number;
          next_attempt_at?: string;
          last_attempt_at?: string | null;
          locked_at?: string | null;
          lock_token?: string | null;
          provider_message_id?: string | null;
          provider_accepted_at?: string | null;
          last_error?: string | null;
        };
        Update: {
          updated_at?: string;
          status?: "pending" | "processing" | "retrying" | "provider_accepted" | "failed";
          payload?: Json;
          attempts?: number;
          max_attempts?: number;
          next_attempt_at?: string;
          last_attempt_at?: string | null;
          locked_at?: string | null;
          lock_token?: string | null;
          provider_message_id?: string | null;
          provider_accepted_at?: string | null;
          last_error?: string | null;
        };
      };
      lead_capture_attempts: {
        Row: {
          id: number;
          created_at: string;
          resource: "contact" | "chat" | "portal-event";
          client_hash: string;
          recipient_hash: string | null;
          allowed: boolean;
          reason: string | null;
        };
        Insert: {
          id?: never;
          created_at?: string;
          resource: "contact" | "chat" | "portal-event";
          client_hash: string;
          recipient_hash?: string | null;
          allowed: boolean;
          reason?: string | null;
        };
        Update: {
          resource?: "contact" | "chat" | "portal-event";
          client_hash?: string;
          recipient_hash?: string | null;
          allowed?: boolean;
          reason?: string | null;
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
    Functions: {
      create_contact_submission: {
        Args: { p_submission: Json };
        Returns: { request_reference: string; delivery_status: string }[];
      };
      claim_contact_email_deliveries: {
        Args: { p_batch_size?: number };
        Returns: Database["public"]["Tables"]["contact_email_deliveries"]["Row"][];
      };
      record_lead_capture_attempt: {
        Args: {
          p_resource: string;
          p_client_hash: string;
          p_recipient_hash: string | null;
          p_client_limit: number;
          p_client_window_seconds: number;
          p_recipient_limit: number;
          p_recipient_window_seconds: number;
        };
        Returns: { allowed: boolean; reason: string | null; retry_after_seconds: number }[];
      };
      contact_delivery_runtime_status: {
        Args: Record<PropertyKey, never>;
        Returns: { schema_version: string; queued_count: number; failed_count: number }[];
      };
      prune_lead_capture_attempts: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
