import { sendEmail } from '@app/lib/mail';
import { findUserById } from '@app/services/user.service';

const email = (firstName: string) => (`
Oi, ${firstName}!

Preparamos um arquivo com os seus dados do nexo e anexamos a este e-mail. Ele
é um .zip com os seus dados em CSV, além de um "leia-me" explicando o conteúdo.

Guarde com carinho — agora ele é seu.

Qualquer coisa prende o grito!
`);

export async function sendExportReadyEmail(
  userId: number,
  attachment: { filename: string; buffer: Buffer },
): Promise<void> {
  const user = await findUserById(userId);

  const { error } = await sendEmail({
    to: user!.email,
    subject: 'Seus dados do nexo',
    text: email(user!.firstName),
    attachments: [{ filename: attachment.filename, content: attachment.buffer }],
  });

  if (error) {
    console.error("Error sending export email: ", error);
    throw new Error("Não foi possível enviar o e-mail com seus dados");
  }
}
