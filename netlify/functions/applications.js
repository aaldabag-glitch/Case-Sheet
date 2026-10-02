const { getStore } = require('@netlify/blobs');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER || 'aaldabag@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'hsswsofnsnkuafcv';

// In-memory / local disk cache fallback for dev or fallback
const LOCAL_STORAGE_FILE = path.join(__dirname, 'applications_cache.json');

function readLocalApplications() {
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (e) {
    console.warn('Error reading local applications cache:', e);
  }
  return [];
}

function writeLocalApplications(apps) {
  try {
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(apps, null, 2), 'utf8');
  } catch (e) {
    console.warn('Error writing local applications cache:', e);
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

async function getCloudApplications() {
  try {
    const store = getAppStore();
    const data = await store.get('applications', { type: 'json' });
    if (Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn('Netlify Blobs get failed, using fallback:', err.message);
  }
  return readLocalApplications();
}

async function setCloudApplications(apps) {
  writeLocalApplications(apps);
  try {
    const store = getAppStore();
    await store.setJSON('applications', apps);
    return true;
  } catch (err) {
    console.warn('Netlify Blobs set failed:', err.message);
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
    if (event.httpMethod === 'GET') {
      const apps = await getCloudApplications();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, applications: apps || [] })
      };
    }

    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '{}');
      const action = payload.action || 'upsert';
      let currentApps = await getCloudApplications();
      if (!Array.isArray(currentApps)) currentApps = [];

      if (action === 'delete') {
        const appId = payload.id;
        currentApps = currentApps.filter(a => a.id !== appId);
        await setCloudApplications(currentApps);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, applications: currentApps })
        };
      }

      // Upsert / Create application
      const app = payload.application;
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

      await setCloudApplications(currentApps);

      if (isNew) {
        // Asynchronously notify Super Admin
        notifySuperAdminNewApp(app).catch(() => {});
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, applications: currentApps, application: app })
      };
    }

    if (event.httpMethod === 'DELETE') {
      const appId = event.queryStringParameters?.id;
      let currentApps = await getCloudApplications();
      if (!Array.isArray(currentApps)) currentApps = [];

      if (appId) {
        currentApps = currentApps.filter(a => a.id !== appId);
        await setCloudApplications(currentApps);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, applications: currentApps })
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
