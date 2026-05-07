import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM = "ScoutGrid <noreply@scoutgrid.com>";

export async function sendWelcomeEmail(to: string, name: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Welcome to ScoutGrid — Your Football Intelligence Platform",
    html: `
      <h1>Welcome to ScoutGrid, ${name}!</h1>
      <p>Your account has been created. Get started by completing your profile and choosing a membership plan.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/player">Go to Dashboard →</a>
    `,
  });
}

export async function sendMessageNotificationEmail(
  to: string,
  receiverName: string,
  senderName: string,
  messagePreview: string
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `New message from ${senderName} on ScoutGrid`,
    html: `
      <h2>You have a new message</h2>
      <p><strong>From:</strong> ${senderName}</p>
      <p><em>"${messagePreview.slice(0, 200)}..."</em></p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/player#messages">Read Message →</a>
    `,
  });
}

export async function sendSubscriptionConfirmationEmail(
  to: string,
  name: string,
  planName: string
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Your ScoutGrid ${planName} subscription is active`,
    html: `
      <h2>Subscription Confirmed</h2>
      <p>Hi ${name}, your <strong>${planName}</strong> subscription is now active.</p>
      <p>You now have full access to all ${planName} features.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard →</a>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Reset your ScoutGrid password",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link expires in 24 hours.</p>
      <a href="${resetUrl}">Reset Password →</a>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}
