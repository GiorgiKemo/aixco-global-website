"use client";

import { LoaderCircle, Send, UserPlus } from "lucide-react";
import { useFormStatus } from "react-dom";

type AdminPendingSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  icon: "send" | "user-plus";
  disabled?: boolean;
  className?: string;
};

export function AdminPendingSubmitButton({
  idleLabel,
  pendingLabel,
  icon,
  disabled = false,
  className = "",
}: AdminPendingSubmitButtonProps) {
  const { pending } = useFormStatus();
  const Icon = pending ? LoaderCircle : icon === "send" ? Send : UserPlus;

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={className}
    >
      <Icon className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} aria-hidden="true" />
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
