import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const privacyEmailSchema = z.string().trim().email().max(255).transform((value) => value.toLowerCase());

const PRIVACY_EXPORT_COLUMNS = [
  "id",
  "request_reference",
  "created_at",
  "updated_at",
  "source",
  "name",
  "email",
  "interest",
  "message",
  "request_type",
  "phone",
  "preferred_call_at",
  "preferred_call_timezone",
  "locale",
  "page_path",
  "status",
  "metadata",
].join(", ");

export async function exportContactSubjectData(email: string) {
  const normalizedEmail = privacyEmailSchema.parse(email);
  const supabase = await getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("contact_submissions")
    .select(PRIVACY_EXPORT_COLUMNS)
    .eq("email_normalized", normalizedEmail)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Contact subject export failed (${error.code ?? "database_error"}).`);

  return {
    subject: normalizedEmail,
    exportedAt: new Date().toISOString(),
    contactSubmissions: data ?? [],
  };
}

export async function deleteContactSubjectData(email: string) {
  const normalizedEmail = privacyEmailSchema.parse(email);
  const supabase = await getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("email_normalized", normalizedEmail)
    .select("id");

  if (error) throw new Error(`Contact subject deletion failed (${error.code ?? "database_error"}).`);
  return { subject: normalizedEmail, deleted: data?.length ?? 0 };
}
