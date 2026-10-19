import { Resend } from 'resend';

// Built on first send, not at import: a module that reads a secret at import
// time makes every importer require it, so a missing RESEND_API_KEY crashes
// app boot and any test that transitively imports this file.
let client: Resend | undefined;

const getResend = (): Resend => {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);

  return client;
};

// XXX: Bleh, resend doesn't expose their types so w/e
export async function sendEmail(opts: any): Promise<any> {
  return await getResend().emails.send({
    from: process.env.RESEND_FROM ?? 'naoresponda@updates.cabotia.dev',
    ...opts,
  });
}
