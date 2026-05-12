import { Resend } from 'resend';

// Initialized once when the module is first imported
export const resend = new Resend(process.env.RESEND_API_KEY);

// XXX: Bleh, resend doesn't expose their types so w/e
export async function sendEmail(opts: any): Promise<any> {
  return await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'naoresponda@updates.cabotia.dev',
    ...opts,
  });
}
