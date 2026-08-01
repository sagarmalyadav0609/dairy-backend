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
        // Check if it failed due to sandbox recipient restriction
        if (data.message && data.message.includes('only send testing emails')) {
          const match = data.message.match(/\(([^)]+)\)/);
          const allowedEmail = (match && match[1]) ? match[1] : 'sagarmalyadav0609@gmail.com';
          console.warn(`Resend Sandbox restriction detected. Re-routing email to verified Resend owner: ${allowedEmail}`);
          
          try {
            const retryResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: 'Royal Dairy Farm <onboarding@resend.dev>',
                to: allowedEmail,
                subject: `[Sandbox Route to ${email}] Your Verification OTP Code`,
                html: mailHtml,
              }),
            });
            const retryData = await retryResponse.json();
            if (retryResponse.ok) {
              console.log(`OTP Email successfully re-routed and sent via Resend to sandbox owner: ${allowedEmail}. ID: ${retryData.id}`);
              return { success: true };
            } else {
              console.error(`Resend Sandbox re-route retry failed: ${retryData.message}`);
            }
          } catch (retryErr) {
            console.error(`Resend Sandbox re-route connection failed: ${retryErr.message}`);
          }
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log(`OTP Email sent successfully via Resend to ${email}. ID: ${data.id}`);
      return { success: true };
    } catch (error) {
      console.warn(`Resend API Send Email failed for ${email}: ${error.message}. Falling back to SMTP...`);
    }
  }

  // Fallback to SMTP
  const sendViaSMTP = async (port, secure) => {
    const resolvedHost = await resolveSmtpHost('smtp.gmail.com');
    const transporter = nodemailer.createTransport({
      host: resolvedHost,
      port: port,
      secure: secure,
      auth: {
        user: 'sagarmalyadav9799@gmail.com',
        pass: 'ibqg sftx wzgp muwd',
      },
      tls: {
        servername: 'smtp.gmail.com',
        rejectUnauthorized: false,
      },
      connectionTimeout: 5000, // 5 seconds timeout before trying next port
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

    return await transporter.sendMail(mailOptions);
  };

  try {
    console.log(`Attempting SMTP send to ${email} via Port 465 (SSL)...`);
    const info = await sendViaSMTP(465, true);
    console.log(`OTP Email sent successfully via SMTP Port 465 to ${email}. Message ID: ${info.messageId}`);
    return { success: true };
  } catch (error465) {
    console.warn(`SMTP Port 465 failed: ${error465.message}. Falling back to Port 587 (TLS)...`);
    try {
      const info = await sendViaSMTP(587, false);
      console.log(`OTP Email sent successfully via SMTP Port 587 to ${email}. Message ID: ${info.messageId}`);
      return { success: true };
    } catch (error587) {
      console.error(`SMTP Port 587 failed: ${error587.message}`);
      throw new Error(`Email delivery failed: Port 465 failed (${error465.message}), Port 587 failed (${error587.message})`);
    }
  }
};
