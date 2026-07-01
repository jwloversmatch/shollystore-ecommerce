declare module 'brevo' {
  export class TransactionalEmailsApi {
    setApiKey(apiKey: string, value: string): void;
    sendTransacEmail(email: SendSmtpEmail): Promise<any>;
  }

  export const TransactionalEmailsApiApiKeys: {
    apiKey: string;
  };

  export class SendSmtpEmail {
    subject: string;
    htmlContent: string;
    to: { email: string }[];
    sender: { email: string; name: string };
  }
}