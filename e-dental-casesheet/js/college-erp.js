/**
 * Dental College Academic ERP Engine
 * Multi-Tenant Architecture with Strict College Isolation
 * Version 1.0 - 2026
 */

const STORAGE_KEY = 'cosmo_dental_college_erp_v3';
const SESSION_KEY = 'cosmo_dental_college_session';
const SAVED_USERS_KEY = 'cosmo_dental_saved_accounts';

// ============================================================================
// INITIAL SEED DATABASE (CLEAN SLATE: NO FAKE COLLEGES, DOCTORS, OR STUDENTS)
// ============================================================================
function getInitialSeedDatabase() {
  return {
    superAdmin: {
      id: 1,
      username: 'superadmin',
      email: 'superadmin@college.edu',
      password: 'admin123',
      name: 'مدير المنظومة العام (Super Admin)',
      role: 'SUPER_ADMIN'
    },
    colleges: [],
    instructors: [],
    students: [],
    cases: []
  };
}

// ============================================================================
// SAVED ACCOUNTS ON THIS PC (حفظ الحسابات على هذا الجهاز)
// ============================================================================
function getSavedAccounts() {
  try {
    const raw = localStorage.getItem(SAVED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveAccountToDevice(accountData) {
  const list = getSavedAccounts();
  const existingIdx = list.findIndex(a => a.username.toLowerCase() === accountData.username.toLowerCase());
  if (existingIdx > -1) {
    list[existingIdx] = accountData;
  } else {
    list.unshift(accountData);
  }
  localStorage.setItem(SAVED_USERS_KEY, JSON.stringify(list));
  renderSavedAccountsList();
}

function removeSavedAccount(username) {
  let list = getSavedAccounts();
  list = list.filter(a => a.username.toLowerCase() !== username.toLowerCase());
  localStorage.setItem(SAVED_USERS_KEY, JSON.stringify(list));
  renderSavedAccountsList();
}

function clearAllSavedAccounts() {
  localStorage.removeItem(SAVED_USERS_KEY);
  renderSavedAccountsList();
}

function selectSavedAccount(username, password) {
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  if (uInput) uInput.value = username;
  if (pInput) pInput.value = password;
}

function renderSavedAccountsList() {
  const container = document.getElementById('saved-accounts-box');
  const listEl = document.getElementById('saved-accounts-list');
  if (!container || !listEl) return;

  const accounts = getSavedAccounts();
  if (!accounts || accounts.length === 0) {
    container.classList.add('hidden');
    listEl.innerHTML = '';
    return;
  }

  container.classList.remove('hidden');
  listEl.innerHTML = accounts.map(acc => {
    let roleBadge = 'طالب';
    let roleBg = 'bg-indigo-100 text-indigo-800';
    if (acc.role === 'SUPER_ADMIN') { roleBadge = 'سوبر أدمن'; roleBg = 'bg-amber-100 text-amber-900'; }
    else if (acc.role === 'COLLEGE_ADMIN') { roleBadge = 'عميد'; roleBg = 'bg-sky-100 text-sky-900'; }
    else if (acc.role === 'INSTRUCTOR') { roleBadge = 'تدريسي'; roleBg = 'bg-teal-100 text-teal-900'; }

    return `
      <div class="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 hover:border-teal-500 transition-all text-xs">
        <button type="button" onclick="selectSavedAccount('${acc.username}', '${acc.password || ''}')" class="flex-1 flex items-center gap-2 text-right cursor-pointer">
          <span class="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold font-latin">
            ${acc.username.charAt(0).toUpperCase()}
          </span>
          <div>
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <span>${acc.name || acc.username}</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-bold ${roleBg}">${roleBadge}</span>
            </div>
            <div class="text-[10px] text-slate-400 font-latin">${acc.username}</div>
          </div>
        </button>
        <button type="button" onclick="removeSavedAccount('${acc.username}')" class="text-slate-300 hover:text-rose-600 px-1 font-bold text-sm cursor-pointer" title="إزالة من هذا الجهاز">&times;</button>
      </div>
    `;
  }).join('');
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}

// Read database
function readErpDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedDatabase();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const data = JSON.parse(raw);
    if (!data.colleges) data.colleges = [];
    if (!data.instructors) data.instructors = [];
    if (!data.students) data.students = [];
    if (!data.cases) data.cases = [];
    return data;
  } catch (e) {
    const initial = getInitialSeedDatabase();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

// Write database
function writeErpDb(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Session state
let currentSession = null;

function getCurrentSession() {
  if (currentSession) return currentSession;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (raw) {
      currentSession = JSON.parse(raw);
      return currentSession;
    }
  } catch (e) {}
  return null;
}

function setCurrentSession(user) {
  currentSession = user;
  if (user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
}

// ============================================================================
// AUTHENTICATION & ROUTING
// ============================================================================
function handleLoginSubmit(event) {
  event.preventDefault();
  const errorAlert = document.getElementById('login-error-alert');
  const errorText = document.getElementById('login-error-text');
  errorAlert.classList.add('hidden');

  const usernameInput = (document.getElementById('login-username')?.value || '').trim().toLowerCase();
  const passwordInput = (document.getElementById('login-password')?.value || '').trim();

  if (!usernameInput || !passwordInput) {
    showLoginError('يرجى كتابة اسم المستخدم وكلمة المرور.');
    return;
  }

  const db = readErpDb();

  // 1. Check Super Admin
  if (
    (usernameInput === db.superAdmin.username.toLowerCase() || usernameInput === db.superAdmin.email.toLowerCase()) &&
    passwordInput === db.superAdmin.password
  ) {
    loginSuccess({
      id: db.superAdmin.id,
      name: db.superAdmin.name,
      username: db.superAdmin.username,
      role: 'SUPER_ADMIN'
    }, passwordInput);
    return;
  }

  // 2. Check College Admins (Deans)
  const college = db.colleges.find(
    c => c.adminUsername.toLowerCase() === usernameInput && c.adminPassword === passwordInput
  );
  if (college) {
    if (college.status === 'Paused') {
      showLoginError('عذراً، تم تعليق حساب هذه الكلية مؤقتاً من قبل إدارة المنظومة.');
      return;
    }
    loginSuccess({
      id: 'dean_' + college.id,
      collegeId: college.id,
      collegeName: college.name,
      collegeCode: college.code,
      name: college.deanName,
      username: college.adminUsername,
      role: 'COLLEGE_ADMIN'
    }, passwordInput);
    return;
  }

  // 3. Check Instructors
  const instructor = db.instructors.find(
    inst => (inst.username.toLowerCase() === usernameInput || (inst.email && inst.email.toLowerCase() === usernameInput)) &&
            inst.password === passwordInput
  );
  if (instructor) {
    const parentCollege = db.colleges.find(c => c.id === instructor.collegeId);
    if (parentCollege && parentCollege.status === 'Paused') {
      showLoginError('تم تعليق وصول الكلية مؤقتاً. يرجى مراجعة عمادة الكلية.');
      return;
    }
    loginSuccess({
      id: instructor.id,
      collegeId: instructor.collegeId,
      collegeName: parentCollege ? parentCollege.name : 'كلية طب الأسنان',
      name: instructor.name,
      title: instructor.title,
      department: instructor.department,
      username: instructor.username,
      role: 'INSTRUCTOR'
    }, passwordInput);
    return;
  }

  // 4. Check Students
  const student = db.students.find(
    s => s.username.toLowerCase() === usernameInput && s.password === passwordInput
  );
  if (student) {
    const parentCollege = db.colleges.find(c => c.id === student.collegeId);
    if (parentCollege && parentCollege.status === 'Paused') {
      showLoginError('تم تعليق وصول الكلية مؤقتاً. يرجى مراجعة عمادة الكلية.');
      return;
    }
    loginSuccess({
      id: student.id,
      collegeId: student.collegeId,
      collegeName: parentCollege ? parentCollege.name : 'كلية طب الأسنان',
      name: student.name,
      stage: student.stage,
      group: student.group,
      username: student.username,
      role: 'STUDENT'
    }, passwordInput);
    return;
  }

  showLoginError('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات.');
}

function showLoginError(msg) {
  const errorAlert = document.getElementById('login-error-alert');
  const errorText = document.getElementById('login-error-text');
  if (errorAlert && errorText) {
    errorText.textContent = msg;
    errorAlert.classList.remove('hidden');
  }
}

function loginSuccess(user, enteredPassword) {
  const rememberCheck = document.getElementById('remember-device-check');
  if (rememberCheck && rememberCheck.checked) {
    saveAccountToDevice({
      username: user.username,
      password: enteredPassword || '',
      name: user.name,
      role: user.role,
      collegeName: user.collegeName || ''
    });
  }
  setCurrentSession(user);
  renderApp();
}

function handleLogout() {
  setCurrentSession(null);
  renderApp();
}

// ============================================================================
// MAIN APP RENDERER & ROUTER
// ============================================================================
function renderApp() {
  const user = getCurrentSession();
  
  // Views
  const viewLogin = document.getElementById('view-login');
  const viewSuperAdmin = document.getElementById('view-super-admin');
  const viewCollegeAdmin = document.getElementById('view-college-admin');
  const viewInstructor = document.getElementById('view-instructor');
  const viewStudent = document.getElementById('view-student');

  [viewLogin, viewSuperAdmin, viewCollegeAdmin, viewInstructor, viewStudent].forEach(v => {
    if (v) v.classList.add('hidden');
  });

  const authBox = document.getElementById('auth-actions-box');
  const roleBadge = document.getElementById('role-badge');
  const topCollegeName = document.getElementById('top-college-name');

  if (!user) {
    // Show login
    viewLogin?.classList.remove('hidden');
    if (roleBadge) {
      roleBadge.textContent = 'بوابة الدخول';
      roleBadge.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200';
    }
    if (authBox) authBox.innerHTML = '';
    renderSavedAccountsList();
    return;
  }

  // Populate Header Profile & Logout
  if (authBox) {
    authBox.innerHTML = `
      <div class="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-300">
        <span class="text-xs font-bold text-slate-800">${user.name}</span>
        <button onclick="handleLogout()" class="text-rose-600 hover:text-rose-800 text-xs font-bold border-r border-slate-300 pr-2 mr-1" title="تسجيل الخروج">
          خروج 🚪
        </button>
      </div>
    `;
  }

  // Route to specific view
  switch (user.role) {
    case 'SUPER_ADMIN':
      if (roleBadge) {
        roleBadge.textContent = '👑 سوبر أدمن المنظومة';
        roleBadge.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300';
      }
      if (topCollegeName) {
        topCollegeName.innerHTML = `<span>التحكم العام في كافة الجامعات والكليات</span>`;
      }
      viewSuperAdmin?.classList.remove('hidden');
      renderSuperAdminDashboard();
      break;

    case 'COLLEGE_ADMIN':
      if (roleBadge) {
        roleBadge.textContent = '🏛️ عمادة الكلية (الأدمن)';
        roleBadge.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-300';
      }
      if (topCollegeName) {
        topCollegeName.innerHTML = `<span class="text-teal-800 font-bold">${user.collegeName}</span>`;
      }
      viewCollegeAdmin?.classList.remove('hidden');
      renderCollegeAdminDashboard();
      break;

    case 'INSTRUCTOR':
      if (roleBadge) {
        roleBadge.textContent = '👨‍🏫 الكادر التدريسي والمشرفين';
        roleBadge.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300';
      }
      if (topCollegeName) {
        topCollegeName.innerHTML = `<span class="text-slate-700 font-bold">${user.collegeName}</span> • <span class="text-teal-700 font-semibold">${user.department || ''}</span>`;
      }
      viewInstructor?.classList.remove('hidden');
      renderInstructorDashboard();
      break;

    case 'STUDENT':
      if (roleBadge) {
        roleBadge.textContent = `🎓 طالب المرحلة ${user.stage === '5th' ? 'الخامسة BDS' : 'الرابعة BDS'}`;
        roleBadge.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300';
      }
      if (topCollegeName) {
        topCollegeName.innerHTML = `<span class="text-slate-700 font-bold">${user.collegeName}</span> • <span class="text-indigo-700 font-bold">${user.group || ''}</span>`;
      }
      viewStudent?.classList.remove('hidden');
      renderStudentDashboard();
      break;
  }

  // Re-create lucide icons
  if (window.lucide) window.lucide.createIcons();
}

// ============================================================================
// 1. SUPER ADMIN CONTROLLER
// ============================================================================
function renderSuperAdminDashboard() {
  const db = readErpDb();
  
  // Counters
  document.getElementById('stat-colleges-count').textContent = db.colleges.length;
  document.getElementById('stat-instructors-count').textContent = db.instructors.length;
  document.getElementById('stat-students-count').textContent = db.students.length;
  document.getElementById('stat-cases-count').textContent = db.cases.length;

  renderSuperAdminColleges();
}

function renderSuperAdminColleges() {
  const db = readErpDb();
  const search = (document.getElementById('search-colleges')?.value || '').trim().toLowerCase();
  const tbody = document.getElementById('colleges-table-body');
  if (!tbody) return;

  const filtered = db.colleges.filter(c => 
    c.name.toLowerCase().includes(search) ||
    c.city.toLowerCase().includes(search) ||
    c.deanName.toLowerCase().includes(search) ||
    c.code.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-slate-400 font-semibold">لا توجد كليات مطابقة للبحث.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const instCount = db.instructors.filter(i => i.collegeId === c.id).length;
    const stdCount = db.students.filter(s => s.collegeId === c.id).length;
    const isPaused = c.status === 'Paused';

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-3.5">
          <strong class="text-slate-900 block text-sm font-black">${c.name}</strong>
          <span class="text-[11px] text-slate-500 font-semibold">📍 ${c.city}</span>
        </td>
        <td class="p-3.5">
          <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-latin font-bold text-slate-700">${c.code}</span>
        </td>
        <td class="p-3.5">
          <span class="font-bold text-slate-800">${c.deanName}</span>
        </td>
        <td class="p-3.5">
          <div class="text-[11px] space-y-0.5">
            <span class="block text-slate-600">يوزر: <strong class="font-latin text-teal-800">${c.adminUsername}</strong></span>
            <span class="block text-slate-500">رمز: <strong class="font-latin text-slate-700">${c.adminPassword}</strong></span>
          </div>
        </td>
        <td class="p-3.5 text-center font-black font-latin text-sky-700 text-sm">
          ${instCount}
        </td>
        <td class="p-3.5 text-center font-black font-latin text-indigo-700 text-sm">
          ${stdCount}
        </td>
        <td class="p-3.5 text-center">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isPaused ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}">
            ${isPaused ? 'معلقة' : 'نشطة ومفعلة'}
          </span>
        </td>
        <td class="p-3.5 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button 
              onclick="loginAsDean('${c.id}')"
              class="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg font-bold text-[11px] transition-all"
              title="دخول سريع باسم عميد الكلية"
            >
              دخول كعميد 🏛️
            </button>
            <button 
              onclick="toggleCollegeStatus('${c.id}')"
              class="px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${isPaused ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'}"
            >
              ${isPaused ? 'تفعيل' : 'إيقاف'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddCollegeModal() {
  document.getElementById('modal-add-college')?.classList.remove('hidden');
}

function closeAddCollegeModal() {
  document.getElementById('modal-add-college')?.classList.add('hidden');
}

function handleCreateCollegeSubmit(event) {
  event.preventDefault();
  const db = readErpDb();

  const name = document.getElementById('new-college-name').value.trim();
  const code = document.getElementById('new-college-code').value.trim().toUpperCase();
  const city = document.getElementById('new-college-city').value.trim();
  const deanName = document.getElementById('new-college-dean').value.trim();
  const adminUsername = document.getElementById('new-dean-username').value.trim().toLowerCase();
  const adminPassword = document.getElementById('new-dean-password').value.trim();

  // Validate unique code & username
  if (db.colleges.some(c => c.code === code)) {
    alert('رمز الكلية (Code) مسجل مسبقاً! يرجى اختيار رمز آخر.');
    return;
  }
  if (db.colleges.some(c => c.adminUsername.toLowerCase() === adminUsername)) {
    alert('اسم المستخدم (Username) مسجل لعميد آخر! يرجى اختيار يوزر نيم آخر.');
    return;
  }

  const newCollege = {
    id: 'clg_' + Date.now(),
    name,
    code,
    city,
    deanName,
    adminUsername,
    adminPassword,
    status: 'Active',
    plan: 'ANNUAL_ACCREDITED',
    createdAt: new Date().toISOString()
  };

  db.colleges.push(newCollege);
  writeErpDb(db);
  syncPushCollege(newCollege);

  closeAddCollegeModal();
  renderSuperAdminDashboard();
  alert(`تمت إضافة ${name} بنجاح! تم إنشاء حساب العميد (${adminUsername}).`);
}

function toggleCollegeStatus(collegeId) {
  const db = readErpDb();
  const clg = db.colleges.find(c => c.id === collegeId);
  if (!clg) return;

  clg.status = clg.status === 'Active' ? 'Paused' : 'Active';
  writeErpDb(db);
  renderSuperAdminDashboard();
}

function loginAsDean(collegeId) {
  const db = readErpDb();
  const clg = db.colleges.find(c => c.id === collegeId);
  if (!clg) return;

  loginSuccess({
    id: 'dean_' + clg.id,
    collegeId: clg.id,
    collegeName: clg.name,
    collegeCode: clg.code,
    name: clg.deanName,
    username: clg.adminUsername,
    role: 'COLLEGE_ADMIN'
  });
}

// ============================================================================
// 2. COLLEGE ADMIN (DEAN) CONTROLLER - STRICT ISOLATION
// ============================================================================
let activeCollegeTab = 'students';
let activeStageFilter = 'ALL';

function renderCollegeAdminDashboard() {
  const user = getCurrentSession();
  if (!user || user.role !== 'COLLEGE_ADMIN') return;

  const db = readErpDb();
  
  // Banner name
  const deanBanner = document.getElementById('dean-banner-college-name');
  if (deanBanner) deanBanner.textContent = user.collegeName;

  // Counts strictly filtered for THIS college
  const myStudents = db.students.filter(s => s.collegeId === user.collegeId);
  const myInstructors = db.instructors.filter(i => i.collegeId === user.collegeId);
  const myCases = db.cases.filter(c => c.collegeId === user.collegeId);

  document.getElementById('dean-tab-students-count').textContent = myStudents.length;
  document.getElementById('dean-tab-instructors-count').textContent = myInstructors.length;
  document.getElementById('dean-tab-evals-count').textContent = myCases.length;

  switchCollegeTab(activeCollegeTab);
}

function switchCollegeTab(tab) {
  activeCollegeTab = tab;
  ['students', 'instructors', 'evaluations'].forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`tab-content-${t}`);
    if (t === tab) {
      btn?.classList.remove('bg-slate-200/80', 'text-slate-700');
      btn?.classList.add('bg-teal-700', 'text-white');
      content?.classList.remove('hidden');
    } else {
      btn?.classList.add('bg-slate-200/80', 'text-slate-700');
      btn?.classList.remove('bg-teal-700', 'text-white');
      content?.classList.add('hidden');
    }
  });

  if (tab === 'students') renderCollegeStudents();
  if (tab === 'instructors') renderCollegeInstructors();
  if (tab === 'evaluations') renderCollegeEvaluations();

  if (window.lucide) window.lucide.createIcons();
}

function filterStudentsByStage(stage) {
  activeStageFilter = stage;
  const buttons = document.querySelectorAll('.stage-filter-btn');
  buttons.forEach(b => {
    b.className = 'stage-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200';
  });
  if (event && event.target) {
    event.target.className = 'stage-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-700 text-white';
  }
  renderCollegeStudents();
}

function renderCollegeStudents() {
  const user = getCurrentSession();
  const db = readErpDb();
  const tbody = document.getElementById('college-students-tbody');
  if (!tbody || !user) return;

  const search = (document.getElementById('search-students')?.value || '').trim().toLowerCase();

  // STRICT ISOLATION: collegeId matching
  let list = db.students.filter(s => s.collegeId === user.collegeId);

  // Filter stage
  if (activeStageFilter !== 'ALL') {
    list = list.filter(s => s.stage === activeStageFilter);
  }

  // Filter search
  if (search) {
    list = list.filter(s => 
      s.name.toLowerCase().includes(search) || 
      s.username.toLowerCase().includes(search) ||
      (s.group && s.group.toLowerCase().includes(search))
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-slate-400 font-semibold">لا يوجد طلاب مسجلين وفق المعايير المحددة.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(s => {
    // Student cases & average
    const studentCases = db.cases.filter(c => c.studentId === s.id && c.collegeId === user.collegeId);
    const validScores = studentCases.map(c => parseFloat(c.assignedMark)).filter(m => !isNaN(m));
    const avgScore = validScores.length > 0 
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) + ' / 10'
      : 'لا يوجد بعد';

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-3">
          <strong class="font-bold text-slate-900 block">${s.name}</strong>
          <span class="text-[10px] text-slate-400 font-latin">#ID-${s.id}</span>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${s.stage === '5th' ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'}">
            ${s.stage === '5th' ? 'المرحلة الخامسة (5th Year)' : 'المرحلة الرابعة (4th Year)'}
          </span>
        </td>
        <td class="p-3 font-latin font-semibold text-slate-600">${s.group || 'Group A'}</td>
        <td class="p-3 font-latin font-bold text-teal-800">${s.username}</td>
        <td class="p-3 font-latin font-bold text-slate-600">${s.password}</td>
        <td class="p-3 text-center font-black font-latin text-slate-800">${studentCases.length}</td>
        <td class="p-3 text-center font-bold text-emerald-700 font-latin">${avgScore}</td>
        <td class="p-3 text-center">
          <button onclick="deleteStudent('${s.id}')" class="text-rose-600 hover:text-rose-800 font-bold text-[11px]">حذف 🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderCollegeInstructors() {
  const user = getCurrentSession();
  const db = readErpDb();
  const tbody = document.getElementById('college-instructors-tbody');
  if (!tbody || !user) return;

  // STRICT ISOLATION
  const list = db.instructors.filter(i => i.collegeId === user.collegeId);

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-slate-400 font-semibold">لم يتم إضافة أي تدريسي بعد.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(inst => {
    const evalCount = db.cases.filter(c => c.instructorId === inst.id && c.collegeId === user.collegeId).length;

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-3">
          <strong class="font-bold text-slate-900 block">${inst.name}</strong>
          <span class="text-[11px] text-slate-500 font-latin">${inst.email || ''}</span>
        </td>
        <td class="p-3 font-semibold text-slate-700">${inst.title}</td>
        <td class="p-3 font-bold text-teal-800">${inst.department}</td>
        <td class="p-3 font-latin font-bold text-slate-800">${inst.username}</td>
        <td class="p-3 font-latin font-bold text-slate-600">${inst.password}</td>
        <td class="p-3 text-center font-black font-latin text-teal-700">${evalCount}</td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">نشط</span>
        </td>
        <td class="p-3 text-center">
          <button onclick="deleteInstructor('${inst.id}')" class="text-rose-600 hover:text-rose-800 font-bold text-[11px]">حذف 🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderCollegeEvaluations() {
  const user = getCurrentSession();
  const db = readErpDb();
  const tbody = document.getElementById('college-evaluations-tbody');
  if (!tbody || !user) return;

  // STRICT ISOLATION
  const list = db.cases.filter(c => c.collegeId === user.collegeId);

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-slate-400 font-semibold">لا توجد حالات سريرية مسجلة بعد.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => {
    const isPending = item.status === 'Pending';
    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-3 font-latin font-bold text-slate-700">${item.id}</td>
        <td class="p-3 font-bold text-slate-900">${item.studentName}</td>
        <td class="p-3">
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${item.stage === '5th' ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'}">
            مرحلة ${item.stage === '5th' ? '5' : '4'}
          </span>
        </td>
        <td class="p-3 font-semibold text-slate-700">${item.type}</td>
        <td class="p-3 font-bold text-teal-800">${item.instructorName || 'بانتظار التوزيع'}</td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded text-xs font-black font-latin ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
            ${isPending ? 'قيد التقييم' : item.assignedMark + ' / 10'}
          </span>
        </td>
        <td class="p-3 text-slate-500 font-latin text-[11px]">${new Date(item.createdAt).toLocaleDateString('ar-EG')}</td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
            ${isPending ? 'بانتظار التدريسي' : 'معتمدة'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// College Modals
function openAddInstructorModal() {
  document.getElementById('modal-add-instructor')?.classList.remove('hidden');
}
function closeAddInstructorModal() {
  document.getElementById('modal-add-instructor')?.classList.add('hidden');
}

function handleCreateInstructorSubmit(event) {
  event.preventDefault();
  const user = getCurrentSession();
  if (!user || user.role !== 'COLLEGE_ADMIN') return;

  const db = readErpDb();
  const name = document.getElementById('new-inst-name').value.trim();
  const title = document.getElementById('new-inst-title').value;
  const department = document.getElementById('new-inst-dept').value;
  const username = document.getElementById('new-inst-username').value.trim().toLowerCase();
  const password = document.getElementById('new-inst-password').value.trim();

  // Validate duplicate username across platform
  if (db.instructors.some(i => i.username.toLowerCase() === username) || db.students.some(s => s.username.toLowerCase() === username)) {
    alert('اسم المستخدم (Username) مسجل مسبقاً! يرجى اختيار يوزر آخر.');
    return;
  }

  const newInst = {
    id: 'inst_' + Date.now(),
    collegeId: user.collegeId,
    name,
    title,
    department,
    username,
    password,
    email: `${username}@${user.collegeCode.toLowerCase()}.edu`,
    role: 'INSTRUCTOR',
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.instructors.push(newInst);
  writeErpDb(db);
  syncPushInstructor(newInst);

  closeAddInstructorModal();
  renderCollegeAdminDashboard();
  alert(`تمت إضافة التدريسي ${name} بنجاح!`);
}

function openAddStudentModal() {
  document.getElementById('modal-add-student')?.classList.remove('hidden');
}
function closeAddStudentModal() {
  document.getElementById('modal-add-student')?.classList.add('hidden');
}

function handleCreateStudentSubmit(event) {
  event.preventDefault();
  const user = getCurrentSession();
  if (!user || user.role !== 'COLLEGE_ADMIN') return;

  const db = readErpDb();
  const name = document.getElementById('new-std-name').value.trim();
  const stage = document.getElementById('new-std-stage').value;
  const group = document.getElementById('new-std-group').value.trim();
  const username = document.getElementById('new-std-username').value.trim().toLowerCase();
  const password = document.getElementById('new-std-password').value.trim();

  if (db.students.some(s => s.username.toLowerCase() === username) || db.instructors.some(i => i.username.toLowerCase() === username)) {
    alert('اسم المستخدم مسجل مسبقاً!');
    return;
  }

  const newStudent = {
    id: 'std_' + Date.now(),
    collegeId: user.collegeId,
    name,
    stage,
    group,
    username,
    password,
    role: 'STUDENT',
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.students.push(newStudent);
  writeErpDb(db);
  syncPushStudents([newStudent]);

  closeAddStudentModal();
  renderCollegeAdminDashboard();
  alert(`تم تسجيل الطالب ${name} بنجاح!`);
}

// BULK STUDENTS GENERATOR (توليد 50 أو 100 طالب)
function openBulkStudentsModal() {
  document.getElementById('modal-bulk-students')?.classList.remove('hidden');
}
function closeBulkStudentsModal() {
  document.getElementById('modal-bulk-students')?.classList.add('hidden');
}

function handleBulkStudentsSubmit(event) {
  event.preventDefault();
  const user = getCurrentSession();
  if (!user || user.role !== 'COLLEGE_ADMIN') return;

  const stage = document.getElementById('bulk-stage').value;
  const count = parseInt(document.getElementById('bulk-count').value) || 50;
  const prefix = (document.getElementById('bulk-prefix').value.trim() || 'std.dent').toLowerCase();

  const db = readErpDb();
  const startId = Date.now();
  const generatedList = [];

  const commonNames = [
    'علي أحمد كاظم', 'محمد حسن عبيد', 'كرار حيدر جاسم', 'يوسف عادل خضير', 'حسين قاسم عبد',
    'زينب مصطفى مهدي', 'فاطمة جواد كاظم', 'مريم ضياء هادي', 'سارة عقيل نجم', 'نور رائد عبد الله',
    'جعفر صادق نعمة', 'عمر فاروق طارق', 'بلال وليد حميد', 'إبراهيم خليل إسماعيل', 'حمزة شاكر محمود'
  ];

  for (let i = 1; i <= count; i++) {
    const numStr = String(100 + i);
    const uname = `${prefix}_${stage}_${numStr}`;
    const pwd = `Dent${stage}#${Math.floor(1000 + Math.random() * 9000)}`;
    const randName = commonNames[(i - 1) % commonNames.length] + ` (طالب ${i})`;
    const grp = `Group ${String.fromCharCode(65 + Math.floor(i / 15))} / Chair ${String((i % 20) + 1).padStart(2, '0')}`;

    const std = {
      id: `std_bulk_${startId}_${i}`,
      collegeId: user.collegeId,
      name: randName,
      stage,
      group: grp,
      username: uname,
      password: pwd,
      role: 'STUDENT',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    db.students.push(std);
    generatedList.push(std);
  }

  writeErpDb(db);
  syncPushStudents(generatedList);

  closeBulkStudentsModal();
  renderCollegeAdminDashboard();

  alert(`🎉 تم توليد ${count} حساب طالب للمرحلة ${stage === '5th' ? 'الخامسة' : 'الرابعة'} بنجاح تام وتم ترحيلهم لقاعدة بيانات كليتكم!`);
}

function deleteStudent(studentId) {
  if (!confirm('هل أنت متأكد من حذف هذا الطالب من سجلات الكلية؟')) return;
  const db = readErpDb();
  db.students = db.students.filter(s => s.id !== studentId);
  writeErpDb(db);
  syncDeleteStudent(studentId);
  renderCollegeAdminDashboard();
}

function deleteInstructor(instructorId) {
  if (!confirm('هل أنت متأكد من حذف هذا التدريسي من الكلية؟')) return;
  const db = readErpDb();
  db.instructors = db.instructors.filter(i => i.id !== instructorId);
  writeErpDb(db);
  syncDeleteInstructor(instructorId);
  renderCollegeAdminDashboard();
}

function exportClinicalGradesCSV() {
  const user = getCurrentSession();
  const db = readErpDb();
  const list = db.cases.filter(c => c.collegeId === user.collegeId);

  let csvContent = "\uFEFFرقم الحالة,اسم الطالب,المرحلة,نوع الكيس شيت,اسم المريض,التدريسي المشرف,الدرجة الممنوحة,الحالة,التاريخ\n";
  list.forEach(c => {
    csvContent += `"${c.id}","${c.studentName}","${c.stage}","${c.type}","${c.patientName}","${c.instructorName}","${c.assignedMark}","${c.status}","${new Date(c.createdAt).toLocaleDateString('ar-EG')}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `سجل_درجات_الكلية_${user.collegeCode}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// 3. INSTRUCTOR CONTROLLER
// ============================================================================
function renderInstructorDashboard() {
  const user = getCurrentSession();
  if (!user || user.role !== 'INSTRUCTOR') return;

  const db = readErpDb();

  document.getElementById('inst-doctor-name').textContent = user.name;
  document.getElementById('inst-college-tag').textContent = `${user.collegeName} • ${user.department}`;

  // Strict college + instructor cases
  const myCases = db.cases.filter(c => c.collegeId === user.collegeId);
  const pendingCases = myCases.filter(c => c.status === 'Pending');

  document.getElementById('inst-pending-badge').textContent = pendingCases.length;

  const tbody = document.getElementById('instructor-cases-tbody');
  if (!tbody) return;

  if (myCases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-slate-400 font-semibold">لا توجد حالات مرفوعة حالياً.</td></tr>`;
    return;
  }

  tbody.innerHTML = myCases.map(item => {
    const isPending = item.status === 'Pending';
    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-3 font-latin font-bold text-slate-800">${item.id}</td>
        <td class="p-3">
          <strong class="font-bold text-slate-900 block">${item.studentName}</strong>
          <span class="text-[11px] text-teal-700 font-semibold">مرحلة ${item.stage === '5th' ? 'خامسة' : 'رابعة'} BDS</span>
        </td>
        <td class="p-3 font-semibold text-slate-700">${item.type}</td>
        <td class="p-3">
          <span class="block font-bold text-slate-800">${item.patientName}</span>
          <span class="text-[11px] text-slate-500">${item.chiefComplaint || ''}</span>
        </td>
        <td class="p-3 text-slate-500 font-latin text-[11px]">${new Date(item.createdAt).toLocaleDateString('ar-EG')}</td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded text-xs font-black font-latin ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
            ${isPending ? 'قيد التقييم' : item.assignedMark + ' / 10'}
          </span>
        </td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
            ${isPending ? 'بانتظار التقييم' : 'معتمدة'}
          </span>
        </td>
        <td class="p-3 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button 
              onclick="openEvalCaseModal('${item.id}')"
              class="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1"
            >
              <span>رصد الدرجة (Mark)</span>
              <span>✍️</span>
            </button>
            <a 
              href="${item.sheetUrl || 'periodontics-page4.html'}" 
              target="_blank"
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-bold text-xs"
            >
              فتح الطبلة 📄
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openEvalCaseModal(caseId) {
  const db = readErpDb();
  const c = db.cases.find(x => x.id === caseId);
  if (!c) return;

  document.getElementById('eval-case-id').value = c.id;
  document.getElementById('eval-modal-student').textContent = `${c.studentName} (المرحلة ${c.stage})`;
  document.getElementById('eval-modal-type').textContent = c.type;
  document.getElementById('eval-modal-patient').textContent = c.patientName;
  document.getElementById('eval-assigned-mark').value = (c.assignedMark && c.assignedMark !== 'Pending') ? c.assignedMark : '9.0';
  document.getElementById('eval-feedback-text').value = c.feedback || '';

  document.getElementById('modal-eval-case')?.classList.remove('hidden');
}

function closeEvalCaseModal() {
  document.getElementById('modal-eval-case')?.classList.add('hidden');
}

function handleSaveEvaluationSubmit(event) {
  event.preventDefault();
  const user = getCurrentSession();
  const db = readErpDb();

  const caseId = document.getElementById('eval-case-id').value;
  const mark = document.getElementById('eval-assigned-mark').value;
  const feedback = document.getElementById('eval-feedback-text').value.trim();

  const c = db.cases.find(x => x.id === caseId);
  if (!c) return;

  c.assignedMark = mark;
  c.feedback = feedback;
  c.status = 'Approved';
  c.instructorId = user.id;
  c.instructorName = user.name;
  c.evaluatedAt = new Date().toISOString();

  writeErpDb(db);
  syncPushCase(c);
  closeEvalCaseModal();
  renderInstructorDashboard();
  alert(`✅ تم اعتماد التقييم ورصد الدرجة (${mark} / 10) للطالب ${c.studentName} بنجاح!`);
}

// ============================================================================
// 4. STUDENT CONTROLLER
// ============================================================================
function renderStudentDashboard() {
  const user = getCurrentSession();
  if (!user || user.role !== 'STUDENT') return;

  const db = readErpDb();

  document.getElementById('student-name-display').textContent = user.name;
  document.getElementById('student-stage-badge').textContent = user.stage === '5th' ? 'طالب المرحلة الخامسة (5th Year BDS)' : 'طالب المرحلة الرابعة (4th Year BDS)';
  document.getElementById('student-info-sub').textContent = `${user.collegeName} • ${user.group || 'Group A'}`;

  // Strict isolation for this student
  const myCases = db.cases.filter(c => c.studentId === user.id && c.collegeId === user.collegeId);
  const tbody = document.getElementById('student-cases-tbody');
  if (!tbody) return;

  if (myCases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-slate-400 font-semibold">لم تقم بإرسال أي كيس شيت بعد. اضغط فوق لبدء ملء طبلة جديدة.</td></tr>`;
    return;
  }

  tbody.innerHTML = myCases.map(item => {
    const isPending = item.status === 'Pending';
    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-3 font-latin font-bold text-slate-800">${item.id}</td>
        <td class="p-3 font-semibold text-slate-800">${item.type}</td>
        <td class="p-3 font-bold text-slate-900">${item.patientName}</td>
        <td class="p-3 text-slate-500 font-latin text-[11px]">${new Date(item.createdAt).toLocaleDateString('ar-EG')}</td>
        <td class="p-3 font-bold text-teal-800">${item.instructorName || 'بانتظار المشرف'}</td>
        <td class="p-3 text-center">
          <span class="px-2.5 py-1 rounded text-xs font-black font-latin ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
            ${isPending ? 'قيد التقييم' : item.assignedMark + ' / 10'}
          </span>
        </td>
        <td class="p-3 text-center">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
            ${isPending ? 'مرسلة للأستاذ' : 'معتمدة وموقعة'}
          </span>
        </td>
        <td class="p-3 text-center">
          <a href="${item.sheetUrl || 'periodontics-page4.html'}" target="_blank" class="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg font-bold text-xs">
            عرض الطبلة 📄
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function launchStudentCaseSheet(type) {
  const user = getCurrentSession();
  if (!user || user.role !== 'STUDENT') {
    alert('طبلة الكيس شيت السريرية مخصصة للطلبة المسجلين فقط بعد تسجيل الدخول بحساب الطالب.');
    return;
  }
  if (type === 'perio') {
    window.location.href = 'periodontics-page4.html';
  } else {
    window.location.href = 'oral-surgery-complete.html';
  }
}

// ============================================================================
// 5. SUPABASE CLOUD SYNC & SYSTEM RESET
// ============================================================================
const SB_URL_KEY = 'cosmo_college_sb_url';
const SB_KEY_KEY = 'cosmo_college_sb_key';
const DEFAULT_SB_URL = 'https://hdejjtrgxzjviwyrgwkl.supabase.co';
const DEFAULT_SB_KEY = 'sb_publishable_h4O11kxPMxgdPhW7IKvTVQ_dWA6Nyr7';

let erpSupabaseClient = null;

function getErpSupabaseClient() {
  if (erpSupabaseClient) return erpSupabaseClient;
  const url = localStorage.getItem(SB_URL_KEY) || DEFAULT_SB_URL;
  const key = localStorage.getItem(SB_KEY_KEY) || DEFAULT_SB_KEY;
  if (url && key && window.supabase && window.supabase.createClient) {
    try {
      erpSupabaseClient = window.supabase.createClient(url.trim(), key.trim());
      return erpSupabaseClient;
    } catch (e) {
      console.warn('Supabase client init error:', e);
    }
  }
  return null;
}

function updateSupabaseStatusUI() {
  const dot = document.getElementById('erp-supabase-dot');
  const txt = document.getElementById('erp-supabase-text');
  const client = getErpSupabaseClient();

  if (client) {
    if (dot) {
      dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse';
    }
    if (txt) {
      txt.textContent = 'سوبابيس: متصل سحابياً 🟢';
    }
  } else {
    if (dot) {
      dot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400';
    }
    if (txt) {
      txt.textContent = 'سوبابيس: محلي 🟡';
    }
  }
}

function openSupabaseModal() {
  const urlInput = document.getElementById('sb-input-url');
  const keyInput = document.getElementById('sb-input-key');
  if (urlInput) urlInput.value = localStorage.getItem(SB_URL_KEY) || DEFAULT_SB_URL;
  if (keyInput) keyInput.value = localStorage.getItem(SB_KEY_KEY) || DEFAULT_SB_KEY;

  document.getElementById('modal-supabase-setup')?.classList.remove('hidden');
}

function closeSupabaseModal() {
  document.getElementById('modal-supabase-setup')?.classList.add('hidden');
}

async function saveSupabaseSettings() {
  const url = (document.getElementById('sb-input-url')?.value || '').trim();
  const key = (document.getElementById('sb-input-key')?.value || '').trim();

  if (!url || !key) {
    alert('يرجى إدخال رابط المشروع (Project URL) والمفتاح العام (anon key).');
    return;
  }

  localStorage.setItem(SB_URL_KEY, url);
  localStorage.setItem(SB_KEY_KEY, key);
  erpSupabaseClient = null;

  const client = getErpSupabaseClient();
  if (client) {
    try {
      // Test select
      const { data, error } = await client.from('college_colleges').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.warn('Cloud query notice:', error.message);
      }
      updateSupabaseStatusUI();
      closeSupabaseModal();
      alert('🟢 تم الاتصال بسوبابيس (Supabase Cloud) بنجاح! المنظومة متصلة سحابياً الآن.');
      syncPullFromSupabase();
    } catch (err) {
      alert('تم حفظ الإعدادات! تأكد من إنشاء الجداول عبر نسخ ولصق كود الـ SQL في Supabase SQL Editor.');
      closeSupabaseModal();
      updateSupabaseStatusUI();
    }
  } else {
    alert('تم حفظ الإعدادات بنجاح!');
    closeSupabaseModal();
    updateSupabaseStatusUI();
  }
}

// Push mutations to Supabase Cloud
async function syncPushCollege(college) {
  const client = getErpSupabaseClient();
  if (!client) return;
  try {
    await client.from('college_colleges').upsert({
      id: college.id,
      name: college.name,
      code: college.code,
      city: college.city || '',
      dean_name: college.deanName || '',
      admin_username: college.adminUsername,
      admin_password: college.adminPassword,
      status: college.status || 'Active',
      plan: college.plan || 'ANNUAL_ACCREDITED',
      created_at: college.createdAt || new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase push college error:', e);
  }
}

async function syncPushInstructor(inst) {
  const client = getErpSupabaseClient();
  if (!client) return;
  try {
    await client.from('college_instructors').upsert({
      id: inst.id,
      college_id: inst.collegeId,
      name: inst.name,
      title: inst.title || '',
      department: inst.department || '',
      username: inst.username,
      password: inst.password,
      email: inst.email || '',
      role: 'INSTRUCTOR',
      status: inst.status || 'Active',
      created_at: inst.createdAt || new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase push instructor error:', e);
  }
}

async function syncPushStudents(studentsList) {
  const client = getErpSupabaseClient();
  if (!client || !studentsList || studentsList.length === 0) return;
  try {
    const rows = studentsList.map(s => ({
      id: s.id,
      college_id: s.collegeId,
      name: s.name,
      stage: s.stage,
      student_group: s.group || '',
      username: s.username,
      password: s.password,
      role: 'STUDENT',
      status: s.status || 'Active',
      created_at: s.createdAt || new Date().toISOString()
    }));
    await client.from('college_students').upsert(rows);
  } catch (e) {
    console.warn('Supabase push students error:', e);
  }
}

async function syncPushCase(c) {
  const client = getErpSupabaseClient();
  if (!client) return;
  try {
    await client.from('college_cases').upsert({
      id: c.id,
      college_id: c.collegeId,
      student_id: c.studentId,
      student_name: c.studentName,
      stage: c.stage,
      case_type: c.type,
      patient_name: c.patientName,
      chief_complaint: c.chiefComplaint,
      instructor_id: c.instructorId,
      instructor_name: c.instructorName,
      assigned_mark: c.assignedMark,
      feedback: c.feedback,
      status: c.status,
      sheet_url: c.sheetUrl || '',
      created_at: c.createdAt || new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase push case error:', e);
  }
}

async function syncDeleteStudent(studentId) {
  const client = getErpSupabaseClient();
  if (!client) return;
  try {
    await client.from('college_students').delete().eq('id', studentId);
  } catch (e) {
    console.warn('Supabase delete student error:', e);
  }
}

async function syncDeleteInstructor(instructorId) {
  const client = getErpSupabaseClient();
  if (!client) return;
  try {
    await client.from('college_instructors').delete().eq('id', instructorId);
  } catch (e) {
    console.warn('Supabase delete instructor error:', e);
  }
}

async function syncPushAllToSupabase() {
  const client = getErpSupabaseClient();
  if (!client) {
    alert('يرجى التأكد من ضبط بيانات Supabase أولاً.');
    return;
  }
  const db = readErpDb();
  try {
    if (db.colleges && db.colleges.length > 0) {
      const cRows = db.colleges.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        city: c.city || '',
        dean_name: c.deanName || '',
        admin_username: c.adminUsername,
        admin_password: c.adminPassword,
        status: c.status || 'Active',
        plan: c.plan || 'ANNUAL_ACCREDITED',
        created_at: c.createdAt || new Date().toISOString()
      }));
      await client.from('college_colleges').upsert(cRows);
    }

    if (db.instructors && db.instructors.length > 0) {
      const iRows = db.instructors.map(i => ({
        id: i.id,
        college_id: i.collegeId,
        name: i.name,
        title: i.title || '',
        department: i.department || '',
        username: i.username,
        password: i.password,
        email: i.email || '',
        role: 'INSTRUCTOR',
        status: i.status || 'Active',
        created_at: i.createdAt || new Date().toISOString()
      }));
      await client.from('college_instructors').upsert(iRows);
    }

    if (db.students && db.students.length > 0) {
      const sRows = db.students.map(s => ({
        id: s.id,
        college_id: s.collegeId,
        name: s.name,
        stage: s.stage,
        student_group: s.group || '',
        username: s.username,
        password: s.password,
        role: 'STUDENT',
        status: s.status || 'Active',
        created_at: s.createdAt || new Date().toISOString()
      }));
      await client.from('college_students').upsert(sRows);
    }

    if (db.cases && db.cases.length > 0) {
      const kRows = db.cases.map(c => ({
        id: c.id,
        college_id: c.collegeId,
        student_id: c.studentId,
        student_name: c.studentName,
        stage: c.stage,
        case_type: c.type,
        patient_name: c.patientName,
        chief_complaint: c.chiefComplaint,
        instructor_id: c.instructorId,
        instructor_name: c.instructorName,
        assigned_mark: c.assignedMark,
        feedback: c.feedback,
        status: c.status,
        sheet_url: c.sheetUrl || '',
        created_at: c.createdAt || new Date().toISOString()
      }));
      await client.from('college_cases').upsert(kRows);
    }

    alert('☁️ تم رفع ومزامنة كافة بيانات الكليات والتدريسيين والطلبة والتقييمات إلى قاعدة بيانات Supabase بنجاح!');
  } catch (err) {
    console.error('Push error:', err);
    alert('حدث خطأ أثناء المزامنة: ' + (err.message || 'تأكد من تشغيل كود الـ SQL في Supabase أولاً'));
  }
}

function getSupabaseSqlSchema() {
  return `-- ========================================================
-- Dental College Academic ERP • Database Schema
-- Multi-Tenant Schema for Supabase PostgreSQL
-- ========================================================

-- 1. Colleges Table
CREATE TABLE IF NOT EXISTS public.college_colleges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    city TEXT,
    dean_name TEXT,
    admin_username TEXT,
    admin_password TEXT,
    status TEXT DEFAULT 'Active',
    plan TEXT DEFAULT 'ANNUAL_ACCREDITED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Instructors Table
CREATE TABLE IF NOT EXISTS public.college_instructors (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT,
    department TEXT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'INSTRUCTOR',
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students Table (4th & 5th Year BDS)
CREATE TABLE IF NOT EXISTS public.college_students (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    name TEXT NOT NULL,
    stage TEXT NOT NULL, -- '4th' or '5th'
    student_group TEXT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'STUDENT',
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Clinical Cases & Evaluations Table
CREATE TABLE IF NOT EXISTS public.college_cases (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT,
    stage TEXT,
    case_type TEXT,
    patient_name TEXT,
    chief_complaint TEXT,
    instructor_id TEXT,
    instructor_name TEXT,
    assigned_mark TEXT,
    feedback TEXT,
    status TEXT DEFAULT 'Pending',
    sheet_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.college_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on college_colleges" ON public.college_colleges;
CREATE POLICY "Allow all on college_colleges" ON public.college_colleges FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on college_instructors" ON public.college_instructors;
CREATE POLICY "Allow all on college_instructors" ON public.college_instructors FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on college_students" ON public.college_students;
CREATE POLICY "Allow all on college_students" ON public.college_students FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on college_cases" ON public.college_cases;
CREATE POLICY "Allow all on college_cases" ON public.college_cases FOR ALL TO anon USING (true) WITH CHECK (true);
`;
}

function copySupabaseSchemaSql() {
  const sql = getSupabaseSqlSchema();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(sql).then(() => {
      alert('📋 تم نسخ كود الـ SQL بنجاح! الصقه في Supabase SQL Editor واضغط Run.');
    }).catch(() => {
      prompt('انسخ كود الـ SQL من هنا:', sql);
    });
  } else {
    prompt('انسخ كود الـ SQL من هنا:', sql);
  }
}

// Clear old local data ("شيل القديم")
function clearOldErpData() {
  if (!confirm('⚠️ هل أنت متأكد من تصفير وحذف البيانات المحلية القديمة والكاش؟ سيتم البدء بقاعدة بيانات نظيفة ومحدثة.')) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);

  // Re-seed clean state
  const cleanDb = getInitialSeedDatabase();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanDb));

  alert('🧹 تم تصفير وحذف البيانات القديمة بنجاح!');
  window.location.reload();
}

async function syncPullFromSupabase() {
  const client = getErpSupabaseClient();
  if (!client) return;

  try {
    const [cRes, iRes, sRes, kRes] = await Promise.all([
      client.from('college_colleges').select('*'),
      client.from('college_instructors').select('*'),
      client.from('college_students').select('*'),
      client.from('college_cases').select('*')
    ]);

    const db = readErpDb();
    let hasChanges = false;

    if (cRes.data && cRes.data.length > 0) {
      cRes.data.forEach(item => {
        const idx = db.colleges.findIndex(x => x.id === item.id);
        const mapped = {
          id: item.id,
          name: item.name,
          code: item.code,
          city: item.city,
          deanName: item.dean_name,
          adminUsername: item.admin_username,
          adminPassword: item.admin_password,
          status: item.status || 'Active',
          plan: item.plan || 'ANNUAL_ACCREDITED',
          createdAt: item.created_at
        };
        if (idx > -1) db.colleges[idx] = mapped;
        else db.colleges.push(mapped);
      });
      hasChanges = true;
    }

    if (iRes.data && iRes.data.length > 0) {
      iRes.data.forEach(item => {
        const idx = db.instructors.findIndex(x => x.id === item.id);
        const mapped = {
          id: item.id,
          collegeId: item.college_id,
          name: item.name,
          title: item.title,
          department: item.department,
          username: item.username,
          password: item.password,
          email: item.email,
          role: 'INSTRUCTOR',
          status: item.status || 'Active',
          createdAt: item.created_at
        };
        if (idx > -1) db.instructors[idx] = mapped;
        else db.instructors.push(mapped);
      });
      hasChanges = true;
    }

    if (sRes.data && sRes.data.length > 0) {
      sRes.data.forEach(item => {
        const idx = db.students.findIndex(x => x.id === item.id);
        const mapped = {
          id: item.id,
          collegeId: item.college_id,
          name: item.name,
          stage: item.stage,
          group: item.student_group,
          username: item.username,
          password: item.password,
          role: 'STUDENT',
          status: item.status || 'Active',
          createdAt: item.created_at
        };
        if (idx > -1) db.students[idx] = mapped;
        else db.students.push(mapped);
      });
      hasChanges = true;
    }

    if (kRes.data && kRes.data.length > 0) {
      kRes.data.forEach(item => {
        const idx = db.cases.findIndex(x => x.id === item.id);
        const mapped = {
          id: item.id,
          collegeId: item.college_id,
          studentId: item.student_id,
          studentName: item.student_name,
          stage: item.stage,
          type: item.case_type,
          patientName: item.patient_name,
          chiefComplaint: item.chief_complaint,
          instructorId: item.instructor_id,
          instructorName: item.instructor_name,
          assignedMark: item.assigned_mark,
          feedback: item.feedback,
          status: item.status,
          sheetUrl: item.sheet_url,
          createdAt: item.created_at
        };
        if (idx > -1) db.cases[idx] = mapped;
        else db.cases.push(mapped);
      });
      hasChanges = true;
    }

    if (hasChanges) {
      writeErpDb(db);
      renderApp();
    }
  } catch (err) {
    console.warn('Supabase sync pull notice:', err);
  }
}

// Auto init on page load
window.addEventListener('DOMContentLoaded', () => {
  updateSupabaseStatusUI();
  syncPullFromSupabase();
  renderApp();
});
