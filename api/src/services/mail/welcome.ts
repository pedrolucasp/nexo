import { findUserById } from '@app/models/user';
import { sendEmail }  from '@app/lib/mail';

const email = (firstName: string) => {
  return (`
Oi! Seja bem vindo, ${firstName}.

Você criou sua conta com sucesso no orbit!

Qualquer coisa prende o grito!
  `)
}

export async function sendWelcomeEmail(userId: number): Promise<void> {
  const user = await findUserById(userId)!;

  console.log("Email/welcome: ", user);

  const { data, error } = await sendEmail({
    to: user!.email,
    subject: "Bem vindo ao orbit!",
    text: email(user!.firstName)
  });

  if (error) {
    console.error("Error sending email: ", error);
  }

  console.log("Email sent successfully!");
  console.log("Email ID:", data?.id);
}
