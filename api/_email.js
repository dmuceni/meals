import { Resend } from "resend";

export async function sendDietImportedEmail({ to, displayName, planName }) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM || !to) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to,
    subject: "Dieta caricata",
    text: `Ciao ${displayName || ""}, il piano "${planName || "Piano alimentare"}" e stato caricato correttamente.`
  });
}
