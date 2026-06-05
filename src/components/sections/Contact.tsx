"use client";

import Image from "next/image";
import { useRef, useState, type MutableRefObject } from "react";
import { z } from "zod";
import { Mail, MapPin, Check } from "lucide-react";
import { useSiteContent } from "@/data/site-content-context";
import { motion } from "@/lib/framer-motion";
import { premiumPress } from "@/lib/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveImages } from "@/lib/aixco-live-assets";
import { submitContactSubmission } from "@/lib/backend/lead-capture";
import { createContactMailtoHref } from "./contact-mailto";

type ContactFormData = {
  name: string;
  email: string;
  interest?: string;
  message: string;
};

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  interest: z.string().trim().max(255).optional(),
  message: z.string().trim().min(10, "Please share a few details").max(1500),
});

type State = "idle" | "success" | "error";

export function Contact() {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mailtoHref, setMailtoHref] = useState("");
  const [backendSaved, setBackendSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const { tx } = useI18n();
  const { company } = useSiteContent();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = new FormData(e.currentTarget);
    const data = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      interest: String(form.get("interest") || ""),
      message: String(form.get("message") || ""),
    };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { errs[String(issue.path[0])] = tx(issue.message); });
      setErrors(errs);
      setState("error");
      const firstInvalidField = String(parsed.error.issues[0]?.path[0] ?? "");
      fieldRefs.current[firstInvalidField]?.focus();
      return;
    }
    setErrors({});
    const submission = parsed.data as ContactFormData;
    setIsSubmitting(true);

    try {
      const backendResult = await submitContactSubmission(submission);
      setBackendSaved(backendResult.ok);
      setMailtoHref(createContactMailtoHref(submission, company.email));
      setState("success");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-16 bg-surface/40 py-12 md:scroll-mt-20 md:py-0">
      <div
        data-viewport-fit="contact-view"
        className="container-x grid min-h-[calc(100svh-4rem)] gap-8 py-8 md:h-[calc(100svh-5rem)] md:min-h-0 md:grid-cols-2 md:grid-rows-[auto_minmax(0,1fr)] md:items-stretch md:gap-x-8 md:gap-y-5 md:py-8 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-6 lg:py-8"
      >
        <div className="scroll-reveal md:col-span-1 lg:col-span-5">
          <p className="eyebrow">{tx("Contact")}</p>
          <h2 className="heading-section mt-4 max-w-full [overflow-wrap:anywhere]">
            <span className="text-gold">{tx("Start")}</span> {tx("your Batumi real estate journey")}
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-foreground/80">
            {tx("Register with us now to buy Batumi apartments, partner as a broker, or discuss property administration with the AIXCO team.")}
          </p>
          <div className="mt-6 space-y-4">
            <a href={`mailto:${company.email}`} className="group flex items-start gap-4">
              <span className="icon-button-glass flex h-10 w-10 shrink-0"><Mail className="h-4 w-4 text-primary" /></span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{tx("Email")}</p>
                <p className="text-sm text-foreground link-underline w-fit">{company.email}</p>
              </div>
            </a>
            <a href="https://maps.app.goo.gl/AVywyfokNdm4VuLD9" target="_blank" rel="noreferrer" className="flex items-start gap-4">
              <span className="icon-button-glass flex h-10 w-10 shrink-0"><MapPin className="h-4 w-4 text-primary" /></span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{tx("Address")}</p>
                <p className="text-sm text-foreground">{company.address}</p>
              </div>
            </a>
          </div>
        </div>

        <div className="scroll-reveal md:col-span-1 md:col-start-2 md:row-span-2 md:row-start-1 md:flex md:min-h-0 lg:col-span-7 lg:col-start-6">
          {state === "success" ? (
            <div className="glass w-full rounded-lg p-8 text-center animate-scale-in md:p-10 lg:self-start">
              <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-6 w-6" />
              </span>
              <h3 className="font-display text-3xl">
                {tx(backendSaved ? "Your request was received." : "Your email draft is ready.")}
              </h3>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/75">
                {tx(
                  backendSaved
                    ? "We saved your details for the AIXCO team. You can also open an email draft if you want to send extra context."
                    : "We validated your details. Your browser has not sent anything yet; use the email draft to send your message directly to AIXCO.",
                )}
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href={mailtoHref} className="btn-gold justify-center">
                  <Mail className="h-4 w-4" />
                  {tx("Open email draft")}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setState("idle");
                    setMailtoHref("");
                    setBackendSaved(false);
                    setIsSubmitting(false);
                  }}
                  className="btn-ghost-gold justify-center"
                >
                  {tx("Edit details")}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid w-full gap-4 glass rounded-lg p-5 md:gap-5 md:p-6 lg:self-start lg:p-7">
              <div className="grid gap-4 md:grid-cols-2 md:gap-5">
                <Field label={tx("Name*")} name="name" error={errors.name} fieldRefs={fieldRefs} />
                <Field label={tx("Email*")} name="email" type="email" error={errors.email} fieldRefs={fieldRefs} />
              </div>
              <Field label={tx("Real estate interest")} name="interest" fieldRefs={fieldRefs} />
              <div>
                <label htmlFor="message" className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {tx("Message*")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder={tx("Message*")}
                  required
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  ref={(node) => {
                    fieldRefs.current.message = node;
                  }}
                  className="form-control resize-none"
                />
                {errors.message && <p id="contact-message-error" role="alert" className="mt-1 text-xs text-destructive">{errors.message}</p>}
              </div>
              {state === "error" && Object.keys(errors).length === 0 && (
                <p className="text-sm text-primary">{tx("Sorry, something went wrong.")}</p>
              )}
              <motion.button
                type="submit"
                aria-busy={isSubmitting}
                disabled={isSubmitting}
                className="btn-gold justify-self-start"
                whileHover={{ y: -2, scale: 1.012 }}
                whileTap={premiumPress}
              >
                {tx("Contact AIXCO")}
              </motion.button>
            </form>
          )}
        </div>

        <div className="scroll-reveal md:col-span-1 md:col-start-1 md:row-start-2 md:min-h-0 lg:col-span-5">
          <div className="mac-card h-full max-h-[18rem] overflow-hidden md:max-h-[20rem] lg:max-h-none">
            <Image
              src={aixcoLiveImages.transactionBackdrop}
              alt={tx("Contact")}
              loading="lazy"
              decoding="async"
              width={1280}
              height={720}
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="h-full min-h-[14rem] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  fieldRefs,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  fieldRefs: MutableRefObject<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>;
}) {
  const errorId = `contact-${name}-error`;

  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={label}
        required={name !== "interest"}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        ref={(node) => {
          fieldRefs.current[name] = node;
        }}
        className="form-control"
      />
      {error && <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
