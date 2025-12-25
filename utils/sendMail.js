import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const APP_URL = process.env.APP_URL || "http://localhost:5173";
const IS_TEST = process.env.NODE_ENV === "test";

if (!SMTP_USER || !SMTP_PASS) {
  if (!IS_TEST) {
    console.warn("SMTP credentials missing - email sending will fail until configured.");
  }
}

const transporter =
  SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    : null;

export async function sendApprovalEmail(toEmail, companyName) {
  if (!transporter) {
    return true;
  }

  const mailOptions = {
    from: `"Support MyApp" <${SMTP_USER}>`,
    to: toEmail,
    subject: "Votre compte entreprise est approuvé",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Bonjour ${companyName},</h2>
        <p>Votre compte entreprise vient d'être <strong style="color: green;">approuvé</strong>.</p>
        <p>Vous pouvez maintenant accéder à votre espace :</p>
        <a href="${APP_URL}/login"
          style="background: #0ea5e9; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-size: 16px;">
          Se connecter
        </a>
        <p style="font-size: 14px; color: #777;">— L'équipe MyApp</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
}
