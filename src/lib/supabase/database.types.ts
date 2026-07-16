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
          request_type: "call" | "message";
          phone: string | null;
          preferred_call_at: string | null;
          preferred_call_timezone: string | null;
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
            | "delivered"
            | "partially_delivered"
            | "delivery_delayed"
            | "delivery_issue"
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
          request_type?: "call" | "message";
          phone?: string | null;
          preferred_call_at?: string | null;
          preferred_call_timezone?: string | null;
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
            | "delivered"
            | "partially_delivered"
            | "delivery_delayed"
            | "delivery_issue"
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
          request_type?: "call" | "message";
          phone?: string | null;
          preferred_call_at?: string | null;
          preferred_call_timezone?: string | null;
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
            | "delivered"
            | "partially_delivered"
            | "delivery_delayed"
            | "delivery_issue"
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
          status:
            | "pending"
            | "processing"
            | "retrying"
            | "provider_accepted"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "complained"
            | "suppressed"
            | "failed";
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
          provider_event_type: string | null;
          provider_event_at: string | null;
          requeue_count: number;
          last_error: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          contact_submission_id: string;
          request_reference: string;
          channel: "lead_notification" | "contact_confirmation";
          status?:
            | "pending"
            | "processing"
            | "retrying"
            | "provider_accepted"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "complained"
            | "suppressed"
            | "failed";
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
          provider_event_type?: string | null;
          provider_event_at?: string | null;
          requeue_count?: number;
          last_error?: string | null;
        };
        Update: {
          updated_at?: string;
          status?:
            | "pending"
            | "processing"
            | "retrying"
            | "provider_accepted"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "complained"
            | "suppressed"
            | "failed";
          payload?: Json;
          attempts?: number;
          max_attempts?: number;
          next_attempt_at?: string;
          last_attempt_at?: string | null;
          locked_at?: string | null;
          lock_token?: string | null;
          provider_message_id?: string | null;
          provider_accepted_at?: string | null;
          provider_event_type?: string | null;
          provider_event_at?: string | null;
          requeue_count?: number;
          last_error?: string | null;
        };
      };
      contact_email_events: {
        Row: {
          event_id: string;
          received_at: string;
          occurred_at: string;
          provider_message_id: string;
          event_type: string;
          contact_email_delivery_id: string | null;
          detail: string | null;
        };
        Insert: {
          event_id: string;
          received_at?: string;
          occurred_at: string;
          provider_message_id: string;
          event_type: string;
          contact_email_delivery_id?: string | null;
          detail?: string | null;
        };
        Update: {
          contact_email_delivery_id?: string | null;
          detail?: string | null;
        };
      };
      contact_email_worker_runtime: {
        Row: {
          worker_name: string;
          last_started_at: string | null;
          last_succeeded_at: string | null;
          last_failed_at: string | null;
          consecutive_failures: number;
          last_error: string | null;
          last_summary: Json;
        };
        Insert: {
          worker_name: string;
          last_started_at?: string | null;
          last_succeeded_at?: string | null;
          last_failed_at?: string | null;
          consecutive_failures?: number;
          last_error?: string | null;
          last_summary?: Json;
        };
        Update: {
          last_started_at?: string | null;
          last_succeeded_at?: string | null;
          last_failed_at?: string | null;
          consecutive_failures?: number;
          last_error?: string | null;
          last_summary?: Json;
        };
      };
      site_telemetry_events: {
        Row: {
          id: number;
          received_at: string;
          event_kind: "web_vital" | "client_error" | "server_error";
          event_name: string;
          event_id: string | null;
          page_path: string | null;
          value: number | null;
          rating: "good" | "needs-improvement" | "poor" | "unknown" | null;
          metadata: Json;
        };
        Insert: {
          id?: number;
          received_at?: string;
          event_kind: "web_vital" | "client_error" | "server_error";
          event_name: string;
          event_id?: string | null;
          page_path?: string | null;
          value?: number | null;
          rating?: "good" | "needs-improvement" | "poor" | "unknown" | null;
          metadata?: Json;
        };
        Update: never;
      };
      lead_capture_attempts: {
        Row: {
          id: number;
          created_at: string;
          resource: "contact" | "chat" | "portal-event" | "telemetry";
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
      claim_contact_email_deliveries_for_request: {
        Args: { p_request_reference: string; p_batch_size?: number };
        Returns: Database["public"]["Tables"]["contact_email_deliveries"]["Row"][];
      };
      record_contact_email_event: {
        Args: {
          p_event_id: string;
          p_provider_message_id: string;
          p_event_type: string;
          p_occurred_at: string;
          p_detail?: string | null;
        };
        Returns: { duplicate: boolean; applied: boolean; delivery_id: string | null }[];
      };
      record_contact_email_worker_failure: {
        Args: { p_reason: string; p_failed_at?: string };
        Returns: undefined;
      };
      requeue_failed_contact_email_deliveries: {
        Args: { p_contact_submission_id: string };
        Returns: number;
      };
      delete_contact_subject_data: {
        Args: { p_email: string; p_recipient_hash: string };
        Returns: {
          contacts_deleted: number;
          chats_deleted: number;
          abuse_attempts_deleted: number;
        }[];
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
        Returns: {
          schema_version: string;
          queued_count: number;
          failed_count: number;
          delivery_issue_count: number;
          oldest_queued_at: string | null;
          oldest_processing_at: string | null;
          worker_last_started_at: string | null;
          worker_last_succeeded_at: string | null;
          worker_last_failed_at: string | null;
          worker_consecutive_failures: number;
          scheduler_active: boolean;
          scheduler_last_succeeded_at: string | null;
        }[];
      };
      prune_lead_capture_attempts: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      purge_expired_operational_data: {
        Args: {
          p_contact_days?: number;
          p_chat_days?: number;
          p_portal_days?: number;
          p_abuse_attempt_days?: number;
          p_email_event_days?: number;
          p_telemetry_days?: number;
        };
        Returns: {
          contacts_deleted: number;
          chats_deleted: number;
          portal_events_deleted: number;
          abuse_attempts_deleted: number;
          orphan_email_events_deleted: number;
          telemetry_events_deleted: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
