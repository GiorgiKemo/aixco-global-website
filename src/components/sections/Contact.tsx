import { useState } from "react";
import { z } from "zod";
import { Mail, MapPin, Check, Loader2 } from "lucide-react";
import { company } from "@/data/site";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  interest: z.enum(["bond", "apartment", "broker", "developer", "other"]),
  message: z.string().trim().min(10, "Please share a few details").max(1500),
});

type State = "idle" | "submitting" | "success" | "error";

export function Contact() {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      interest: String(form.get("interest") || "other") as any,
      message: String(form.get("message") || ""),
    };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      setState("error");
      return;
    }
    setErrors({});
    setState("submitting");
    // Simulated submission (no GET querystring)
    await new Promise((r) => setTimeout(r, 1000));
    setState("success");
  };

  return (
    <section id="contact" className="relative py-28 md:py-36 scroll-mt-24 bg-surface/40">
      <div className="container-x grid lg:grid-cols-12 gap-12">
        <div className="scroll-reveal lg:col-span-5">
          <p className="eyebrow">Contact</p>
          <h2 className="heading-section mt-5">Speak with <span className="text-gold italic">AIXCO</span>.</h2>
          <p className="mt-5 text-foreground/80 leading-relaxed max-w-md">
            Tell us how you'd like to participate. Our team replies within one business day.
          </p>
          <div className="mt-10 space-y-5">
            <a href={`mailto:${company.email}`} className="flex items-start gap-4 group">
              <span className="icon-button-glass flex h-10 w-10 shrink-0"><Mail className="h-4 w-4 text-primary" /></span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</p>
                <p className="text-sm text-foreground link-underline w-fit">{company.email}</p>
              </div>
            </a>
            <div className="flex items-start gap-4">
              <span className="icon-button-glass flex h-10 w-10 shrink-0"><MapPin className="h-4 w-4 text-primary" /></span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Headquarters</p>
                <p className="text-sm text-foreground">{company.address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-reveal lg:col-span-7">
          {state === "success" ? (
            <div className="glass rounded-lg p-10 text-center animate-scale-in">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-5">
                <Check className="h-6 w-6" />
              </span>
              <h3 className="font-display text-3xl">Thank you.</h3>
              <p className="mt-3 text-sm text-muted-foreground">An AIXCO advisor will be in touch within one business day.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-6 glass rounded-lg p-7 md:p-10">
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Full name" name="name" error={errors.name} />
                <Field label="Email" name="email" type="email" error={errors.email} />
              </div>
              <div>
                <label htmlFor="interest" className="text-xs uppercase tracking-widest text-muted-foreground">I'm interested in</label>
                <select id="interest" name="interest" defaultValue="bond" className="form-control mt-1.5">
                  <option value="bond">The AIXCO 6% Bond</option>
                  <option value="apartment">An apartment in Batumi</option>
                  <option value="broker">Becoming a broker partner</option>
                  <option value="developer">Co-financing a project (developer)</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
                <textarea id="message" name="message" rows={5} className="form-control mt-1.5 resize-none" />
                {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
              </div>
              <button type="submit" disabled={state === "submitting"} className="btn-gold justify-self-start">
                {state === "submitting" ? (<><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>) : "Send message"}
              </button>
              <p className="text-[11px] text-muted-foreground">We never sell personal data. By submitting you accept our Privacy Policy.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", error }: { label: string; name: string; type?: string; error?: string }) {
  return (
    <div>
      <label htmlFor={name} className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input id={name} name={name} type={type} required aria-invalid={!!error} className="form-control mt-1.5" />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
