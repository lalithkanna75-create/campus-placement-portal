const nodemailer = require("nodemailer");

let transporter = null;

/**
 * Initializes SMTP or Ethereal test transporter
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Ethereal / Local Mock Transporter for non-blocking local dev
    const testAccount = await nodemailer.createTestAccount().catch(() => null);
    if (testAccount) {
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`📧 [EmailService] Ethereal test mailbox initialized: ${testAccount.user}`);
    } else {
      // Fallback logger transporter
      transporter = {
        sendMail: async (opts) => {
          console.log(`📧 [Simulated Email to ${opts.to}] Subject: ${opts.subject}`);
          return { messageId: `mock-${Date.now()}` };
        },
      };
    }
  }

  return transporter;
};

/**
 * Send automated stage notification email to student
 */
const sendStatusUpdateEmail = async ({
  studentEmail,
  studentName,
  companyName,
  roleTitle,
  newStatus,
  feedbackNotes,
  interviewDate,
}) => {
  try {
    if (!studentEmail) return;

    const mailer = await getTransporter();

    const statusTitles = {
      SHORTLISTED: "🎉 Congratulations! You have been Shortlisted",
      INTERVIEW_SCHEDULED: "📅 Interview Scheduled for Your Application",
      OFFERED: "🌟 Placement Offer Extended!",
      REJECTED: "Update Regarding Your Placement Application",
    };

    const subject = `${statusTitles[newStatus] || "Status Update"} - ${companyName} (${roleTitle})`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #F8FAFC; color: #0F172A; border-radius: 16px; border: 1px solid #E2E8F0;">
        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 20px; border-radius: 12px; text-align: center; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">NexPlacement Portal</h1>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Campus Recruitment Notification</p>
        </div>

        <p style="font-size: 14px; line-height: 1.6;">Dear <strong>${studentName || "Student"}</strong>,</p>
        
        <p style="font-size: 14px; line-height: 1.6;">
          Your application for <strong>${roleTitle}</strong> at <strong>${companyName}</strong> has progressed to:
        </p>

        <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <span style="display: inline-block; background-color: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; font-weight: 800; font-size: 13px; padding: 6px 16px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${newStatus.replace("_", " ")}
          </span>
          ${interviewDate ? `
            <div style="margin-top: 12px; font-size: 13px; color: #475569; font-weight: 600;">
              🗓️ Interview Date & Time: <strong>${new Date(interviewDate).toLocaleString()}</strong>
            </div>
          ` : ""}
          ${feedbackNotes ? `
            <div style="margin-top: 12px; padding: 12px; background-color: #F1F5F9; border-radius: 8px; font-size: 12px; color: #334155; text-align: left;">
              <strong>Recruiter Notes:</strong> ${feedbackNotes}
            </div>
          ` : ""}
        </div>

        <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
          Please log in to your <a href="http://localhost:5173" style="color: #4F46E5; text-decoration: none; font-weight: 700;">NexPlacement Student Dashboard</a> to check complete drive timelines and upcoming interview rounds.
        </p>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; text-align: center;">
          NexPlacement Campus Recruitment & Placement Portal • Automated Notification
        </div>
      </div>
    `;

    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"NexPlacement Campus Portal" <placement@university.edu>',
      to: studentEmail,
      subject,
      html,
    });

    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`✉️ [Ethereal Email Preview]: ${previewUrl}`);
      }
    }

    return info;
  } catch (error) {
    console.warn(`[EmailService] Failed to send email alert:`, error.message);
  }
};

module.exports = {
  sendStatusUpdateEmail,
};
