export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendNotificationEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const host = process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io';
  const port = Number(process.env.SMTP_PORT) || 2525;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'Dz-Fleet AI <notifications@dzfleet.dz>';

  console.log(`[Email Service] Préparation d'envoi vers ${payload.to} | Sujet: "${payload.subject}" | SMTP: ${host}:${port}`);

  if (!user || !pass) {
    console.log('[Email Service] Identifiants SMTP non définis. Simulation de l\'envoi (succès virtuel pour Dev) :');
    console.log(`[Email Contenu] : ${payload.subject}`);
    return {
      success: true,
      messageId: `simulated-${Date.now()}`,
    };
  }

  try {
    // Dynamic import to support optional nodemailer dependency
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text || payload.html.replace(/<[^>]*>/g, ''),
      html: payload.html,
    });

    console.log(`[Email Service] Email délivré avec succès (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[Email Service] Erreur lors de l\'envoi SMTP :', err.message);
    return { success: false, error: err.message };
  }
}
