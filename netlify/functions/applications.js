const { getStore } = require('@netlify/blobs');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER || 'aaldabag@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'hsswsofnsnkuafcv';

function getLocalFilePath(blobKey) {
  return path.join(__dirname, `${blobKey}_cache.json`);
}

function readLocalApplications(blobKey) {
  try {
    const file = getLocalFilePath(blobKey);
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (e) {
    console.warn(`Error reading local ${blobKey} cache:`, e);
  }
  return [];
}

function writeLocalApplications(apps, blobKey) {
  try {
    const file = getLocalFilePath(blobKey);
    fs.writeFileSync(file, JSON.stringify(apps, null, 2), 'utf8');
  } catch (e) {
    console.warn(`Error writing local ${blobKey} cache:`, e);
  }
}

function getAppStore() {
  return getStore({
    name: 'dental_data',
    siteID: process.env.NETLIFY_SITE_ID || '8a4f11a2-8e8a-43d6-a0e4-8a6169dde16b',
    token: process.env.NETLIFY_AUTH_TOKEN || 'nfc_YRgWico8i5hogE7F87r55rhU1ijyrivY084b',
    consistency: 'strong'
  });
}

async function getCloudApplications(blobKey = 'applications') {
  try {
    const store = getAppStore();
    const data = await store.get(blobKey, { type: 'json' });
    if (Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn(`Netlify Blobs get for ${blobKey} failed, using fallback:`, err.message);
  }
  return readLocalApplications(blobKey);
}

async function setCloudApplications(apps, blobKey = 'applications') {
  writeLocalApplications(apps, blobKey);
  try {
    const store = getAppStore();
    await store.setJSON(blobKey, apps);
    return true;
  } catch (err) {
    console.warn(`Netlify Blobs set for ${blobKey} failed:`, err.message);
    return false;
  }
}

// Optional alert to Super Admin via Gmail
async function notifySuperAdminNewApp(app) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    await transporter.sendMail({
      from: `"منظومة طب الأسنان" <${SMTP_USER}>`,
      to: SMTP_USER,
      subject: `🏛️ طلب تسجيل كلية جديدة وارد: ${app.collegeName}`,
      text: `تم استلام طلب جديد من: ${app.deanName}\nالكلية: ${app.collegeName}\nالهاتف: ${app.phone}\nالبريد: ${app.email}\nرقم الطلب: ${app.requestId || app.id}`
    });
  } catch (e) {
    console.warn('Admin notification notice:', e.message);
  }
}

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const queryType = event.queryStringParameters?.type || '';
    let parsedBody = {};
    if (event.body) {
      try {
        parsedBody = JSON.parse(event.body);
      } catch (e) {}
    }

    const isStudent = queryType === 'student' || 
                      parsedBody.type === 'student' || 
                      (event.path && event.path.includes('student'));
    const blobKey = isStudent ? 'student_applications' : 'applications';

    if (event.httpMethod === 'GET') {
      const apps = await getCloudApplications(blobKey);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, type: blobKey, applications: apps || [] })
      };
    }

    if (event.httpMethod === 'POST') {
      const action = parsedBody.action || 'upsert';
      let currentApps = await getCloudApplications(blobKey);
      if (!Array.isArray(currentApps)) currentApps = [];

      if (action === 'delete') {
        const appId = parsedBody.id;
        currentApps = currentApps.filter(a => a.id !== appId);
        await setCloudApplications(currentApps, blobKey);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, type: blobKey, applications: currentApps })
        };
      }

      // Upsert application
      const app = parsedBody.application;
      if (!app || !app.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'بيانات الطلب غير مكتملة' })
        };
      }

      const idx = currentApps.findIndex(a => a.id === app.id);
      const isNew = idx === -1;

      if (idx > -1) {
        currentApps[idx] = { ...currentApps[idx], ...app };
      } else {
        currentApps.unshift(app);
      }

      await setCloudApplications(currentApps, blobKey);

      if (isNew && !isStudent) {
        notifySuperAdminNewApp(app).catch(() => {});
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, type: blobKey, applications: currentApps, application: app })
      };
    }

    if (event.httpMethod === 'DELETE') {
      const appId = event.queryStringParameters?.id;
      let currentApps = await getCloudApplications(blobKey);
      if (!Array.isArray(currentApps)) currentApps = [];

      if (appId) {
        currentApps = currentApps.filter(a => a.id !== appId);
        await setCloudApplications(currentApps, blobKey);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, type: blobKey, applications: currentApps })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' })
    };
  } catch (err) {
    console.error('Applications handler error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
