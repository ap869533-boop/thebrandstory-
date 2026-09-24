import nodemailer from 'nodemailer';

/**
 * Creates and returns a production-ready Nodemailer Transporter instance.
 * Lazily created to guarantee environment variables are fully loaded.
 */
export const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS || '';
  const cleanPass = rawPass.replace(/\s+/g, ''); // Strip spaces from Gmail 16-char app passwords

  if (!user || !cleanPass) {
    throw new Error('Email service credentials missing: Please ensure SMTP_USER and SMTP_PASS are set in .env');
  }

  // If using Gmail SMTP
  if (host.includes('gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass: cleanPass,
      },
    });
  }

  // Standard custom SMTP (Hostinger, AWS SES, Zoho, Sendgrid, etc.)
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const getFromAddress = () => {
  const user = process.env.SMTP_USER || 'support@thebrandsstory.com';
  return process.env.SMTP_FROM || `"thebrandsstory." <${user}>`;
};

/**
 * Sends a real 6-digit verification OTP to the user's email address.
 */
export const sendOtpEmail = async (to: string, otp: string) => {
  const transporter = getTransporter();
  const from = getFromAddress();

  console.log(`[EMAIL DISPATCH] Sending real OTP email to: ${to}`);

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `${otp} is your verification OTP - thebrandsstory.`,
      text: `Your OTP for thebrandsstory. is: ${otp}. This code is valid for 5 minutes. Do not share it with anyone.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">thebrandsstory<span style="color: #D4A338;">.</span></h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 500;">India's Premier Influencer & Brand Platform</p>
          </div>
          
          <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hello,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
              Use the following One-Time Password (OTP) to complete your verification on <strong>thebrandsstory.</strong>
            </p>
            
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1.5px dashed #cbd5e1; padding: 22px; text-align: center; border-radius: 12px; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #0f172a; font-family: monospace;">${otp}</span>
              <p style="color: #64748b; font-size: 11px; margin: 8px 0 0 0; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Valid for 5 minutes only</p>
            </div>
            
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
              ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone, including thebrandsstory. team members.
            </p>
          </div>
          
          <div style="border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 16px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              If you didn't request this code, you can safely ignore this message.
            </p>
            <p style="color: #cbd5e1; font-size: 11px; margin: 6px 0 0 0;">
              © ${new Date().getFullYear()} thebrandsstory. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    console.log(`✅ [EMAIL SUCCESS] Real OTP delivered to ${to} | ID: ${info.messageId}`);
    return info;
  } catch (error: any) {
    console.error(`❌ [EMAIL FAILURE] Could not deliver OTP to ${to}:`, error.message || error);
    if (error.responseCode === 535) {
      throw new Error('Email server authentication failed: Please verify the Gmail App Password in your server .env file.');
    }
    throw new Error(`Failed to send OTP email: ${error.message || 'SMTP Connection Error'}`);
  }
};

/**
 * Sends a welcome email upon successful user registration.
 */
export const sendWelcomeEmail = async (to: string, role: string, name: string) => {
  try {
    const transporter = getTransporter();
    const from = getFromAddress();
    const isCreator = role === 'CREATOR';
    const roleTitle = isCreator ? 'Creator & Influencer' : 'Brand / Agency';

    await transporter.sendMail({
      from,
      to,
      subject: `Welcome to thebrandsstory., ${name}! 🎉`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">thebrandsstory<span style="color: #D4A338;">.</span></h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Welcome to India's Premier Influencer Network</p>
          </div>
          <p style="color: #334155; font-size: 15px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Your account has been successfully created as a <strong>${roleTitle}</strong>.
            ${isCreator ? 'You can now complete your public profile, set your commercial rates, and receive high-paying brand collaborations directly!' : 'You can now post campaign briefs, discover vetted creators across 40+ Indian cities, and start hiring influencers seamlessly.'}
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://thebrandsstory.com" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block;">
              Open Dashboard →
            </a>
          </div>
        </div>
      `,
    });
    console.log(`✅ [WELCOME EMAIL] Sent to ${to}`);
  } catch (error: any) {
    console.warn(`[WELCOME EMAIL WARNING] Could not send welcome email to ${to}:`, error.message);
  }
};

/**
 * Sends an approval confirmation email when admin verifies an influencer.
 */
export const sendApprovalEmail = async (to: string, name: string) => {
  try {
    const transporter = getTransporter();
    const from = getFromAddress();

    await transporter.sendMail({
      from,
      to,
      subject: `Your Creator Profile is Verified & Approved! ✅ - thebrandsstory.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #10b981; text-align: center; margin-top: 0;">You're Officially Verified! ✅</h2>
          <p style="color: #334155; font-size: 15px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            We are excited to inform you that your creator profile has been reviewed and verified by the <strong>thebrandsstory.</strong> curation team.
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Your profile is now featured in discovery listings and brands can directly send collaboration enquiries to you.
          </p>
        </div>
      `,
    });
    console.log(`✅ [APPROVAL EMAIL] Sent to ${to}`);
  } catch (error: any) {
    console.warn(`[APPROVAL EMAIL WARNING] Could not send approval email to ${to}:`, error.message);
  }
};

/**
 * Sends a reminder email to an influencer to complete their profile.
 */
export const sendProfileReminderEmail = async (to: string, name: string) => {
  try {
    const transporter = getTransporter();
    const from = getFromAddress();

    await transporter.sendMail({
      from,
      to,
      subject: `Complete Your Profile on The Brands Story`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #334155; text-align: center; margin-top: 0;">Hey ${name}, 👋</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Your profile on <strong>The Brands Story</strong> is incomplete.
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Please complete your profile to <strong>80% or above</strong> to proceed with the approval process.
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            A complete profile helps brands discover you and consider you for collaborations.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://thebrandsstory.com/dashboard" style="background-color: #D4A338; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block;">
              Complete Your Profile →
            </a>
          </div>
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-top: 20px;">
            Best regards,<br/>
            <strong>Team The Brands Story</strong>
          </p>
        </div>
      `,
    });
    console.log(`✅ [REMINDER EMAIL] Sent to ${to}`);
  } catch (error: any) {
    console.warn(`[REMINDER EMAIL WARNING] Could not send reminder email to ${to}:`, error.message);
    throw new Error('Unable to send the email. Please check the mail service configuration and try again.');
  }
};

/**
 * Sends an admin-requested warning when profile information needs correction.
 */
export const sendProfileInformationWarningEmail = async (to: string, name: string) => {
  try {
    const transporter = getTransporter();
    const from = getFromAddress();

    await transporter.sendMail({
      from,
      to,
      subject: `Action required: review your profile information - The Brands Story`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #b45309; text-align: center; margin-top: 0;">Please review your profile</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hey <strong>${name}</strong>,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            During our review, we found profile information that appears incomplete, inaccurate, or inconsistent.
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Please review and update your social handles, audience metrics, pricing, contact details, and portfolio with accurate, current information. Accurate profiles help us maintain a trusted platform and allow brands to consider you for collaborations.
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Your profile cannot proceed to approval until the required corrections are made.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://thebrandsstory.com/dashboard" style="background-color: #D4A338; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; display: inline-block;">
              Review Your Profile &rarr;
            </a>
          </div>
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-top: 20px;">
            Best regards,<br/>
            <strong>Team The Brands Story</strong>
          </p>
        </div>
      `,
    });
    console.log(`[PROFILE INFORMATION WARNING EMAIL] Sent to ${to}`);
  } catch (error: any) {
    console.warn(`[PROFILE INFORMATION WARNING EMAIL] Could not send to ${to}:`, error.message);
    throw new Error('Unable to send the email. Please check the mail service configuration and try again.');
  }
};
