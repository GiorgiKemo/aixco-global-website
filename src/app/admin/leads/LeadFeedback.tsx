type LeadFeedbackProps = {
  updated?: string | null;
  requeued?: string | null;
  error?: string | null;
};

export function getLeadFeedbackMessage({ updated, requeued, error }: LeadFeedbackProps) {
  if (updated === "1") return { tone: "success" as const, text: "Lead status updated." };
  if (requeued && /^[1-9]\d*$/.test(requeued)) {
    return {
      tone: "success" as const,
      text: `${requeued} failed email delivery attempt(s) requeued.`,
    };
  }
  if (error === "invalid-status-update") return { tone: "error" as const, text: "That status update was invalid." };
  if (error === "lead-not-found") return { tone: "error" as const, text: "That lead no longer exists." };
  if (error === "invalid-email-requeue") return { tone: "error" as const, text: "That email retry request was invalid." };
  if (error === "no-email-to-requeue") return { tone: "error" as const, text: "No API-failed email is eligible for a safe retry." };
  if (error === "email-requeue-failed") return { tone: "error" as const, text: "Could not requeue the failed email." };
  if (error === "status-update-failed") return { tone: "error" as const, text: "Could not update lead status." };
  return null;
}

export function LeadFeedback(props: LeadFeedbackProps) {
  const feedback = getLeadFeedbackMessage(props);
  if (!feedback) return null;

  return (
    <p
      role={feedback.tone === "success" ? "status" : "alert"}
      className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
        feedback.tone === "success"
          ? "border-[#e6c767]/60 bg-[#e6c767]/15 text-[#161616]"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
    >
      {feedback.text}
    </p>
  );
}
