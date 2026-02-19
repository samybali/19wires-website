export const prerender = false;

import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  // Vérification Content-Type
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return new Response(JSON.stringify({ error: "Content-Type invalide." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON invalide." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, email, subject, message } = body;

  // Validation serveur
  if (!name || !email || !subject || !message) {
    return new Response(
      JSON.stringify({ error: "Tous les champs sont requis." }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: "Email invalide." }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { error } = await resend.emails.send({
      from: "Contact <contact@19wires.com>",
      to: [import.meta.env.CONTACT_EMAIL],
      replyTo: email,
      subject: `[AgenceWeb] Nouveau message — ${subject}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #fafafa; padding: 40px; border-radius: 16px;">
          <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 8px; color: #a78bfa;">
            Nouveau message de contact
          </h1>
          <p style="color: #71717a; margin-bottom: 32px; font-size: 14px;">
            Reçu via le formulaire de contact AgenceWeb
          </p>

          <div style="background: #18181b; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #27272a;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #27272a; color: #71717a; font-size: 13px; font-weight: 600; width: 30%;">NOM</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #27272a; color: #fafafa; font-size: 14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #27272a; color: #71717a; font-size: 13px; font-weight: 600;">EMAIL</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #27272a; color: #fafafa; font-size: 14px;">
                  <a href="mailto:${email}" style="color: #a78bfa; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #71717a; font-size: 13px; font-weight: 600;">SUJET</td>
                <td style="padding: 10px 0; color: #fafafa; font-size: 14px;">${subject}</td>
              </tr>
            </table>
          </div>

          <div style="background: #18181b; border-radius: 12px; padding: 24px; border: 1px solid #27272a;">
            <p style="color: #71717a; font-size: 13px; font-weight: 600; margin-bottom: 12px;">MESSAGE</p>
            <p style="color: #d4d4d8; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>

          <p style="color: #52525b; font-size: 12px; margin-top: 32px; text-align: center;">
            AgenceWeb — Formulaire de contact automatique
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend Error]", error);
      return new Response(JSON.stringify({ error: "Échec de l'envoi." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Server Error]", err);
    return new Response(JSON.stringify({ error: "Erreur interne." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};