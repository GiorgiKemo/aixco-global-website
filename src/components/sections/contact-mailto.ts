import { company } from "@/data/site";

export type ContactMailtoData = {
  name: string;
  email: string;
  interest?: string;
  message: string;
};

export function createContactMailtoHref(data: ContactMailtoData, recipientEmail = company.email) {
  const subject = encodeURIComponent(`AIXCO contact request from ${data.name}`);
  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.interest ? `Interest: ${data.interest}` : "Interest: Not specified",
    "",
    data.message,
  ];
  return `mailto:${recipientEmail}?subject=${subject}&body=${encodeURIComponent(lines.join("\n"))}`;
}
