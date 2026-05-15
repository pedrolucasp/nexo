import { findUserById } from '@app/services/user.service';
import { sendEmail }  from '@app/lib/mail';

const email = (firstName: string, token: string) => {
  return (`
Oi, ${firstName}.

Ouvimos por aí que você precisa trocar a senha?

Segue o código para você digitar no app: ${token}

Qualquer coisa prende o grito!
`)
}

export async function sendResetPasswordEmail(userId: number, token: string): Promise<void> {
  const user = await findUserById(userId)!;

  console.log("Email/passwdReset: ", user);

  const { data, error } = await sendEmail({
    to: user!.email,
    subject: "Esqueceu a senha do orbit?",
    text: email(user!.firstName, token)
  });

  if (error) {
    console.error("Error sending email: ", error);
  }

  console.log("Email sent successfully!");
  console.log("Email ID:", data?.id);
}
