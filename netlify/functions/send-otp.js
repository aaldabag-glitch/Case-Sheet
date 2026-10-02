const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER || 'aaldabag@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'hsswsofnsnkuafcv';

exports.handler = async function (event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { email, otp, collegeName, deanName, phone } = payload;

    if (!email || !otp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'البريد الإلكتروني ورمز التحقق مطلوبان' })
      };
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    const safeCollege = collegeName || 'كلية طب الأسنان';
    const safeDean = deanName || 'الأستاذ الموقر';
    const safePhone = phone || 'غير محدد';

    const mailOptions = {
      from: `"منظومة كليات طب الأسنان العراقية" <${SMTP_USER}>`,
      to: email,
      subject: `رمز التحقق الأمني [ ${otp} ] - طلب اعتماد كلية جديدة`,
      text: `مرحباً ${safeDean}،\n\nرمز التحقق (OTP) الخاص بك لتقديم طلب تسجيل (${safeCollege}) هو: ${otp}\n\nيرجى كتابة هذا الرمز لتأكيد طلبك.\nرقم الهاتف المعتمد: ${safePhone}\n\nمنظومة كليات طب الأسنان العراقية لإدارة العيادات التعليمية.`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; direction: rtl; text-align: right; }
            .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
            .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; }
            .header p { margin: 0; font-size: 13px; opacity: 0.9; }
            .content { padding: 28px 24px; color: #1e293b; line-height: 1.7; }
            .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
            .otp-box { margin: 24px 0; background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 14px; padding: 20px; text-align: center; }
            .otp-title { font-size: 13px; font-weight: 700; color: #15803d; margin-bottom: 8px; }
            .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #0f766e; direction: ltr; display: inline-block; }
            .meta-table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 13px; background: #f8fafc; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
            .meta-table td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
            .meta-label { color: #64748b; font-weight: 600; width: 35%; }
            .meta-value { color: #0f172a; font-weight: 700; }
            .warning { margin-top: 22px; font-size: 12px; color: #64748b; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>منظومة كليات طب الأسنان العراقية 🎓</h1>
              <p>بوابة إدارة العيادات التعليمية والاعتماد السريري</p>
            </div>
            <div class="content">
              <div class="greeting">مرحباً ${safeDean}،</div>
              <p style="margin: 0; font-size: 14px; color: #334155;">
                تلقينا طلباً لتقديم اعتماد وتسجيل كلية جديدة في المنظومة. يرجى استخدام رمز التحقق الأمني الموضح أدناه لإتمام طلبك:
              </p>

              <div class="otp-box">
                <div class="otp-title">رمز التحقق الأمني المؤقت (OTP):</div>
                <div class="otp-code">${otp}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 8px;">صالح لمدة 10 دقائق فقط. لا تشارك هذا الرمز مع أي شخص.</div>
              </div>

              <table class="meta-table">
                <tr>
                  <td class="meta-label">اسم الكلية:</td>
                  <td class="meta-value">${safeCollege}</td>
                </tr>
                <tr>
                  <td class="meta-label">البريد الإلكتروني:</td>
                  <td class="meta-value" dir="ltr" style="text-align: right;">${email}</td>
                </tr>
                <tr>
                  <td class="meta-label">رقم الهاتف:</td>
                  <td class="meta-value" dir="ltr" style="text-align: right;">${safePhone}</td>
                </tr>
              </table>

              <div class="warning">
                ⚠️ إذا لم تكن أنت من قام بطلب تسجيل الكلية، يرجى تجاهل هذه الرسالة بأمان.
              </div>
            </div>
            <div class="footer">
              جمهورية العراق - وزارة التعليم العالي والبحث العلمي &copy; 2026-2027
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email successfully sent:', info.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'تم إرسال رمز التحقق الأمني إلى بريدك الإلكتروني بنجاح 📩',
        messageId: info.messageId
      })
    };
  } catch (err) {
    console.error('Error sending OTP email:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'حدث خطأ أثناء إرسال البريد الإلكتروني: ' + err.message
      })
    };
  }
};
