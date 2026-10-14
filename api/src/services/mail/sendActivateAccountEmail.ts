import { findUserById } from '@app/services/user.service';
import { sendEmail }  from '@app/lib/mail';
import { logger } from '@app/lib/logger';

const email = (firstName: string, code: string) => {
  return (`
Oi, ${firstName}.

Você criou sua conta no nexo. Porém, precisa ativar sua conta.

Aqui seu código de ativação: ${code}.
O código expira em cinco minutos.

Qualquer coisa prende o grito!
  `)
}

export async function sendActivateAccountEmail(userId: number, code: string): Promise<void> {
  const user = await findUserById(userId)!;

  const { data, error } = await sendEmail({
    to: user!.email,
    subject: "Ative sua conta no nexo!",
    text: email(user!.firstName, code)
  });

  if (error) {
    logger.error({ err: error }, "Error sending email");
  }

  logger.info({ emailId: data?.id }, "Email sent successfully");
}
