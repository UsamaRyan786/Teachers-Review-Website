import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'UCP Teacher Reviews';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

let transporter = null;

const isEmailConfigured = () => Boolean(SMTP_USER && SMTP_PASS);

const isPublicUrl = (url) => {
  try {
    const { hostname } = new URL(url);
    return hostname !== 'localhost' && hostname !== '127.0.0.1';
  } catch {
    return false;
  }
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const getTransporter = () => {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      pool: true,
      maxConnections: 1,
      rateLimit: 5,
    });
  }
  return transporter;
};

const buildReviewEmail = ({ teacher, review }) => {
  const recommendText = review.wouldRecommend ? 'Yes' : 'No';
  const ratingText = `${review.rating} out of 5`;
  const profileUrl = isPublicUrl(CLIENT_URL)
    ? `${CLIENT_URL.replace(/\/$/, '')}/teacher/${teacher.slug || teacher._id}`
    : '';

  const textLines = [
    `Dear ${teacher.name},`,
    '',
    'You received new student feedback on the UCP Teacher Reviews platform.',
    '',
    '--- Review details ---',
    `Student name: ${review.studentName}`,
  ];

  if (review.course) textLines.push(`Course: ${review.course}`);
  textLines.push(
    `Rating: ${ratingText}`,
    `Would recommend this teacher: ${recommendText}`,
    '',
    'Student comment:',
    review.comment,
    ''
  );

  if (profileUrl) {
    textLines.push(`View this profile online: ${profileUrl}`, '');
  }

  textLines.push(
    '---',
    'This is an automated notification from UCP Teacher Reviews.',
    'Student reviews are submitted by UCP students and are not official university statements.',
    '',
    `Notification sent by ${SMTP_FROM_NAME}.`,
    `Reply to this email if you need to contact the platform administrator (${SMTP_FROM}).`
  );

  const text = textLines.join('\n');

  const htmlCourse = review.course
    ? `<tr><td style="padding:6px 0;color:#555;">Course</td><td style="padding:6px 0;">${escapeHtml(review.course)}</td></tr>`
    : '';

  const htmlLink = profileUrl
    ? `<p style="margin:20px 0 0;font-size:14px;">Profile link: <a href="${escapeHtml(profileUrl)}">${escapeHtml(profileUrl)}</a></p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Student feedback</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;">
  <div style="font-family:Georgia,'Times New Roman',serif;max-width:560px;margin:24px auto;padding:24px;background:#ffffff;border:1px solid #e0e0e0;">
    <p style="margin:0 0 16px;font-size:15px;color:#222;">Dear ${escapeHtml(teacher.name)},</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#333;">
      You received new student feedback on the UCP Teacher Reviews platform.
    </p>
    <table style="width:100%;font-size:14px;color:#222;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#555;width:160px;">Student name</td><td style="padding:6px 0;">${escapeHtml(review.studentName)}</td></tr>
      ${htmlCourse}
      <tr><td style="padding:6px 0;color:#555;">Rating</td><td style="padding:6px 0;">${escapeHtml(ratingText)}</td></tr>
      <tr><td style="padding:6px 0;color:#555;">Would recommend</td><td style="padding:6px 0;">${escapeHtml(recommendText)}</td></tr>
    </table>
    <p style="margin:20px 0 8px;font-size:14px;color:#555;">Student comment</p>
    <p style="margin:0;padding:12px;background:#fafafa;border-left:3px solid #ccc;font-size:14px;line-height:1.6;color:#222;">
      ${escapeHtml(review.comment).replace(/\n/g, '<br>')}
    </p>
    ${htmlLink}
    <hr style="margin:24px 0;border:none;border-top:1px solid #e0e0e0;">
    <p style="margin:0;font-size:12px;line-height:1.5;color:#666;">
      Automated notification from ${escapeHtml(SMTP_FROM_NAME)}.<br>
      Student reviews are not official university statements.<br>
      Sent from ${escapeHtml(SMTP_FROM)}
    </p>
  </div>
</body>
</html>`;

  return {
    subject: `Student feedback for ${teacher.name}`,
    text,
    html,
  };
};

export const sendReviewNotification = async (teacher, review) => {
  if (!teacher?.email?.trim()) {
    console.warn(`No email for ${teacher?.name || 'teacher'} — review notification skipped`);
    return { sent: false, reason: 'no_teacher_email' };
  }

  const transport = getTransporter();
  if (!transport) {
    console.warn('Email not configured (SMTP_USER / SMTP_PASS missing) — review notification skipped');
    return { sent: false, reason: 'not_configured' };
  }

  const { subject, text, html } = buildReviewEmail({ teacher, review });
  const to = teacher.email.trim();

  try {
    await transport.sendMail({
      from: {
        name: SMTP_FROM_NAME,
        address: SMTP_FROM,
      },
      to,
      replyTo: {
        name: SMTP_FROM_NAME,
        address: SMTP_FROM,
      },
      subject,
      text,
      html,
      headers: {
        'Auto-Submitted': 'auto-generated',
        'X-Auto-Response-Suppress': 'All',
        'X-Mailer': 'UCP Teacher Reviews',
        Precedence: 'auto',
      },
      priority: 'normal',
    });

    console.log(`Review email sent to ${to} for ${teacher.name}`);
    return { sent: true, to };
  } catch (err) {
    console.error(`Failed to send review email to ${to}:`, err.message);
    return { sent: false, reason: 'send_failed', error: err.message };
  }
};
