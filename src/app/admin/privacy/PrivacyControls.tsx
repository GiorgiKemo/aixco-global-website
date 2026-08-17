"use client";

import { useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { Download, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";

type PrivacyPreview = {
  subject: string;
  contactSubmissions: number;
  chatTranscripts: number;
  emailDeliveries: number;
  emailEvents: number;
  abuseAttempts: number;
  total: number;
  previewToken: string;
};

function isPrivacyPreview(value: unknown): value is PrivacyPreview {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.subject === "string"
    && /^v1\.\d{13}\.\d{13}\.[a-f0-9]{64}$/.test(String(candidate.previewToken ?? ""))
    && [
      "contactSubmissions",
      "chatTranscripts",
      "emailDeliveries",
      "emailEvents",
      "abuseAttempts",
      "total",
    ].every((key) => {
      const item = candidate[key];
      return typeof item === "number" && Number.isSafeInteger(item) && item >= 0;
    });
}

function PendingSubmit({
  idle,
  pending,
  className,
  disabled = false,
}: {
  idle: string;
  pending: string;
  className: string;
  disabled?: boolean;
}) {
  const status = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || status.pending}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {status.pending ? pending : idle}
    </button>
  );
}

function formatCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value.toLocaleString("en-US")} ${value === 1 ? singular : plural}`;
}

export function PrivacyControls() {
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState<PrivacyPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [confirmationWord, setConfirmationWord] = useState("");

  async function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreviewing(true);
    setPreviewError("");
    setPreview(null);
    setConfirmationEmail("");
    setConfirmationWord("");

    try {
      const response = await fetch("/admin/privacy/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => null) as unknown;
      if (!response.ok || !isPrivacyPreview(payload)) {
        throw new Error("preview-failed");
      }
      setEmail(payload.subject);
      setPreview(payload);
    } catch {
      setPreviewError("The subject preview could not be loaded. No data was erased.");
    } finally {
      setPreviewing(false);
    }
  }

  const exactEmailConfirmed = Boolean(
    preview && confirmationEmail.trim().toLowerCase() === preview.subject,
  );
  const deleteEnabled = exactEmailConfirmed && confirmationWord === "DELETE";

  return (
    <section className="mt-6 space-y-5">
      <div className="rounded-[12px] border border-[#161616]/10 bg-white p-6 shadow-sm">
        <ShieldCheck className="h-5 w-5 text-[#8b6a18]" aria-hidden="true" />
        <h2 className="mt-3 font-display text-xl font-bold">Verify the exact subject</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f6e6a]">
          Preview exact email matches before any export or deletion. Free-text
          chats require manual review, and anonymous analytics is not
          attributed to an email subject.
        </p>

        {!preview ? <form onSubmit={handlePreview} className="mt-5 max-w-xl">
          <label className="grid gap-2 text-sm font-semibold">
            Verified email address
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              className="h-11 border border-[#161616]/20 px-3 text-base font-normal outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]"
            />
          </label>
          {previewError ? <p role="alert" className="mt-3 text-sm font-medium text-red-800">{previewError}</p> : null}
          <button
            type="submit"
            disabled={previewing}
            className="mt-5 inline-flex min-h-11 items-center justify-center border border-[#7c5d17] px-4 text-sm font-semibold text-[#7c5d17] disabled:cursor-wait disabled:opacity-60"
          >
            {previewing ? "Checking exact matches…" : "Preview exact matches"}
          </button>
        </form> : <div className="mt-5 rounded-lg border border-[#8b6a18]/20 bg-[#f8f4e9] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c5d17]">Exact subject</p>
          <p className="mt-1 break-all font-mono text-sm font-semibold text-[#161616]">{preview.subject}</p>
          <dl className="mt-4 grid gap-3 text-xs text-[#55534f] sm:grid-cols-2 lg:grid-cols-4">
            <div><dt>Forms</dt><dd className="font-semibold text-[#161616]">{formatCount(preview.contactSubmissions, "record")}</dd></div>
            <div><dt>Email history</dt><dd className="font-semibold text-[#161616]">{formatCount(preview.emailDeliveries + preview.emailEvents, "record")}</dd></div>
            <div><dt>Abuse controls</dt><dd className="font-semibold text-[#161616]">{formatCount(preview.abuseAttempts, "record")}</dd></div>
            <div><dt>Total at preview time</dt><dd className="font-semibold text-[#161616]">{formatCount(preview.total, "record")}</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-[#6f6e6a]">
            Chats: manual review required. This automated result does not claim
            that a free-text email mention identifies the chat subject.
          </p>
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setConfirmationEmail("");
              setConfirmationWord("");
            }}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 px-3 text-sm font-semibold text-[#55534f] outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Check another email
          </button>
        </div>}
      </div>

      {preview ? <div className="grid gap-5 md:grid-cols-2">
        <form action="/admin/privacy/export" method="post" className="rounded-[12px] border border-[#161616]/10 bg-white p-6 shadow-sm">
          <input type="hidden" name="email" value={preview.subject} />
          <input type="hidden" name="preview_token" value={preview.previewToken} />
          <Download className="h-5 w-5 text-[#8b6a18]" aria-hidden="true" />
          <h2 className="mt-3 font-display text-xl font-bold">Export attributable data</h2>
          <p className="mt-2 text-sm leading-6 text-[#6f6e6a]">
            Downloads the exact matches shown above. Complete the separate
            manual chat review before treating the subject request as complete.
          </p>
          <PendingSubmit
            idle="Download exact-match export"
            pending="Preparing export…"
            className="mt-5 inline-flex min-h-11 items-center justify-center bg-[#161616] px-4 text-sm font-semibold text-white"
          />
        </form>

        <form action="/admin/privacy/delete" method="post" className="rounded-[12px] border border-red-900/15 bg-white p-6 shadow-sm">
            <Trash2 className="h-5 w-5 text-red-800" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl font-bold">Erase attributable data</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f6e6a]">
              Permanently deletes the exact contact, delivery, and abuse-control
              matches above. Chats still require manual review.
            </p>
            <input type="hidden" name="email" value={preview.subject} />
            <input type="hidden" name="previewed_email" value={preview.subject} />
            <input type="hidden" name="preview_token" value={preview.previewToken} />
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Retype the exact email
              <input
                name="confirmation_email"
                value={confirmationEmail}
                onChange={(event) => setConfirmationEmail(event.target.value)}
                type="email"
                autoComplete="off"
                required
                maxLength={255}
                className="h-11 border border-[#161616]/20 px-3 text-base font-normal outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]"
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Type DELETE to confirm
              <input
                name="confirmation"
                value={confirmationWord}
                onChange={(event) => setConfirmationWord(event.target.value)}
                required
                pattern="DELETE"
                autoComplete="off"
                className="h-11 border border-[#161616]/20 px-3 text-base font-normal outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17]"
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <PendingSubmit
                idle="Permanently erase attributable data"
                pending="Erasing subject data…"
                disabled={!deleteEnabled}
                className="inline-flex min-h-11 items-center justify-center bg-red-900 px-4 text-sm font-semibold text-white"
              />
            </div>
        </form>
      </div> : null}
    </section>
  );
}
