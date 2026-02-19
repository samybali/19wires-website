export const prerender = false;

import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
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
      from: "19wires <contact@19wires.com>",
      to: [import.meta.env.CONTACT_EMAIL],
      replyTo: email,
      subject: `[19Wires] Nouveau message — ${subject}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #fafafa; padding: 40px; border-radius: 16px;">

          <!-- Header -->
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 32px;">
            <div style="font-size: 20px; font-weight: 800; color: #ffffff;">
              19<span style="color: #60a5fa;">WIRES</span>
            </div>
          </div>

          <!-- Titre -->
          <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 8px 0; color: #60a5fa;">
            Nouveau message de contact
          </h1>
          <p style="color: #71717a; margin: 0 0 32px 0; font-size: 14px;">
            Reçu via le formulaire de contact 19Wires
          </p>

          <!-- Infos expéditeur -->
          <div style="background: #18181b; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #27272a;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #27272a; color: #71717a; font-size: 13px; font-weight: 600; width: 30%; text-transform: uppercase; letter-spacing: 0.05em;">
                  Nom
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #27272a; color: #fafafa; font-size: 14px;">
                  ${name}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #27272a; color: #71717a; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                  Email
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #27272a; color: #fafafa; font-size: 14px;">
                  <a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">
                    ${email}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #71717a; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                  Sujet
                </td>
                <td style="padding: 10px 0; color: #fafafa; font-size: 14px;">
                  ${subject}
                </td>
              </tr>
            </table>
          </div>

          <!-- Message -->
          <div style="background: #18181b; border-radius: 12px; padding: 24px; border: 1px solid #27272a;">
            <p style="color: #71717a; font-size: 13px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">
              Message
            </p>
            <p style="color: #d4d4d8; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">
              ${message}
            </p>
          </div>

          <!-- Bouton répondre -->
          <div style="text-align: center; margin-top: 32px;">
            <a
              href="mailto:${email}"
              style="display: inline-block; padding: 12px 28px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 14px;"
            >
              Répondre à ${name}
            </a>
          </div>

          <!-- Footer -->
          <p style="color: #3f3f46; font-size: 12px; margin-top: 40px; text-align: center; border-top: 1px solid #27272a; padding-top: 24px;">
            19Wires — Formulaire de contact automatique
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