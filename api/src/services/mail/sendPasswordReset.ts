import { findUserById } from '@app/services/user.service';
import { sendEmail }  from '@app/lib/mail';
import { logger } from '@app/lib/logger';

const APP_SCHEME = 'orbit';
const RESET_PATH = 'auth/reset-password';

const resetLink = (token: string) => `${APP_SCHEME}://${RESET_PATH}?token=${token}`;

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char]!,
  );

const text = (firstName: string, token: string) => `
Oi, ${firstName}.

Ouvimos por aí que você precisa trocar a senha.

Abra este link no celular para escolher uma nova senha:
${resetLink(token)}

O link expira em uma hora.

Qualquer coisa prende o grito!
`;

const html = (firstName: string, token: string) => `
<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6; color: #111;">
  <p>Oi, ${escapeHtml(firstName)}.</p>
  <p>Ouvimos por aí que você precisa trocar a senha.</p>
  <p>
    <a href="${resetLink(token)}"
       style="display: inline-block; padding: 12px 20px; border-radius: 8px; background-color: #13ec5b; color: #111; font-weight: bold; text-decoration: none;">
      Escolher uma nova senha
    </a>
  </p>
  <p style="font-size: 13px; color: #666;">
    Se o botão não abrir o app, copie e cole este endereço no celular:<br />
    ${resetLink(token)}
  </p>
  <p>O link expira em uma hora.</p>
  <p>Qualquer coisa prende o grito!</p>
</div>
`;

export async function sendResetPasswordEmail(userId: number, token: string): Promise<void> {
  const user = await findUserById(userId)!;

  const { data, error } = await sendEmail({
    to: user!.email,
    subject: "Esqueceu a senha do nexo?",
    text: text(user!.firstName, token),
    html: html(user!.firstName, token),
  });

  if (error) {
    logger.error({ err: error }, "Error sending email");
  }

  logger.info({ emailId: data?.id }, "Email sent successfully");
}
