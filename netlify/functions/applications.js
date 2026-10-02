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
    let data = await store.get(blobKey, { type: 'json' });
    if (Array.isArray(data)) {
      if (blobKey === 'student_applications') {
        data = data.filter(a => 
          !a.id?.startsWith('sapp_179095') && 
          !a.notes?.includes('تجريبي') && 
          a.studentName !== 'ff' &&
          a.email !== 'rrrr@gmail.com' &&
          a.id !== 'sapp_1790970505039'
        );
      }
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

    const rawType = (queryType || parsedBody.type || '').toLowerCase();
    const rawPath = (event.path || '').toLowerCase();
    let blobKey = 'applications';

    if (rawType === 'colleges' || rawPath.includes('colleges')) {
      blobKey = 'registered_colleges';
    } else if (rawType === 'instructors' || rawPath.includes('instructors')) {
      blobKey = 'registered_instructors';
    } else if (rawType === 'students' || rawPath.includes('/students') || rawPath.endsWith('students')) {
      blobKey = 'registered_students';
    } else if (rawType === 'cases' || rawPath.includes('cases')) {
      blobKey = 'registered_cases';
    } else if (rawType === 'student' || rawType === 'student_applications' || rawPath.includes('student')) {
      blobKey = 'student_applications';
    }

    const isColleges = blobKey === 'registered_colleges';
    const isStudent = blobKey === 'student_applications';

    if (event.httpMethod === 'GET') {
      const items = await getCloudApplications(blobKey);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          type: blobKey,
          items: items || [],
          colleges: blobKey === 'registered_colleges' ? (items || []) : undefined,
          studentApplications: blobKey === 'student_applications' ? (items || []) : undefined,
          instructors: blobKey === 'registered_instructors' ? (items || []) : undefined,
          students: blobKey === 'registered_students' ? (items || []) : undefined,
          cases: blobKey === 'registered_cases' ? (items || []) : undefined,
          applications: items || []
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const action = parsedBody.action || 'upsert';
      let currentItems = await getCloudApplications(blobKey);
      if (!Array.isArray(currentItems)) currentItems = [];

      if (action === 'clear_all' || action === 'clear_students' || action === 'clear_colleges') {
        currentItems = [];
        await setCloudApplications([], blobKey);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'All items cleared successfully', type: blobKey, items: [], colleges: [], applications: [] })
        };
      }

      if (action === 'delete') {
        const itemId = parsedBody.id;
        currentItems = currentItems.filter(a => a.id !== itemId);
        await setCloudApplications(currentItems, blobKey);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, type: blobKey, items: currentItems, colleges: currentItems, applications: currentItems })
        };
      }

      // Handle batch upsert
      const batchList = parsedBody.items || parsedBody.colleges || parsedBody.students || parsedBody.instructors || parsedBody.cases;
      if (Array.isArray(batchList)) {
        batchList.forEach(obj => {
          if (!obj || !obj.id) return;
          const idx = currentItems.findIndex(c => c.id === obj.id);
          if (idx > -1) currentItems[idx] = { ...currentItems[idx], ...obj };
          else currentItems.push(obj);
        });
        await setCloudApplications(currentItems, blobKey);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, type: blobKey, items: currentItems })
        };
      }

      // Upsert single item
      const item = parsedBody.item || parsedBody.college || parsedBody.application || parsedBody.instructor || parsedBody.student || parsedBody.case;
      if (!item || !item.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'بيانات العنصر غير مكتملة' })
        };
      }

      // Permanently reject resurrection of old purged test applications
      if (isStudent && (
        item.id.startsWith('sapp_179095') || 
        (item.notes && item.notes.includes('تجريبي')) ||
        item.email === 'rrrr@gmail.com' ||
        item.studentName === 'ff'
      )) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, ignored: true, message: 'Purged test student ignored' })
        };
      }

      const idx = currentItems.findIndex(a => a.id === item.id);
      const isNew = idx === -1;

      if (idx > -1) {
        currentItems[idx] = { ...currentItems[idx], ...item };
      } else {
        currentItems.unshift(item);
      }

      await setCloudApplications(currentItems, blobKey);

      if (isNew && !isStudent && !isColleges) {
        notifySuperAdminNewApp(item).catch(() => {});
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          type: blobKey,
          items: currentItems,
          colleges: isColleges ? currentItems : undefined,
          applications: currentItems,
          application: item
        })
      };
    }

    if (event.httpMethod === 'DELETE') {
      const itemId = event.queryStringParameters?.id;
      let currentItems = await getCloudApplications(blobKey);
      if (!Array.isArray(currentItems)) currentItems = [];

      if (itemId) {
        currentItems = currentItems.filter(a => a.id !== itemId);
        await setCloudApplications(currentItems, blobKey);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, type: blobKey, items: currentItems, colleges: currentItems, applications: currentItems })
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
