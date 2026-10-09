// mail/mail.templates.ts
const APP_NAME = 'QuickShow';
const BRAND_COLOR = '#4f46e5';
const SUPPORT_EMAIL = 'support@quickshow.com';

export const escapeHtml = ( value = '' ): string =>
    value
        .replace( /&/g, '&amp;' )
        .replace( /</g, '&lt;' )
        .replace( />/g, '&gt;' )
        .replace( /"/g, '&quot;' )
        .replace( /'/g, '&#39;' );

const button = ( href: string, label: string ) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
    <tr>
      <td align="center" bgcolor="${ BRAND_COLOR }" style="border-radius:8px;">
        <a href="${ href }" target="_blank"
           style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;
                  color:#ffffff;text-decoration:none;border-radius:8px;">
          ${ label }
        </a>
      </td>
    </tr>
  </table>`;

const otpBox = ( otp: string ) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:28px 0;">
    <tr>
      <td align="center" style="background:#f3f4f6;border:1px dashed #d1d5db;border-radius:8px;padding:20px;">
        <span style="font-family:'Courier New',monospace;font-size:34px;font-weight:700;
                     letter-spacing:10px;color:#111827;">${ otp }</span>
      </td>
    </tr>
  </table>`;

const layout = (
    title: string,
    preheader: string,
    content: string,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${ title }</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Hidden preheader text shown in inbox preview -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${ preheader }</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="background:${ BRAND_COLOR };padding:28px 24px;">
              <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">${ APP_NAME }</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;color:#374151;font-size:16px;line-height:1.6;">
              ${ content }
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
              Need help? Contact us at
              <a href="mailto:${ SUPPORT_EMAIL }" style="color:${ BRAND_COLOR };text-decoration:none;">${ SUPPORT_EMAIL }</a><br />
              &copy; ${ new Date().getFullYear() } ${ APP_NAME }. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const h1 = ( text: string ) =>
    `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111827;">${ text }</h1>`;
const p = ( text: string ) => `<p style="margin:0 0 16px;">${ text }</p>`;
const muted = ( text: string ) =>
    `<p style="margin:0;font-size:13px;color:#6b7280;">${ text }</p>`;

// ---------- Templates ----------

export const welcomeTemplate = ( name?: string ) =>
    layout(
        `Welcome to ${ APP_NAME }`,
        `Your account is ready. Welcome aboard!`,
        `${ h1( `Welcome, ${ escapeHtml( name ) || 'there' }! 🎉` ) }
     ${ p( `Thanks for joining <strong>${ APP_NAME }</strong>. Your account is ready and you can start using it right away.` ) }
     ${ p( `If you have any questions, just reply to this email. We're happy to help.` ) }`,
    );

export const verifyEmailTemplate = (
    otp: string,
    name?: string,
    expiresInMinutes = 10,
) =>
    layout(
        'Verify your email',
        `Your verification code is ${ otp }`,
        `${ h1( 'Verify your email address' ) }
     ${ p( `Hi ${ escapeHtml( name ) || 'there' },` ) }
     ${ p( `Use the code below to verify your email address. It expires in <strong>${ expiresInMinutes } minutes</strong>.` ) }
     ${ otpBox( escapeHtml( otp ) ) }
     ${ muted( `Never share this code with anyone. If you didn't create an account, you can safely ignore this email.` ) }`,
    );

export const resetPasswordTemplate = (
    link: string,
    name?: string,
    expiresInMinutes = 15,
) =>
    layout(
        'Reset your password',
        `Use this link to reset your password`,
        `${ h1( 'Reset your password' ) }
     ${ p( `Hi ${ escapeHtml( name ) || 'there' },` ) }
     ${ p( `We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>${ expiresInMinutes } minutes</strong>.` ) }
     ${ button( link, 'Reset Password' ) }
     ${ muted( `If the button doesn't work, copy and paste this link into your browser:<br />
       <a href="${ link }" style="color:${ BRAND_COLOR };word-break:break-all;">${ link }</a>` ) }
     <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>`,
    );

export const passwordChangedTemplate = ( name?: string ) =>
    layout(
        'Your password was changed',
        `Your password was just changed`,
        `${ h1( 'Password changed successfully' ) }
     ${ p( `Hi ${ escapeHtml( name ) || 'there' },` ) }
     ${ p( `This is a confirmation that the password for your ${ APP_NAME } account was just changed.` ) }
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
       <tr>
         <td style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:4px;padding:14px 16px;font-size:14px;color:#991b1b;">
           <strong>Didn't do this?</strong> Contact us immediately at
           <a href="mailto:${ SUPPORT_EMAIL }" style="color:#991b1b;">${ SUPPORT_EMAIL }</a>
           so we can secure your account.
         </td>
       </tr>
     </table>`,
    );