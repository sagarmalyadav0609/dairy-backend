import nodemailer from 'nodemailer';
import dns from 'dns';

// Helper to resolve smtp.gmail.com to IPv4 dynamically, bypassing any IPv6 network pathways
const resolveSmtpHost = async (host) => {
  try {
    const addresses = await dns.promises.resolve4(host);
    if (addresses && addresses.length > 0) {
      console.log(`DNS Resolved ${host} to IPv4 address: ${addresses[0]}`);
      return addresses[0];
    }
  } catch (err) {
    console.error(`DNS resolve4 failed for ${host}, using fallback:`, err.message);
  }
  return host;
};

export const sendOTP = async (email, otp) => {
  const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-b: 2px solid #f1f5f9;">
          <h2 style="color: #10b981; margin: 0;">Royal Dairy Farms</h2>
          <span style="font-size: 12px; color: #94a3b8; font-weight: bold; uppercase;">Security Authentication</span>
        </div>
        <p style="font-size: 14px; color: #334155;">Hello,</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">Your verification OTP code to access the Dairy Farm Management System is:</p>
        
        <div style="background-color: #f8fafc; text-align: center; padding: 15px; border-radius: 12px; font-size: 28px; font-weight: bold; color: #0f172a; border: 1px dashed #cbd5e1; letter-spacing: 4px; margin: 20px 0;">
          ${otp}
        </div>
        
        <p style="font-size: 12px; color: #ef4444; font-weight: 500;">Please note: This code is confidential and will expire in 5 minutes.</p>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-top: 30px; border-t: 1px solid #f1f5f9; padding-top: 20px;">
          Best regards,<br/>
          <strong>Royal Dairy Farm Support Team</strong>
        </p>
      </div>
  `;

  // If RESEND_API_KEY is available (e.g. on Render production), send via Resend HTTP API
  if (process.env.RESEND_API_KEY) {
    try {
      console.log(`Attempting to send OTP email via Resend HTTP API to ${email}...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Royal Dairy Farm <onboarding@resend.dev>',
          to: email,
          subject: 'Your Dairy Farm Verification OTP Code',
          html: mailHtml,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log(`OTP Email sent successfully via Resend to ${email}. ID: ${data.id}`);
      return { success: true };
    } catch (error) {
      console.error(`Resend API Send Email failed for ${email}:`, error.message);
      throw new Error(`Email delivery failed via Resend: ${error.message}`);
    }
  }

  // Fallback to Gmail SMTP (for local development)
  // We resolve the IP dynamically and pass it to nodemailer along with TLS servername validation
  const resolvedHost = await resolveSmtpHost('smtp.gmail.com');
  const transporter = nodemailer.createTransport({
    host: resolvedHost,
    port: 465,
    secure: true, // SSL/TLS
    auth: {
      user: 'sagarmalyadav9799@gmail.com',
      pass: 'ibqg sftx wzgp muwd',
    },
    tls: {
      servername: 'smtp.gmail.com', // Crucial to prevent hostname mismatch during handshake
    },
  });

  const mailOptions = {
    from: '"Royal Dairy Farm Support" <sagarmalyadav9799@gmail.com>',
    to: email,
    subject: 'Your Dairy Farm Verification OTP Code',
    text: `Hello,

Your verification OTP code to login to the Dairy Farm Management System is: ${otp}.

This OTP code will expire in 5 minutes. If you did not request this login, please ignore this email.

Best regards,
Royal Dairy Farm IT Team`,
    html: mailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP Email sent successfully via SMTP to ${email}. Message ID: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error(`SMTP Send Email failed for ${email}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};
