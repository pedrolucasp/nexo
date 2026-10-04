import { sendEmail } from '@app/lib/mail';
import { findUserById } from '@app/services/user.service';

const email = (firstName: string) => (`
Oi, ${firstName}.

Infelizmente não conseguimos preparar o arquivo com os seus dados do nexo
agora. Nada se perdeu — é só tentar de novo pela opção "Exportar Meus Dados"
nas configurações.

Qualquer coisa prende o grito!
`);

export async function sendExportFailedEmail(userId: number): Promise<void> {
  const user = await findUserById(userId);

  const { error } = await sendEmail({
    to: user!.email,
    subject: 'Não conseguimos exportar seus dados',
    text: email(user!.firstName),
  });

  if (error) {
    console.error("Error sending export failure email: ", error);
    throw new Error("Não foi possível enviar o e-mail de falha da exportação");
  }
}
