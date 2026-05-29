import { findUserById } from '@app/services/user.service';
import { sendEmail }  from '@app/lib/mail';

const email = (firstName: string, code: string) => {
  return (`
Oi! Seja bem vindo, ${firstName}.

Você criou sua conta com sucesso no orbit! Aqui seu código de ativação: ${code}.

Qualquer coisa prende o grito!
  `)
}

export async function sendWelcomeEmail(userId: number, code: string): Promise<void> {
  const user = await findUserById(userId)!;

  console.log("Email/welcome: ", user, code);

  const { data, error } = await sendEmail({
    to: user!.email,
    subject: "Bem vindo ao orbit!",
    text: email(user!.firstName, code)
  });

  if (error) {
    console.error("Error sending email: ", error);
  }

  console.log("Email sent successfully!");
  console.log("Email ID:", data?.id);
}
