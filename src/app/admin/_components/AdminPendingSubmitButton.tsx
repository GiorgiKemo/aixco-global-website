"use client";

import { LoaderCircle, Send, Trash2, UserPlus } from "lucide-react";
import { useFormStatus } from "react-dom";

type AdminPendingSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  icon: "send" | "user-plus" | "trash";
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
  const Icon = pending ? LoaderCircle : icon === "send" ? Send : icon === "trash" ? Trash2 : UserPlus;

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
