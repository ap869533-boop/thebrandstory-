import nodemailer from 'nodemailer';

// Configure standard nodemailer transport
// In a real production scenario, use SMTP credentials.
// For development, we can log the OTP to the console, and use a test account if possible.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email', // Replace with real Ethereal or SMTP
    pass: process.env.SMTP_PASS || 'ethereal_password',
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  console.log(`\n=========================================`);
  console.log(`[TESTING] MOCK EMAIL SENT`);
  console.log(`To: ${to}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`=========================================\n`);
  
  // Try sending actual email if environment variables are set, otherwise just log to console.
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const info = await transporter.sendMail({
        from: '"thebrandsstory." <noreply@thebrandsstory..in>',
        to,
        subject: 'Your Login OTP - thebrandsstory.',
        text: `Your OTP for thebrandsstory. is: ${otp}. It is valid for 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #0f172a; text-align: center;">thebrandsstory. Authentication</h2>
            <p style="color: #475569; font-size: 16px;">Hello,</p>
            <p style="color: #475569; font-size: 16px;">Use the following OTP to complete your login/registration process. It is valid for <strong>5 minutes</strong>.</p>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
      console.log('Message sent: %s', info.messageId);
      // For Ethereal, you can get a preview URL
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error: any) {
      console.error('Error sending email:', error);
      if (error.responseCode === 535) {
        throw new Error('SMTP Authentication failed. Please check your Email and App Password in .env');
      }
      throw error;
    }
  }
};

export const sendWelcomeEmail = async (to: string, role: string, name: string) => {
  console.log(`\n=========================================`);
  console.log(`[TESTING] MOCK WELCOME EMAIL SENT`);
  console.log(`To: ${to}`);
  console.log(`Message: Welcome to thebrandsstory., ${name}!`);
  console.log(`=========================================\n`);
  
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const isCreator = role === 'CREATOR';
      const subject = isCreator ? 'Welcome to thebrandsstory. - Creator Registration Successful!' : 'Welcome to thebrandsstory. - Brand Registration Successful!';
      const contentText = isCreator 
        ? `Congratulations ${name}! You have successfully registered as a Creator on thebrandsstory.. We will review your profile shortly.`
        : `Congratulations ${name}! Your brand account has been successfully created. You can now post campaigns and hire verified influencers.`;
      
      const info = await transporter.sendMail({
        from: '"thebrandsstory." <noreply@thebrandsstory..in>',
        to,
        subject,
        text: contentText,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #0f172a; text-align: center;">Welcome to thebrandsstory. 🎉</h2>
            <p style="color: #475569; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #475569; font-size: 16px;">${contentText}</p>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">Thank you for joining India's biggest influencer platform.</p>
          </div>
        `,
      });
      console.log('Welcome Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }
};

export const sendApprovalEmail = async (to: string, name: string) => {
  console.log(`\n=========================================`);
  console.log(`[TESTING] MOCK APPROVAL EMAIL SENT`);
  console.log(`To: ${to}`);
  console.log(`Message: Your profile has been approved!`);
  console.log(`=========================================\n`);
  
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const info = await transporter.sendMail({
        from: '"thebrandsstory." <noreply@thebrandsstory..in>',
        to,
        subject: 'Profile Approved! - thebrandsstory.',
        text: `Congratulations ${name}! Your profile has been verified and approved by the thebrandsstory. admin. You will now receive direct brand enquiries!`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #10b981; text-align: center;">You're Approved! ✅</h2>
            <p style="color: #475569; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #475569; font-size: 16px;">We have great news! Your profile has been reviewed and officially verified by our team.</p>
            <p style="color: #475569; font-size: 16px;">You will now be visible to top brands and receive direct collaboration enquiries.</p>
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">Get ready for some amazing campaigns!</p>
          </div>
        `,
      });
      console.log('Approval Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending approval email:', error);
    }
  }
};
