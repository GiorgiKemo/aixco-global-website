import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAdminSession } from "@/lib/admin/auth";
import { leadResourceSchema, leadStatusSchema, updateLeadStatus } from "@/lib/admin/leads";

const statusUpdateSchema = z.object({
  resource: leadResourceSchema,
  id: z.string().uuid(),
  status: leadStatusSchema,
});

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return redirectTo(request, "/admin/login");
  }

  const formData = await request.formData();
  const parsed = statusUpdateSchema.safeParse({
    resource: formData.get("resource"),
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return redirectTo(request, "/admin/leads?error=invalid-status-update");
  }

  try {
    await updateLeadStatus(parsed.data.resource, parsed.data.id, parsed.data.status);
    return redirectTo(request, `/admin/leads?updated=1#${parsed.data.resource}-${parsed.data.id}`);
  } catch {
    return redirectTo(request, "/admin/leads?error=status-update-failed");
  }
}
