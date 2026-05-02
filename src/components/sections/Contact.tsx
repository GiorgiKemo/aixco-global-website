import { useState } from "react";
import { z } from "zod";
import { Mail, MapPin, Check, Loader2 } from "lucide-react";
import { company } from "@/data/site";
import { motion } from "framer-motion";
import { premiumPress } from "@/lib/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveImages } from "@/lib/aixco-live-assets";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  interest: z.string().trim().max(255).optional(),
  message: z.string().trim().min(10, "Please share a few details").max(1500),
});

type State = "idle" | "submitting" | "success" | "error";

export function Contact() {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { tx } = useI18n();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      parsed.error.issues.forEach((issue) => { errs[String(issue.path[0])] = issue.message; });
      setErrors(errs);
      setState("error");
      return;
    }
    setErrors({});
    setState("submitting");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setState("success");
  };

  return (
    <section id="contact" className="relative py-28 md:py-36 scroll-mt-24 bg-surface/40">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="scroll-reveal lg:col-span-5">
          <p className="eyebrow">{tx("Contact")}</p>
          <h2 className="heading-section mt-5">
            <span className="text-gold">{tx("Start")}</span> {tx("your participation in Global real estate opportunities")}
          </h2>
          <p className="mt-5 max-w-md text-foreground/80 leading-relaxed">
            {tx("Register with us now, and start participating in exclusive real estate opportunities from €1,000.")}
          </p>
          <div className="mt-10 space-y-5">
            <a href={`mailto:${company.email}`} className="group flex items-start gap-4">
              <span className="icon-button-glass flex h-10 w-10 shrink-0"><Mail className="h-4 w-4 text-primary" /></span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</p>
                <p className="text-sm text-foreground link-underline w-fit">{company.email}</p>
              </div>
            </a>
            <a href="https://maps.app.goo.gl/AVywyfokNdm4VuLD9" target="_blank" rel="noreferrer" className="flex items-start gap-4">
              <span className="icon-button-glass flex h-10 w-10 shrink-0"><MapPin className="h-4 w-4 text-primary" /></span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Address</p>
                <p className="text-sm text-foreground">{company.address}</p>
              </div>
            </a>
          </div>
          <div className="mac-card mt-10 overflow-hidden">
            <img
              src={aixcoLiveImages.contact}
              alt={tx("Contact")}
              loading="lazy"
              width={1280}
              height={720}
              className="h-56 w-full object-cover"
            />
          </div>
        </div>

        <div className="scroll-reveal lg:col-span-7">
          {state === "success" ? (
            <div className="glass rounded-lg p-10 text-center animate-scale-in">
              <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-6 w-6" />
              </span>
              <h3 className="font-display text-3xl">{tx("Thank you, your message has been sent.")}</h3>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-6 glass rounded-lg p-7 md:p-10">
              <div className="grid gap-6 md:grid-cols-2">
                <Field placeholder={tx("Name*")} name="name" error={errors.name} />
                <Field placeholder={tx("Email*")} name="email" type="email" error={errors.email} />
              </div>
              <Field placeholder={tx("Participation interest")} name="interest" />
              <div>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder={tx("Message*")}
                  className="form-control resize-none"
                />
                {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
              </div>
              {state === "error" && Object.keys(errors).length === 0 && (
                <p className="text-sm text-primary">{tx("Sorry, something went wrong.")}</p>
              )}
              <motion.button
                type="submit"
                disabled={state === "submitting"}
                className="btn-gold justify-self-start"
                whileHover={{ y: -2, scale: 1.012 }}
                whileTap={premiumPress}
              >
                {state === "submitting" ? (<><Loader2 className="h-4 w-4 animate-spin" /> {tx("Contact AIXCO")}</>) : tx("Contact AIXCO")}
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ placeholder, name, type = "text", error }: { placeholder: string; name: string; type?: string; error?: string }) {
  return (
    <div>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={name !== "interest"}
        aria-invalid={!!error}
        className="form-control"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
