import { findUserById } from '@app/services/user.service';
import { sendEmail }  from '@app/lib/mail';

const email = (firstName: string, code: string) => {
  return (`
Oi, ${firstName}.

Você criou sua conta no nexo. Porém, precisa ativar sua conta.

Aqui seu código de ativação: ${code}.

Qualquer coisa prende o grito!
  `)
}

export async function sendActivateAccountEmail(userId: number, code: string): Promise<void> {
  const user = await findUserById(userId)!;

  console.log("Email/activateAccount: ", user, code);

  const { data, error } = await sendEmail({
    to: user!.email,
    subject: "Ative sua conta no nexo!",
    text: email(user!.firstName, code)
  });

  if (error) {
    console.error("Error sending email: ", error);
  }

  console.log("Email sent successfully!");
  console.log("Email ID:", data?.id);
}
