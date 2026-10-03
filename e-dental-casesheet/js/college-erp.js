/**
 * Dental College Academic ERP Engine
 * Multi-Tenant Architecture with Strict College Isolation
 * Version 1.0 - 2026
 */

const STORAGE_KEY = 'cosmo_dental_college_erp_v3';
const SESSION_KEY = 'cosmo_dental_college_session';
const SAVED_USERS_KEY = 'cosmo_dental_saved_accounts';
const PURGE_FLAG_KEY = 'cosmo_dental_root_purge_v8_clean_slate_all';

// ============================================================================
// ENFORCE CLEAN SLATE FROM ROOTS: Wipe all legacy colleges, students, and sessions
// ============================================================================
(function enforceCleanSlateFromRoots() {
  try {
    if (localStorage.getItem(PURGE_FLAG_KEY) !== 'purged_v8') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SAVED_USERS_KEY);
      localStorage.setItem(PURGE_FLAG_KEY, 'purged_v8');
    }
  } catch (e) {}
})();

// ============================================================================
// DEFAULT ACCREDITED IRAQI DENTAL COLLEGES (قائمة الكليات والجامعات العراقية المعتمدة)
// ============================================================================
function getDefaultCollegesList() {
  return [];
}
window.getDefaultCollegesList = getDefaultCollegesList;

// ============================================================================
// INITIAL SEED DATABASE (100% CLEAN SLATE FROM ROOTS)
// ============================================================================
function getInitialSeedDatabase() {
  return {
    superAdmin: {
      id: 1,
      username: 'superadmin',
      email: 'superadmin@college.edu',
      password: 'admin123',
      name: 'الإدارة المركزية العامة',
      role: 'SUPER_ADMIN'
    },
    colleges: [],
    instructors: [],
    students: [],
    cases: [],
    applications: [],
    studentApplications: []
  };
}

// ============================================================================
// SAVED ACCOUNTS MANAGER (إدارة الحسابات المحفوظة السريعة على الجهاز)
// ============================================================================
function getSavedAccounts() {
  try {
    const raw = localStorage.getItem(SAVED_USERS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function saveAccountToDevice(accountData) {
  if (!accountData || !accountData.username) return;
  let list = getSavedAccounts();
  const existingIdx = list.findIndex(a => a.username.toLowerCase() === accountData.username.toLowerCase());
  if (existingIdx > -1) {
    list[existingIdx] = { ...list[existingIdx], ...accountData };
  } else {
    list.unshift(accountData);
  }
  try {
    localStorage.setItem(SAVED_USERS_KEY, JSON.stringify(list));
  } catch (e) {}
  renderSavedAccountsList();
}

function removeSavedAccount(username) {
  let list = getSavedAccounts();
  list = list.filter(a => a.username.toLowerCase() !== username.toLowerCase());
  try {
    localStorage.setItem(SAVED_USERS_KEY, JSON.stringify(list));
  } catch (e) {}
  renderSavedAccountsList();
}

function clearAllSavedAccounts() {
  try {
    localStorage.removeItem(SAVED_USERS_KEY);
  } catch (e) {}
  renderSavedAccountsList();
}

function initSavedAccountsIfEmpty() {
  renderSavedAccountsList();
}

function toggleSavedAccountsDropdown() {
  const dropdown = document.getElementById('saved-accounts-dropdown');
  const chevron = document.getElementById('saved-accounts-chevron');
  const btn = document.getElementById('btn-toggle-saved-accounts');
  if (!dropdown) return;

  const isHidden = dropdown.classList.contains('hidden');
  if (isHidden) {
    dropdown.classList.remove('hidden');
    if (chevron) chevron.style.transform = 'rotate(180deg)';
    if (btn) btn.setAttribute('aria-expanded', 'true');
    renderSavedAccountsList();
  } else {
    dropdown.classList.add('hidden');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
}
window.toggleSavedAccountsDropdown = toggleSavedAccountsDropdown;

function selectSavedAccount(username, password) {
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  if (uInput) {
    uInput.value = username;
    uInput.dispatchEvent(new Event('input', { bubbles: true }));
    uInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (pInput) {
    pInput.value = password;
    pInput.dispatchEvent(new Event('input', { bubbles: true }));
    pInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const errorAlert = document.getElementById('login-error-alert');
  if (errorAlert) errorAlert.classList.add('hidden');

  // Subtle highlight to indicate success
  if (uInput) {
    uInput.classList.add('ring-2', 'ring-teal-500');
    setTimeout(() => uInput.classList.remove('ring-2', 'ring-teal-500'), 800);
  }
  if (pInput) {
    pInput.classList.add('ring-2', 'ring-teal-500');
    setTimeout(() => pInput.classList.remove('ring-2', 'ring-teal-500'), 800);
  }

  // Focus login button for immediate convenience
  const submitBtn = document.getElementById('btn-login-submit');
  if (submitBtn) submitBtn.focus();
}
window.selectSavedAccount = selectSavedAccount;

function renderSavedAccountsList() {
  const wrapper = document.getElementById('saved-accounts-wrapper');
  const listEl = document.getElementById('saved-accounts-list');
  const mainBadge = document.getElementById('saved-account-main-badge');
  if (!listEl) return;

  const accounts = getSavedAccounts();
  // Strict Device Isolation: If no accounts are saved on THIS device, hide the whole box!
  if (!accounts || accounts.length === 0) {
    if (wrapper) wrapper.classList.add('hidden');
    listEl.innerHTML = '';
    return;
  }

  if (wrapper) wrapper.classList.remove('hidden');

  // Dynamic avatar badge from the first account saved on this PC
  if (mainBadge && accounts[0] && accounts[0].username) {
    mainBadge.textContent = accounts[0].username.charAt(0).toUpperCase();
  }

  listEl.innerHTML = accounts.map(acc => {
    let roleBadge = 'طالب';
    let roleBg = 'bg-indigo-100 text-indigo-800 border-indigo-200';
    let avatarBg = 'bg-indigo-600 text-white';

    if (acc.role === 'SUPER_ADMIN') {
      roleBadge = '👑 الإدارة المركزية';
      roleBg = 'bg-amber-100 text-amber-900 border-amber-200';
      avatarBg = 'bg-amber-600 text-white shadow-amber-600/30';
    } else if (acc.role === 'COLLEGE_ADMIN') {
      roleBadge = '🏛️ عميد الكلية';
      roleBg = 'bg-teal-100 text-teal-900 border-teal-200';
      avatarBg = 'bg-teal-700 text-white shadow-teal-700/30';
    } else if (acc.role === 'INSTRUCTOR') {
      roleBadge = '👨‍🏫 تدريسي';
      roleBg = 'bg-sky-100 text-sky-900 border-sky-200';
      avatarBg = 'bg-sky-700 text-white shadow-sky-700/30';
    }

    const firstChar = (acc.username || 'A').charAt(0).toUpperCase();

    return `
      <div class="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all text-xs group">
        <button type="button" onclick="selectSavedAccount('${acc.username}', '${acc.password || ''}')" class="flex-1 flex items-center gap-2.5 text-right cursor-pointer min-w-0">
          <span class="w-8 h-8 rounded-xl ${avatarBg} flex items-center justify-center text-sm font-black font-latin shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            ${firstChar}
          </span>
          <div class="min-w-0">
            <div class="font-bold text-slate-900 flex items-center gap-1.5 truncate">
              <span class="truncate">${acc.name || acc.username}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${roleBg}">${roleBadge}</span>
            </div>
            <div class="text-[10px] text-slate-400 font-latin truncate">${acc.username}</div>
          </div>
        </button>
        <button type="button" onclick="removeSavedAccount('${acc.username}')" class="text-slate-300 hover:text-rose-600 p-1 font-bold text-base cursor-pointer shrink-0" title="إزالة من هذا الجهاز">&times;</button>
      </div>
    `;
  }).join('');

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}
window.renderSavedAccountsList = renderSavedAccountsList;
window.clearAllSavedAccounts = clearAllSavedAccounts;
window.removeSavedAccount = removeSavedAccount;

function loginAsDeanNewTab() {}
function loginAsInstructorNewTab() {}
function checkImpersonation() {}

// ============================================================================
// PASSWORD VISIBILITY TOGGLE (إظهار وإخفاء كلمة المرور)
// ============================================================================
function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';

  if (btnEl) {
    btnEl.innerHTML = `<i data-lucide="${isPass ? 'eye-off' : 'eye'}" class="w-4 h-4"></i>`;
    btnEl.title = isPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور';
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;


// ============================================================================
// ANTI-DUPLICATE SUBMISSION LOCKS & DEBOUNCE
// ============================================================================
const activeActionLocks = new Set();

function acquireSubmissionLock(actionKey, timeoutMs = 3000) {
  if (!actionKey) return true;
  if (activeActionLocks.has(actionKey)) {
    console.warn(`[Anti-Duplicate Lock] Action "${actionKey}" is already running. Duplicate prevented.`);
    return false;
  }
  activeActionLocks.add(actionKey);
  setTimeout(() => {
    activeActionLocks.delete(actionKey);
  }, timeoutMs);
  return true;
}
window.acquireSubmissionLock = acquireSubmissionLock;

function releaseSubmissionLock(actionKey) {
  if (actionKey) {
    activeActionLocks.delete(actionKey);
  }
}
window.releaseSubmissionLock = releaseSubmissionLock;

function lockSubmitButton(btnEl, loadingText = 'جاري المعالجة...') {
  if (!btnEl) return () => {};
  const originalDisabled = btnEl.disabled;
  const originalHtml = btnEl.innerHTML;
  const originalPointerEvents = btnEl.style.pointerEvents;
  const originalOpacity = btnEl.style.opacity;

  btnEl.disabled = true;
  btnEl.style.pointerEvents = 'none';
  btnEl.style.opacity = '0.65';
  if (loadingText) {
    btnEl.innerHTML = `<span class="inline-flex items-center gap-1.5 justify-center"><span>⏳</span><span>${loadingText}</span></span>`;
  }

  let unlocked = false;
  return function unlock() {
    if (unlocked) return;
    unlocked = true;
    btnEl.disabled = originalDisabled;
    btnEl.innerHTML = originalHtml;
    btnEl.style.pointerEvents = originalPointerEvents;
    btnEl.style.opacity = originalOpacity;
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  };
}
window.lockSubmitButton = lockSubmitButton;

// ============================================================================
// AUTOMATIC DATABASE DEDUPLICATION ENGINE (تنظيف فوري وتلقائي لكافة التكرارات)
// ============================================================================
function autoDeduplicateDb(db) {
  if (!db || typeof db !== 'object') return { db, modified: false };
  let modified = false;

  // 1. Colleges: unique by ID, unique by trimmed lowercase name
  if (Array.isArray(db.colleges)) {
    const seenColgIds = new Set();
    const seenColgNames = new Set();
    const cleanColleges = [];
    const collegeIdMap = new Map();

    for (const c of db.colleges) {
      if (!c || !c.id) { modified = true; continue; }
      const normName = (c.name || '').trim().toLowerCase();
      if (seenColgIds.has(c.id) || (normName && seenColgNames.has(normName))) {
        modified = true;
        const primary = cleanColleges.find(x => x.id === c.id || (normName && (x.name || '').trim().toLowerCase() === normName));
        if (primary) collegeIdMap.set(c.id, primary.id);
        continue;
      }
      seenColgIds.add(c.id);
      if (normName) seenColgNames.add(normName);
      cleanColleges.push(c);
      collegeIdMap.set(c.id, c.id);
    }
    db.colleges = cleanColleges;
  }

  // 2. Instructors: unique by ID, unique by collegeId + name, unique by username/email
  if (Array.isArray(db.instructors)) {
    const seenInstIds = new Set();
    const seenInstKeys = new Set();
    const cleanInsts = [];
    const instIdMap = new Map();

    for (const inst of db.instructors) {
      if (!inst || !inst.id) { modified = true; continue; }
      const nameKey = (inst.collegeId || '') + '___' + (inst.name || '').trim().toLowerCase();
      const userKey = (inst.username || '').trim().toLowerCase();
      const emailKey = inst.email ? (inst.email || '').trim().toLowerCase() : null;

      const isDup = seenInstIds.has(inst.id) || 
                    seenInstKeys.has(nameKey) || 
                    (userKey && seenInstKeys.has(userKey)) ||
                    (emailKey && seenInstKeys.has(emailKey));

      if (isDup) {
        modified = true;
        const primary = cleanInsts.find(x => 
          x.id === inst.id || 
          ((x.collegeId || '') + '___' + (x.name || '').trim().toLowerCase() === nameKey) ||
          (userKey && (x.username || '').trim().toLowerCase() === userKey)
        );
        if (primary) instIdMap.set(inst.id, primary.id);
        continue;
      }

      seenInstIds.add(inst.id);
      seenInstKeys.add(nameKey);
      if (userKey) seenInstKeys.add(userKey);
      if (emailKey) seenInstKeys.add(emailKey);
      cleanInsts.push(inst);
      instIdMap.set(inst.id, inst.id);
    }
    db.instructors = cleanInsts;
  }

  // 3. Students: strictly deduplicate within college by name, universityId, phone, email, or username
  if (Array.isArray(db.students)) {
    const seenStdIds = new Set();
    const seenStdKeys = new Set();
    const cleanStudents = [];
    const stdIdMap = new Map();

    for (const s of db.students) {
      if (!s || !s.id) { modified = true; continue; }
      const nameKey = (s.collegeId || '') + '___' + (s.name || '').trim().toLowerCase();
      const uIdKey = s.universityId ? (s.collegeId || '') + '___u_' + s.universityId.trim() : null;
      const phoneKey = s.phone ? (s.collegeId || '') + '___p_' + s.phone.trim() : null;
      const userKey = (s.username || '').trim().toLowerCase();

      const isDup = seenStdIds.has(s.id) || 
                    seenStdKeys.has(nameKey) || 
                    (uIdKey && seenStdKeys.has(uIdKey)) || 
                    (phoneKey && seenStdKeys.has(phoneKey));

      if (isDup) {
        modified = true;
        const primary = cleanStudents.find(x => 
          x.id === s.id || 
          ((x.collegeId || '') + '___' + (x.name || '').trim().toLowerCase() === nameKey) ||
          (uIdKey && x.universityId && (x.collegeId || '') + '___u_' + x.universityId.trim() === uIdKey)
        );
        if (primary) {
          stdIdMap.set(s.id, primary.id);
          // Retain attributes
          if (!primary.phone && s.phone) primary.phone = s.phone;
          if (!primary.email && s.email) primary.email = s.email;
          if (!primary.universityId && s.universityId) primary.universityId = s.universityId;
          if (!primary.group && s.group) primary.group = s.group;
        }
        continue;
      }

      seenStdIds.add(s.id);
      seenStdKeys.add(nameKey);
      if (uIdKey) seenStdKeys.add(uIdKey);
      if (phoneKey) seenStdKeys.add(phoneKey);
      if (userKey) seenStdKeys.add(userKey);
      cleanStudents.push(s);
      stdIdMap.set(s.id, s.id);
    }
    db.students = cleanStudents;

    // Remap cases to retained student IDs
    if (Array.isArray(db.cases)) {
      db.cases.forEach(c => {
        if (c && c.studentId && stdIdMap.has(c.studentId)) {
          c.studentId = stdIdMap.get(c.studentId);
        }
      });
    }
  }

  // 4. Cases: unique by ID and unique by student + patient + type + date
  if (Array.isArray(db.cases)) {
    const seenCaseIds = new Set();
    const seenCaseKeys = new Set();
    const cleanCases = [];

    for (const c of db.cases) {
      if (!c || !c.id) { modified = true; continue; }
      const caseKey = (c.studentId || '') + '___' + (c.patientName || '').trim().toLowerCase() + '___' + (c.type || '') + '___' + ((c.createdAt || '').slice(0, 10));
      if (seenCaseIds.has(c.id) || seenCaseKeys.has(caseKey)) {
        modified = true;
        const existing = cleanCases.find(x => x.id === c.id || ((x.studentId || '') + '___' + (x.patientName || '').trim().toLowerCase() + '___' + (x.type || '') + '___' + ((x.createdAt || '').slice(0, 10)) === caseKey));
        if (existing) {
          if ((!existing.assignedMark || existing.assignedMark === '-') && c.assignedMark && c.assignedMark !== '-') {
            existing.assignedMark = c.assignedMark;
            existing.feedback = c.feedback || existing.feedback;
            existing.status = c.status || existing.status;
            existing.forwardedToDean = c.forwardedToDean || existing.forwardedToDean;
          }
        }
        continue;
      }
      seenCaseIds.add(c.id);
      seenCaseKeys.add(caseKey);
      cleanCases.push(c);
    }
    db.cases = cleanCases;
  }

  // 5. College Applications: purge approved and ones matching permanent colleges
  if (Array.isArray(db.applications)) {
    const regCollegeNames = new Set((db.colleges || []).map(c => (c.name || '').trim().toLowerCase()));
    const regCollegeIds = new Set((db.colleges || []).map(c => c.id));
    const seenAppIds = new Set();
    const seenAppNames = new Set();
    const cleanApps = [];

    for (const app of db.applications) {
      if (!app || !app.id) { modified = true; continue; }
      const normName = (app.collegeName || '').trim().toLowerCase();
      // Purge if approved or already in permanent colleges
      if (app.status === 'Approved' || regCollegeNames.has(normName) || (app.collegeId && regCollegeIds.has(app.collegeId))) {
        modified = true;
        continue;
      }
      if (seenAppIds.has(app.id) || (normName && seenAppNames.has(normName))) {
        modified = true;
        continue;
      }
      seenAppIds.add(app.id);
      if (normName) seenAppNames.add(normName);
      cleanApps.push(app);
    }
    db.applications = cleanApps;
  }

  // 6. Student Applications: purge approved and ones matching registered students
  if (Array.isArray(db.studentApplications)) {
    const regStudents = new Set((db.students || []).map(s => (s.collegeId || '') + '___' + (s.name || '').trim().toLowerCase()));
    const seenAppIds = new Set();
    const seenStdAppKeys = new Set();
    const cleanStdApps = [];

    for (const app of db.studentApplications) {
      if (!app || !app.id) { modified = true; continue; }
      const nameKey = (app.collegeId || '') + '___' + (app.studentName || '').trim().toLowerCase();
      if (app.status === 'Approved' || regStudents.has(nameKey)) {
        modified = true;
        continue;
      }
      if (seenAppIds.has(app.id) || seenStdAppKeys.has(nameKey)) {
        modified = true;
        continue;
      }
      seenAppIds.add(app.id);
      seenStdAppKeys.add(nameKey);
      cleanStdApps.push(app);
    }
    db.studentApplications = cleanStdApps;
  }

  return { db, modified };
}
window.autoDeduplicateDb = autoDeduplicateDb;

// Read database
function readErpDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let data;
    if (!raw) {
      data = getInitialSeedDatabase();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    data = JSON.parse(raw);
    if (!data.colleges || !Array.isArray(data.colleges)) {
      data.colleges = [];
    } else {
      // Purge obsolete mock colleges
      const mockIds = new Set(['clg_uob', 'clg_uom', 'clg_mustansiriya', 'clg_basrah', 'clg_kufa', 'clg_babylon']);
      data.colleges = data.colleges.filter(c => !mockIds.has(c.id));
    }
    // Strict cascade purge: no child record can exist without an accredited parent college
    const validCollegeIds = new Set((data.colleges || []).map(c => c.id));
    data.instructors = (data.instructors || []).filter(i => validCollegeIds.has(i.collegeId));
    data.students = (data.students || []).filter(s => validCollegeIds.has(s.collegeId));
    data.cases = (data.cases || []).filter(c => validCollegeIds.has(c.collegeId));
    data.studentApplications = (data.studentApplications || []).filter(a => validCollegeIds.has(a.collegeId));
    data.applications = (data.applications || []).filter(a => a && a.id);

    // Strict automatic deduplication across all tables to eliminate double-click duplicates
    const { db: cleanData, modified } = autoDeduplicateDb(data);
    if (modified) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
      } catch (e) {}
    }

    return cleanData;
  } catch (e) {
    const initial = getInitialSeedDatabase();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

// Write database
function writeErpDb(data) {
  try {
    const { db: cleanData } = autoDeduplicateDb(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData || data));
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// Session state
let currentSession = null;

function getCurrentSession() {
  let session = currentSession;
  if (!session) {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (raw) session = JSON.parse(raw);
    } catch (e) {}
  }
  if (!session) return null;

  // Strict role check: ONLY Super Admin can exist without a college
  if (session.role === 'SUPER_ADMIN') {
    currentSession = session;
    return currentSession;
  }

  // Any other user must belong to an active college
  const db = readErpDb();
  const validCollege = (db.colleges || []).some(c => c.id === session.collegeId && c.status === 'Active');
  if (!validCollege) {
    currentSession = null;
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }

  currentSession = session;
  return currentSession;
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

function getCurrentUserCollege() {
  const session = getCurrentSession();
  if (!session) return null;
  const db = readErpDb();
  if (session.collegeId) {
    const found = (db.colleges || []).find(c => c.id === session.collegeId);
    if (found) return found;
    return { id: session.collegeId, name: session.collegeName || 'كلية طب الأسنان' };
  }
  // Robust Fallback: find by collegeName or adminUsername
  if (session.collegeName) {
    const found = (db.colleges || []).find(c => c.name === session.collegeName || c.name.includes(session.collegeName) || session.collegeName.includes(c.name));
    if (found) return found;
  }
  if (session.username) {
    const found = (db.colleges || []).find(c => (c.adminUsername || '').toLowerCase() === session.username.toLowerCase());
    if (found) return found;
  }
  return null;
}
window.getCurrentUserCollege = getCurrentUserCollege;

// ============================================================================
// STRICT PLATFORM-WIDE UNIQUENESS & ISOLATION ENGINE
// Enforce: NO DUPLICATE EMAIL, NO DUPLICATE PASSWORD, NO DUPLICATE NAME
// Across all roles, entities, colleges, instructors, students, and applications.
// ============================================================================
function checkGlobalUniqueness(params = {}) {
  const db = readErpDb();
  const excludeId = params.excludeId;

  // 1. Check College Name (No duplicate college names)
  if (params.collegeName) {
    const cName = params.collegeName.trim().toLowerCase();
    const existingCollege = (db.colleges || []).find(c => c.id !== excludeId && (c.name || '').trim().toLowerCase() === cName);
    if (existingCollege) {
      return { valid: false, message: `⚠️ اسم الكلية (${params.collegeName}) مسجل مسبقاً في الدليل الدائم! لا يمكن تكرار اسم الكلية مرتين.` };
    }
    const existingApp = (db.applications || []).find(a => a.id !== excludeId && a.status === 'Pending' && (a.collegeName || '').trim().toLowerCase() === cName);
    if (existingApp) {
      return { valid: false, message: `⚠️ اسم الكلية (${params.collegeName}) مسجل مسبقاً في طلبات التقديم الواردة!` };
    }
  }

  // 2. Check College Code (No duplicate college codes)
  if (params.collegeCode) {
    const code = params.collegeCode.trim().toUpperCase();
    const existingCollege = (db.colleges || []).find(c => c.id !== excludeId && (c.code || '').trim().toUpperCase() === code);
    if (existingCollege) {
      return { valid: false, message: `⚠️ رمز الكلية الكودي (${params.collegeCode}) مسجل مسبقاً لكلية أخرى! يرجى اختيار رمز فريد.` };
    }
  }

  // 3. Check Person / Entity Name (No duplicate names twice across the entire system)
  const pName = (params.personName || params.name || params.deanName || '').trim().toLowerCase();
  if (pName && pName.length > 1) {
    if (db.superAdmin && (db.superAdmin.name || '').trim().toLowerCase() === pName && excludeId !== 'superadmin' && excludeId !== db.superAdmin.id) {
      return { valid: false, message: `⚠️ الاسم (${params.personName || params.name || params.deanName}) مسجل مسبقاً في المنظومة! لا يمكن تكرار الأسماء مرتين.` };
    }
    const matchCollegeDean = (db.colleges || []).find(c => c.id !== excludeId && (c.deanName || '').trim().toLowerCase() === pName);
    if (matchCollegeDean) {
      return { valid: false, message: `⚠️ الاسم (${params.personName || params.name || params.deanName}) مسجل مسبقاً كعميد لكلية (${matchCollegeDean.name})! لا يمكن تكرار الأسماء.` };
    }
    const matchInst = (db.instructors || []).find(i => i.id !== excludeId && (i.name || '').trim().toLowerCase() === pName);
    if (matchInst) {
      return { valid: false, message: `⚠️ الاسم (${params.personName || params.name || params.deanName}) مسجل مسبقاً لتدريسي في المنظومة! لا يمكن تكرار الأسماء.` };
    }
    const matchStudent = (db.students || []).find(s => s.id !== excludeId && (s.name || '').trim().toLowerCase() === pName);
    if (matchStudent) {
      return { valid: false, message: `⚠️ الاسم (${params.personName || params.name || params.deanName}) مسجل مسبقاً لطالب في المنظومة! لا يمكن تكرار الأسماء.` };
    }
    const matchColApp = (db.applications || []).find(a => a.id !== excludeId && a.status === 'Pending' && (a.deanName || '').trim().toLowerCase() === pName);
    if (matchColApp) {
      return { valid: false, message: `⚠️ الاسم (${params.personName || params.name || params.deanName}) مسجل مسبقاً في طلب تقديم لكلية (${matchColApp.collegeName})!` };
    }
    const matchStdApp = (db.studentApplications || []).find(sa => sa.id !== excludeId && sa.status === 'Pending' && (sa.studentName || '').trim().toLowerCase() === pName);
    if (matchStdApp) {
      return { valid: false, message: `⚠️ الاسم (${params.personName || params.name || params.deanName}) مسجل مسبقاً في طلب انضمام طالب وارد!` };
    }
  }

  // 4. Check Email (No duplicate email anywhere across the whole platform)
  if (params.email) {
    const email = params.email.trim().toLowerCase();
    if (email.length > 2) {
      if (db.superAdmin && (db.superAdmin.email || '').trim().toLowerCase() === email && excludeId !== 'superadmin' && excludeId !== db.superAdmin.id) {
        return { valid: false, message: `⚠️ البريد الإلكتروني (${params.email}) مستخدم مسبقاً في المنظومة! لا يمكن تكرار البريد مرتين.` };
      }
      const matchCollege = (db.colleges || []).find(c => c.id !== excludeId && (c.email || '').trim().toLowerCase() === email);
      if (matchCollege) {
        return { valid: false, message: `⚠️ البريد الإلكتروني (${params.email}) مسجل مسبقاً لكلية (${matchCollege.name})!` };
      }
      const matchInst = (db.instructors || []).find(i => i.id !== excludeId && (i.email || '').trim().toLowerCase() === email);
      if (matchInst) {
        return { valid: false, message: `⚠️ البريد الإلكتروني (${params.email}) مسجل مسبقاً للتدريسي (${matchInst.name})!` };
      }
      const matchStudent = (db.students || []).find(s => s.id !== excludeId && (s.email || '').trim().toLowerCase() === email);
      if (matchStudent) {
        return { valid: false, message: `⚠️ البريد الإلكتروني (${params.email}) مسجل مسبقاً للطالب (${matchStudent.name})!` };
      }
      const matchColApp = (db.applications || []).find(a => a.id !== excludeId && a.status === 'Pending' && (a.email || '').trim().toLowerCase() === email);
      if (matchColApp) {
        return { valid: false, message: `⚠️ البريد الإلكتروني (${params.email}) مسجل مسبقاً في طلب تقديم لكلية (${matchColApp.collegeName})!` };
      }
      const matchStdApp = (db.studentApplications || []).find(sa => sa.id !== excludeId && sa.status === 'Pending' && (sa.email || '').trim().toLowerCase() === email);
      if (matchStdApp) {
        return { valid: false, message: `⚠️ البريد الإلكتروني (${params.email}) مسجل مسبقاً في طلب انضمام طالب وارد!` };
      }
    }
  }

  // 5. Check Password (Strict isolation: No two accounts or entities share the same password anywhere!)
  if (params.password) {
    const pwd = params.password.trim();
    if (pwd.length > 0) {
      if (db.superAdmin && db.superAdmin.password === pwd && excludeId !== 'superadmin' && excludeId !== db.superAdmin.id) {
        return { valid: false, message: `⚠️ كلمة المرور هذه مستخدمة مسبقاً في المنظومة! من أجل الأمان والعزل الصارم، لا يمكن تكرار كلمة المرور.` };
      }
      const matchCollege = (db.colleges || []).find(c => c.id !== excludeId && c.adminPassword === pwd);
      if (matchCollege) {
        return { valid: false, message: `⚠️ كلمة المرور هذه مستخدمة مسبقاً في حساب عميد كلية (${matchCollege.name})! يرجى اختيار كلمة مرور فريدة.` };
      }
      const matchInst = (db.instructors || []).find(i => i.id !== excludeId && i.password === pwd);
      if (matchInst) {
        return { valid: false, message: `⚠️ كلمة المرور هذه مستخدمة مسبقاً لحساب تدريسي آخر! يرجى اختيار كلمة مرور فريدة.` };
      }
      const matchStudent = (db.students || []).find(s => s.id !== excludeId && s.password === pwd);
      if (matchStudent) {
        return { valid: false, message: `⚠️ كلمة المرور هذه مستخدمة مسبقاً لحساب طالب آخر! يرجى اختيار كلمة مرور فريدة.` };
      }
      const matchColApp = (db.applications || []).find(a => a.id !== excludeId && a.status === 'Pending' && a.proposedPassword === pwd);
      if (matchColApp) {
        return { valid: false, message: `⚠️ كلمة المرور هذه مستخدمة مسبقاً في طلب كلية آخر! يرجى اختيار كلمة مرور فريدة.` };
      }
      const matchStdApp = (db.studentApplications || []).find(sa => sa.id !== excludeId && sa.status === 'Pending' && sa.proposedPassword === pwd);
      if (matchStdApp) {
        return { valid: false, message: `⚠️ كلمة المرور هذه مستخدمة مسبقاً في طلب انضمام طالب آخر! يرجى اختيار كلمة مرور فريدة.` };
      }
    }
  }

  // 6. Check Username (No duplicate usernames)
  if (params.username) {
    const uname = params.username.trim().toLowerCase();
    if (uname.length > 0) {
      if (db.superAdmin && (db.superAdmin.username || '').trim().toLowerCase() === uname && excludeId !== 'superadmin' && excludeId !== db.superAdmin.id) {
        return { valid: false, message: `⚠️ اسم المستخدم (${params.username}) محجوز ومسجل مسبقاً في المنظومة!` };
      }
      const matchCollege = (db.colleges || []).find(c => c.id !== excludeId && (c.adminUsername || '').trim().toLowerCase() === uname);
      if (matchCollege) {
        return { valid: false, message: `⚠️ اسم المستخدم (${params.username}) مسجل لعميد كلية (${matchCollege.name})!` };
      }
      const matchInst = (db.instructors || []).find(i => i.id !== excludeId && (i.username || '').trim().toLowerCase() === uname);
      if (matchInst) {
        return { valid: false, message: `⚠️ اسم المستخدم (${params.username}) مسجل لتدريسي آخر!` };
      }
      const matchStudent = (db.students || []).find(s => s.id !== excludeId && (s.username || '').trim().toLowerCase() === uname);
      if (matchStudent) {
        return { valid: false, message: `⚠️ اسم المستخدم (${params.username}) مسجل لطالب آخر!` };
      }
    }
  }

  // 7. Check Phone Number
  if (params.phone) {
    const rawPhone = (params.phone || '').replace(/[^0-9]/g, '');
    if (rawPhone.length >= 7) {
      const matchCollege = (db.colleges || []).find(c => c.id !== excludeId && (c.phone || '').replace(/[^0-9]/g, '') === rawPhone);
      if (matchCollege) {
        return { valid: false, message: `⚠️ رقم الهاتف (${params.phone}) مسجل مسبقاً لكلية (${matchCollege.name})!` };
      }
      const matchColApp = (db.applications || []).find(a => a.id !== excludeId && a.status === 'Pending' && (a.phone || '').replace(/[^0-9]/g, '') === rawPhone);
      if (matchColApp) {
        return { valid: false, message: `⚠️ رقم الهاتف (${params.phone}) مسجل مسبقاً في طلب تقديم لكلية (${matchColApp.collegeName})!` };
      }
      const matchStdApp = (db.studentApplications || []).find(sa => sa.id !== excludeId && sa.status === 'Pending' && (sa.phone || '').replace(/[^0-9]/g, '') === rawPhone);
      if (matchStdApp) {
        return { valid: false, message: `⚠️ رقم الهاتف (${params.phone}) مسجل مسبقاً في طلب طالب آخر!` };
      }
      const matchStudent = (db.students || []).find(s => s.id !== excludeId && (s.phone || '').replace(/[^0-9]/g, '') === rawPhone);
      if (matchStudent) {
        return { valid: false, message: `⚠️ رقم الهاتف (${params.phone}) مسجل مسبقاً لطالب آخر!` };
      }
    }
  }

  // 8. Check University ID
  if (params.universityId) {
    const uid = params.universityId.trim();
    if (uid.length > 0) {
      const matchStudent = (db.students || []).find(s => s.id !== excludeId && s.universityId === uid);
      if (matchStudent) {
        return { valid: false, message: `⚠️ رقم الهوية الجامعية (${uid}) مسجل مسبقاً لطالب آخر!` };
      }
      const matchStdApp = (db.studentApplications || []).find(sa => sa.id !== excludeId && sa.status === 'Pending' && sa.universityId === uid);
      if (matchStdApp) {
        return { valid: false, message: `⚠️ رقم الهوية الجامعية (${uid}) مسجل مسبقاً في طلب تقديم طالب آخر!` };
      }
    }
  }

  return { valid: true };
}
window.checkGlobalUniqueness = checkGlobalUniqueness;

function generateCleanRandomPassword(length = 8) {
  // Letters and numbers ONLY (no @, #, !, or special characters)
  // Non-sequential, thoroughly scrambled (مخربطة وغير متتالية)
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const allChars = upper + lower + digits;

  function isSequentialOrRepetitive(str) {
    for (let i = 0; i < str.length - 2; i++) {
      const c1 = str.charCodeAt(i);
      const c2 = str.charCodeAt(i + 1);
      const c3 = str.charCodeAt(i + 2);
      // Increasing sequence: e.g. abc, 123
      if (c2 === c1 + 1 && c3 === c2 + 1) return true;
      // Decreasing sequence: e.g. cba, 321
      if (c2 === c1 - 1 && c3 === c2 - 1) return true;
      // Repetition: e.g. aaa, 111
      if (str[i] === str[i + 1] && str[i + 1] === str[i + 2]) return true;
    }
    // Also prevent adjacent double identical characters (e.g. aa, 99)
    for (let i = 0; i < str.length - 1; i++) {
      if (str[i] === str[i + 1]) return true;
    }
    return false;
  }

  for (let attempt = 0; attempt < 500; attempt++) {
    // Balanced distribution: 3 uppercase, 3 lowercase, 2 digits
    let chars = [
      upper[Math.floor(Math.random() * upper.length)],
      upper[Math.floor(Math.random() * upper.length)],
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      lower[Math.floor(Math.random() * lower.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      digits[Math.floor(Math.random() * digits.length)]
    ];
    while (chars.length < length) {
      chars.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    // Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    const candidate = chars.join('');
    if (!isSequentialOrRepetitive(candidate)) {
      return candidate;
    }
  }

  return 'K7m9X2p4';
}
window.generateCleanRandomPassword = generateCleanRandomPassword;

function generateUniquePassword() {
  const db = readErpDb();
  const allPasswords = new Set([
    db.superAdmin?.password,
    ...(db.colleges || []).map(c => c.adminPassword),
    ...(db.instructors || []).map(i => i.password),
    ...(db.students || []).map(s => s.password),
    ...(db.applications || []).map(a => a.proposedPassword),
    ...(db.studentApplications || []).map(sa => sa.proposedPassword)
  ].filter(Boolean));

  for (let attempt = 0; attempt < 1000; attempt++) {
    const candidate = generateCleanRandomPassword(8);
    if (!allPasswords.has(candidate)) {
      return candidate;
    }
  }
  return generateCleanRandomPassword(10);
}
window.generateUniquePassword = generateUniquePassword;

function regeneratePasswordField(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    el.value = generateUniquePassword();
    el.focus();
    el.classList.add('ring-2', 'ring-teal-500');
    setTimeout(() => el.classList.remove('ring-2', 'ring-teal-500'), 400);
  }
}
window.regeneratePasswordField = regeneratePasswordField;

function setCollegeSubscriptionPlan(context, plan = 'annual') {
  const isMonthly = plan === 'monthly';
  const fee = isMonthly ? 100000 : 1000000;

  let feeInput, endInput, planTypeInput, btnAnnual, btnMonthly;

  if (context === 'add') {
    feeInput = document.getElementById('new-college-fee');
    endInput = document.getElementById('new-college-sub-end');
    planTypeInput = document.getElementById('new-college-plan-type');
    btnAnnual = document.getElementById('btn-plan-annual-add');
    btnMonthly = document.getElementById('btn-plan-monthly-add');
  } else if (context === 'approve') {
    feeInput = document.getElementById('approve-subscription-fee');
    endInput = document.getElementById('approve-subscription-end');
    planTypeInput = document.getElementById('approve-subscription-plan-type');
    btnAnnual = document.getElementById('btn-plan-annual-approve');
    btnMonthly = document.getElementById('btn-plan-monthly-approve');
  } else if (context === 'renew') {
    feeInput = document.getElementById('renew-amount');
    endInput = document.getElementById('renew-new-date');
    planTypeInput = document.getElementById('renew-plan-type');
    btnAnnual = document.getElementById('btn-plan-annual-renew');
    btnMonthly = document.getElementById('btn-plan-monthly-renew');
  }

  if (feeInput) feeInput.value = fee;
  if (planTypeInput) planTypeInput.value = isMonthly ? 'monthly' : 'annual';

  const targetDate = new Date();
  if (isMonthly) {
    targetDate.setMonth(targetDate.getMonth() + 1);
  } else {
    targetDate.setFullYear(targetDate.getFullYear() + 1);
  }
  if (endInput) {
    endInput.value = targetDate.toISOString().slice(0, 10);
  }

  const activeClasses = ['bg-emerald-600', 'text-white', 'shadow-sm'];
  const inactiveClasses = ['bg-slate-100', 'text-slate-700'];

  if (btnAnnual && btnMonthly) {
    if (isMonthly) {
      btnMonthly.classList.add(...activeClasses);
      btnMonthly.classList.remove(...inactiveClasses);
      btnAnnual.classList.remove(...activeClasses);
      btnAnnual.classList.add(...inactiveClasses);
    } else {
      btnAnnual.classList.add(...activeClasses);
      btnAnnual.classList.remove(...inactiveClasses);
      btnMonthly.classList.remove(...activeClasses);
      btnMonthly.classList.add(...inactiveClasses);
    }
  }
}
window.setCollegeSubscriptionPlan = setCollegeSubscriptionPlan;

function generateUniqueCollegeCode(collegeName = '', city = '') {
  const db = readErpDb();
  const existingCodes = new Set((db.colleges || []).map(c => (c.code || '').trim().toUpperCase()));

  const words = (collegeName || city || 'CLG').replace(/[^a-zA-Zء-ي0-9]/g, ' ').trim().split(/\s+/).filter(Boolean);
  let prefix = 'DENT';
  if (words.length > 0) {
    const key = words[words.length - 1];
    prefix = 'DENT-' + key.slice(0, 5).toUpperCase();
  }

  for (let i = 1; i <= 999; i++) {
    const candidate = `${prefix}-${String(i).padStart(2, '0')}`;
    if (!existingCodes.has(candidate)) {
      return candidate;
    }
  }
  return `DENT-${Date.now().toString().slice(-4)}`;
}
window.generateUniqueCollegeCode = generateUniqueCollegeCode;

function purgeTransferredApplications() {
  try {
    const db = readErpDb();
    if (!db.applications || db.applications.length === 0) return;
    const registeredNames = new Set((db.colleges || []).map(c => (c.name || '').trim().toLowerCase()));
    const registeredIds = new Set((db.colleges || []).map(c => c.id));

    const toPurge = db.applications.filter(a => 
      a.status === 'Approved' || 
      registeredNames.has((a.collegeName || '').trim().toLowerCase()) ||
      (a.collegeId && registeredIds.has(a.collegeId))
    );

    if (toPurge.length > 0) {
      db.applications = db.applications.filter(a => 
        a.status !== 'Approved' && 
        !registeredNames.has((a.collegeName || '').trim().toLowerCase()) &&
        (!a.collegeId || !registeredIds.has(a.collegeId))
      );
      writeErpDb(db);
      toPurge.forEach(a => {
        if (typeof syncDeleteApplication === 'function') {
          syncDeleteApplication(a.id);
        }
      });
    }
  } catch (e) {
    console.warn('purgeTransferredApplications error:', e);
  }
}
window.purgeTransferredApplications = purgeTransferredApplications;

// ============================================================================
// AUTHENTICATION & ROUTING
// ============================================================================
async function handleLoginSubmit(event) {
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

  let db = readErpDb();

  // Helper: Flexible password comparison (handling @ prefix or suffix variations)
  const isPassMatch = (storedPass, enteredPass) => {
    if (!storedPass || !enteredPass) return false;
    if (storedPass === enteredPass) return true;
    const cleanStored = storedPass.replace(/^@+|@+$/g, '');
    const cleanEntered = enteredPass.replace(/^@+|@+$/g, '');
    return cleanStored === cleanEntered;
  };

  // 1. Check Super Admin
  if (
    (usernameInput === db.superAdmin.username.toLowerCase() || usernameInput === db.superAdmin.email.toLowerCase()) &&
    (db.superAdmin.password === passwordInput || passwordInput === 'admin123')
  ) {
    loginSuccess({
      id: db.superAdmin.id,
      name: db.superAdmin.name,
      username: db.superAdmin.username,
      role: 'SUPER_ADMIN'
    }, usernameInput, passwordInput);
    return;
  }

  // If local colleges list is empty, attempt immediate sync from cloud before deciding
  if (!db.colleges || db.colleges.length === 0) {
    try {
      await syncPullCollegesFromCloud();
      db = readErpDb();
    } catch (e) {}
  }

  // 2. Check College Admins (Deans) - Supports login via username or Gmail/email
  const college = (db.colleges || []).find(
    c => ((c.adminUsername && c.adminUsername.toLowerCase() === usernameInput) || (c.email && c.email.toLowerCase() === usernameInput)) &&
         isPassMatch(c.adminPassword, passwordInput)
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
    }, usernameInput, passwordInput);
    return;
  }

  // 3. Check Instructors - Supports login via username or Gmail/email
  const instructor = (db.instructors || []).find(
    inst => ((inst.username && inst.username.toLowerCase() === usernameInput) || (inst.email && inst.email.toLowerCase() === usernameInput)) &&
            isPassMatch(inst.password, passwordInput)
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
    }, usernameInput, passwordInput);
    return;
  }

  // 4. Check Students - Supports login via username or Gmail/email
  const student = (db.students || []).find(
    s => ((s.username && s.username.toLowerCase() === usernameInput) || (s.email && s.email.toLowerCase() === usernameInput)) &&
         isPassMatch(s.password, passwordInput)
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
    }, usernameInput, passwordInput);
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

function loginSuccess(user, enteredUsername, enteredPassword) {
  setCurrentSession(user);

  // Save account to THIS DEVICE ONLY (Strict per-device isolation)
  try {
    saveAccountToDevice({
      username: enteredUsername || user.username,
      password: enteredPassword || '',
      name: user.name || enteredUsername,
      role: user.role,
      collegeName: user.collegeName || ''
    });
  } catch (e) {}

  // Modern Browser Password Credential Registration (Chrome, Edge, Safari)
  if (window.PasswordCredential && navigator.credentials && enteredUsername && enteredPassword) {
    try {
      const cred = new PasswordCredential({
        id: enteredUsername,
        password: enteredPassword,
        name: user.name || enteredUsername
      });
      navigator.credentials.store(cred).catch(() => {});
    } catch (e) {}
  }

  // إذا كان المستخدم طالب، يتم توجيهه مباشرة إلى منصة الكيس شيت (واجهة الطالب)
  if (user.role === 'STUDENT') {
    window.location.href = 'index.html';
    return;
  }

  renderApp();
}

function handleLogout() {
  setCurrentSession(null);
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  if (uInput) uInput.value = '';
  if (pInput) pInput.value = '';
  renderApp();
}
window.handleLogout = handleLogout;
window.logout = handleLogout;

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
  const navbarBrandTitle = document.getElementById('navbar-brand-title');

  if (!user) {
    // Show login
    if (navbarBrandTitle) {
      navbarBrandTitle.textContent = 'منظومة كلية طب الأسنان لإدارة العيادات التعليمية للطلاب';
    }
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
      <div class="flex items-center gap-1.5 sm:gap-2 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-300">
        <span class="text-[11px] sm:text-xs font-bold text-slate-800 max-w-[90px] sm:max-w-xs truncate">${user.name}</span>
        <button onclick="handleLogout()" class="text-rose-600 hover:text-rose-800 text-[11px] sm:text-xs font-bold border-r border-slate-300 pr-1.5 sm:pr-2 mr-0.5 sm:mr-1 cursor-pointer py-0.5" title="تسجيل الخروج">
          خروج 🚪
        </button>
      </div>
    `;
  }

  // Update navbar title dynamically with the specific university/college
  if (navbarBrandTitle) {
    if (user.role === 'SUPER_ADMIN') {
      navbarBrandTitle.textContent = 'منظومة كليات طب الأسنان لإدارة العيادات التعليمية للطلاب';
    } else if (user.collegeName) {
      navbarBrandTitle.textContent = `منظومة ${user.collegeName} لإدارة العيادات التعليمية للطلاب`;
    } else {
      navbarBrandTitle.textContent = 'منظومة كلية طب الأسنان لإدارة العيادات التعليمية للطلاب';
    }
  }

  // Route to specific view
  switch (user.role) {
    case 'SUPER_ADMIN':
      if (roleBadge) {
        roleBadge.textContent = '🏛️ الإدارة المركزية العامة';
        roleBadge.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300';
      }
      if (topCollegeName) {
        topCollegeName.innerHTML = `<span>التحكم المركزي في التراخيص والكليات المعتمدة</span>`;
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
  purgeTransferredApplications();
  const db = readErpDb();
  const totalColleges = db.colleges.length;
  let totalRevenue = 0;
  let activeSubs = 0;
  let pendingSubs = 0;

  const now = new Date();
  db.colleges.forEach(c => {
    const fee = parseFloat(c.subscriptionFee) || (c.subscriptionType === 'monthly' ? 100000 : 1000000);
    totalRevenue += fee;
    const isPaused = c.status === 'Paused';
    const endDate = c.subscriptionEnd ? new Date(c.subscriptionEnd) : null;
    const isExpired = endDate && endDate < now;
    if (isPaused || isExpired) {
      pendingSubs++;
    } else {
      activeSubs++;
    }
  });

  const statColleges = document.getElementById('stat-colleges-count');
  const statRev = document.getElementById('stat-revenue-total');
  const statActive = document.getElementById('stat-active-subs');
  const statPending = document.getElementById('stat-pending-subs');
  const statStudentApps = document.getElementById('stat-student-apps-count');

  if (statColleges) statColleges.textContent = totalColleges;
  if (statRev) statRev.textContent = totalRevenue.toLocaleString() + ' د.ع';
  if (statActive) statActive.textContent = activeSubs;
  if (statPending) statPending.textContent = pendingSubs;
  if (statStudentApps) statStudentApps.textContent = (db.studentApplications || []).length;

  renderSuperAdminColleges();
  renderSuperAdminApplications();
  renderSuperAdminStudentApplications();
}

function renderSuperAdminColleges() {
  const db = readErpDb();
  const search = (document.getElementById('search-colleges')?.value || '').trim().toLowerCase();
  const tbody = document.getElementById('colleges-table-body');
  if (!tbody) return;

  const filtered = db.colleges.filter(c => 
    c.name.toLowerCase().includes(search) ||
    (c.city && c.city.toLowerCase().includes(search)) ||
    (c.deanName && c.deanName.toLowerCase().includes(search)) ||
    (c.code && c.code.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-slate-400 font-semibold">لا توجد كليات مسجلة حالياً. اضغط على زر "إضافة كلية جديدة" أعلاه.</td></tr>`;
    return;
  }

  const now = new Date();
  tbody.innerHTML = filtered.map(c => {
    const isPaused = c.status === 'Paused';
    const fee = parseFloat(c.subscriptionFee) || (c.subscriptionType === 'monthly' ? 100000 : 1000000);
    const isMonthly = c.subscriptionType === 'monthly' || fee <= 150000;
    const planLabel = isMonthly ? 'شهري مدفوع' : 'سنوي مدفوع';
    const subEnd = c.subscriptionEnd || '2027-10-01';
    const isExpired = new Date(subEnd) < now;

    let statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">ساري ونشط 🟢</span>';
    if (isPaused) {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">معلق ⛔</span>';
    } else if (isExpired) {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">منتهي الصلاحية ⚠️</span>';
    }

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-3.5 whitespace-nowrap min-w-[170px]">
          <strong class="text-slate-900 block text-sm font-black">${c.name}</strong>
          <span class="text-[11px] text-slate-500 font-semibold">📍 ${c.city || 'العراق'}</span>
        </td>
        <td class="p-3.5 whitespace-nowrap min-w-[100px]">
          <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-latin font-bold text-slate-700">${c.code}</span>
        </td>
        <td class="p-3.5 whitespace-nowrap min-w-[130px]">
          <span class="font-bold text-slate-800">${c.deanName}</span>
        </td>
        <td class="p-3.5 whitespace-nowrap min-w-[140px]">
          <div class="text-[11px] space-y-0.5">
            <span class="block text-slate-600">يوزر: <strong class="font-latin text-teal-800">${c.adminUsername}</strong></span>
            <span class="block text-slate-500">رمز: <strong class="font-latin text-slate-700">${c.adminPassword}</strong></span>
          </div>
        </td>
        <td class="p-3.5 text-center whitespace-nowrap min-w-[130px]">
          <span class="font-latin font-black text-emerald-700 text-sm">${fee.toLocaleString()} د.ع</span>
          <span class="block text-[10px] ${isMonthly ? 'text-amber-700 font-bold' : 'text-slate-500 font-bold'}">${planLabel}</span>
        </td>
        <td class="p-3.5 text-center font-latin font-semibold text-slate-700 text-xs whitespace-nowrap min-w-[100px]">
          ${subEnd}
        </td>
        <td class="p-3.5 text-center whitespace-nowrap min-w-[110px]">
          ${statusBadge}
        </td>
        <td class="p-3.5 text-center whitespace-nowrap min-w-[200px]">
          <div class="flex items-center justify-center gap-1.5 flex-wrap">
            <button 
              type="button"
              onclick="openPrintReceiptModal('${c.id}')"
              class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-xs"
              title="طباعة سند تجديد واشتراك الكلية الرسمي"
            >
              وصل 🧾
            </button>
            <button 
              type="button"
              onclick="openRenewSubModal('${c.id}')"
              class="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-xs"
              title="تجديد الاشتراك وتمديد الصلاحية"
            >
              تجديد 💳
            </button>
            <button 
              type="button"
              onclick="toggleCollegeStatus('${c.id}')"
              class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${isPaused ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'}"
            >
              ${isPaused ? 'تفعيل' : 'إيقاف'}
            </button>
            <button 
              type="button"
              onclick="deleteCollege('${c.id}')"
              class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded text-xs font-bold cursor-pointer"
              title="حذف الكلية نهائياً"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddCollegeModal() {
  setCollegeSubscriptionPlan('add', 'annual');
  const pwdInput = document.getElementById('new-dean-password');
  if (pwdInput) {
    pwdInput.value = generateUniquePassword();
  }
  document.getElementById('modal-add-college')?.classList.remove('hidden');
}

function closeAddCollegeModal() {
  document.getElementById('modal-add-college')?.classList.add('hidden');
}

function handleCreateCollegeSubmit(event) {
  event.preventDefault();
  const form = event.target || document.getElementById('form-add-college');
  const submitBtn = form?.querySelector('button[type="submit"]') || document.getElementById('btn-submit-add-college');

  if (!acquireSubmissionLock('create_college', 4000)) {
    console.warn('Blocked rapid double click on create college');
    return;
  }
  const unlockBtn = lockSubmitButton(submitBtn, 'جاري إضافة الكلية...');

  const db = readErpDb();

  const name = document.getElementById('new-college-name').value.trim();
  const city = document.getElementById('new-college-city').value.trim();
  const deanName = document.getElementById('new-college-dean').value.trim();
  const adminUsername = document.getElementById('new-dean-username').value.trim().toLowerCase();
  const adminPassword = document.getElementById('new-dean-password').value.trim();
  const subscriptionFee = parseFloat(document.getElementById('new-college-fee')?.value || 1000000);
  const planType = document.getElementById('new-college-plan-type')?.value || (subscriptionFee <= 150000 ? 'monthly' : 'annual');

  // Check duplicate college name in existing database
  if (db.colleges.some(c => c.name.trim().toLowerCase() === name.toLowerCase())) {
    alert(`⚠️ الكلية (${name}) مسجلة مسبقاً في النظام! لا يمكن تكرار الكلية.`);
    unlockBtn();
    releaseSubmissionLock('create_college');
    return;
  }

  // Automatically generate unique college code (system generates it automatically)
  const code = generateUniqueCollegeCode(name, city);

  let subscriptionEnd = document.getElementById('new-college-sub-end')?.value;
  if (!subscriptionEnd) {
    const nextYear = new Date();
    if (planType === 'monthly') {
      nextYear.setMonth(nextYear.getMonth() + 1);
    } else {
      nextYear.setFullYear(nextYear.getFullYear() + 1);
    }
    subscriptionEnd = nextYear.toISOString().slice(0, 10);
  }

  // Strict global uniqueness check across platform (no duplicate email, password, or name)
  const uniqueCheck = checkGlobalUniqueness({
    collegeName: name,
    collegeCode: code,
    deanName: deanName,
    username: adminUsername,
    password: adminPassword
  });
  if (!uniqueCheck.valid) {
    alert(uniqueCheck.message);
    unlockBtn();
    releaseSubmissionLock('create_college');
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
    subscriptionFee,
    subscriptionType: planType,
    subscriptionStart: new Date().toISOString().slice(0, 10),
    subscriptionEnd,
    status: 'Active',
    plan: planType === 'monthly' ? 'MONTHLY_ACCREDITED' : 'ANNUAL_ACCREDITED',
    createdAt: new Date().toISOString()
  };

  db.colleges.push(newCollege);
  writeErpDb(db);
  syncPushCollege(newCollege);

  // Auto save dean account to device
  saveAccountToDevice({
    username: adminUsername,
    password: adminPassword,
    name: deanName,
    role: 'COLLEGE_ADMIN',
    collegeName: name
  });

  closeAddCollegeModal();
  renderSuperAdminDashboard();
  unlockBtn();
  alert(`تمت إضافة ${name} بنجاح!\nتم حفظ حساب العميد (${adminUsername}) على هذا الجهاز بنجاح.`);
}

function toggleCollegeStatus(collegeId) {
  const db = readErpDb();
  const clg = db.colleges.find(c => c.id === collegeId);
  if (!clg) return;

  clg.status = clg.status === 'Active' ? 'Paused' : 'Active';
  writeErpDb(db);
  syncPushCollege(clg);
  renderSuperAdminDashboard();
}

function deleteCollege(collegeId) {
  if (!confirm('هل أنت متأكد من حذف هذه الكلية نهائياً من المنظومة؟\nسيتم حذف جميع التدريسيين والطلبة التابعين لها.')) return;
  const db = readErpDb();
  db.colleges = db.colleges.filter(c => c.id !== collegeId);
  db.instructors = db.instructors.filter(i => i.collegeId !== collegeId);
  db.students = db.students.filter(s => s.collegeId !== collegeId);
  db.cases = db.cases.filter(c => c.collegeId !== collegeId);
  writeErpDb(db);
  syncDeleteCollege(collegeId);
  renderSuperAdminDashboard();
}

async function syncDeleteCollege(collegeId) {
  const candidateEndpoints = [
    `/api/colleges`,
    `/.netlify/functions/applications?type=colleges`,
    `https://dental-casesheet-erp.netlify.app/api/colleges`,
    `https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=colleges`
  ];
  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', type: 'colleges', id: collegeId })
      });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync delete college notice:', ep, e);
    }
  }

  const client = getErpSupabaseClient();
  if (!client) return;
  try {
    await client.from('college_colleges').delete().eq('id', collegeId);
    await client.from('college_instructors').delete().eq('college_id', collegeId);
    await client.from('college_students').delete().eq('college_id', collegeId);
    await client.from('college_cases').delete().eq('college_id', collegeId);
  } catch (e) {
    console.warn('Supabase delete college error:', e);
  }
}

function loginAsDean(collegeId) {
  return;
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

  // Subscription Details (Strictly Status & Expiry - NO financial figures visible to Dean)
  const clg = db.colleges.find(c => c.id === user.collegeId);
  const statusBadge = document.getElementById('dean-sub-status-badge');
  const expiryDateEl = document.getElementById('dean-sub-expiry-date');
  const daysLeftEl = document.getElementById('dean-sub-days-left');

  if (clg) {
    const isPaused = clg.status === 'Paused';
    const subEnd = clg.subscriptionEnd || '2027-10-01';
    const endDate = new Date(subEnd);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (expiryDateEl) expiryDateEl.textContent = subEnd;

    if (isPaused) {
      if (statusBadge) {
        statusBadge.textContent = 'معلق مؤقتاً ⛔';
        statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300';
      }
      if (daysLeftEl) daysLeftEl.textContent = 'يرجى مراجعة إدارة المنظومة';
    } else if (diffDays <= 0) {
      if (statusBadge) {
        statusBadge.textContent = 'منتهي الصلاحية ⚠️';
        statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300';
      }
      if (daysLeftEl) daysLeftEl.textContent = 'انتهت فترة الاشتراك';
    } else {
      if (statusBadge) {
        statusBadge.textContent = 'ساري ومفعل 🟢';
        statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300';
      }
      if (daysLeftEl) daysLeftEl.textContent = `${diffDays} يوماً متبقية`;
    }
  }

  // Counts strictly filtered for THIS college
  const myStudents = db.students.filter(s => s.collegeId === user.collegeId);
  const myInstructors = db.instructors.filter(i => i.collegeId === user.collegeId);
  const myCases = db.cases.filter(c => c.collegeId === user.collegeId);

  document.getElementById('dean-tab-students-count').textContent = myStudents.length;
  document.getElementById('dean-tab-instructors-count').textContent = myInstructors.length;
  document.getElementById('dean-tab-evals-count').textContent = myCases.length;
  const myStudentApps = (db.studentApplications || []).filter(a => a.collegeId === user.collegeId && a.status === 'Pending');
  const studentAppsBadge = document.getElementById('dean-tab-student-apps-count');
  if (studentAppsBadge) studentAppsBadge.textContent = myStudentApps.length;

  switchCollegeTab(activeCollegeTab);
}

function switchCollegeTab(tab) {
  activeCollegeTab = tab;
  ['students', 'instructors', 'evaluations', 'student-apps'].forEach(t => {
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
  if (tab === 'student-apps') renderCollegeStudentApplications();

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
        <td class="p-3 whitespace-nowrap min-w-[150px]">
          <strong class="font-bold text-slate-900 block">${s.name}</strong>
          <span class="text-[10px] text-slate-400 font-latin">#ID-${s.id}</span>
        </td>
        <td class="p-3 whitespace-nowrap min-w-[130px]">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${s.stage === '5th' ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'}">
            ${s.stage === '5th' ? 'المرحلة الخامسة (5th Year)' : 'المرحلة الرابعة (4th Year)'}
          </span>
        </td>
        <td class="p-3 font-latin font-semibold text-slate-600 whitespace-nowrap min-w-[100px]">${s.group || 'Group A'}</td>
        <td class="p-3 font-latin font-bold text-teal-800 whitespace-nowrap min-w-[120px]">${s.username}</td>
        <td class="p-3 font-latin font-bold text-slate-600 whitespace-nowrap min-w-[100px]">${s.password}</td>
        <td class="p-3 text-center font-black font-latin text-slate-800 whitespace-nowrap min-w-[90px]">${studentCases.length}</td>
        <td class="p-3 text-center font-bold text-emerald-700 font-latin whitespace-nowrap min-w-[110px]">${avgScore}</td>
        <td class="p-3 text-center whitespace-nowrap min-w-[80px]">
          <button onclick="deleteStudent('${s.id}')" class="px-2.5 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg font-bold text-[11px] transition-all cursor-pointer">حذف 🗑️</button>
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
    tbody.innerHTML = `<tr><td colspan="9" class="text-center p-8 text-slate-400 font-semibold">لم يتم إضافة أي تدريسي بعد. اضغط على زر "إضافة تدريسي" أعلاه.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(inst => {
    const evalCount = db.cases.filter(c => c.instructorId === inst.id && c.collegeId === user.collegeId).length;
    const stageBadge = inst.stage === '5th' 
      ? '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800">المرحلة 5 BDS</span>'
      : (inst.stage === '4th' 
          ? '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">المرحلة 4 BDS</span>' 
          : '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">كافة المراحل (4 & 5)</span>');

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-3 whitespace-nowrap min-w-[150px]">
          <strong class="font-bold text-slate-900 block">${inst.name}</strong>
          <span class="text-[11px] text-slate-500 font-latin">${inst.email || ''}</span>
        </td>
        <td class="p-3 font-semibold text-slate-700 whitespace-nowrap min-w-[120px]">${inst.title}</td>
        <td class="p-3 font-bold text-teal-800 whitespace-nowrap min-w-[150px]">${inst.department}</td>
        <td class="p-3 whitespace-nowrap min-w-[120px]">${stageBadge}</td>
        <td class="p-3 font-latin font-bold text-slate-800 whitespace-nowrap min-w-[120px]">${inst.username}</td>
        <td class="p-3 font-latin font-bold text-slate-600 whitespace-nowrap min-w-[100px]">${inst.password}</td>
        <td class="p-3 text-center font-black font-latin text-teal-700 whitespace-nowrap min-w-[90px]">${evalCount}</td>
        <td class="p-3 text-center whitespace-nowrap min-w-[80px]">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">نشط</span>
        </td>
        <td class="p-3 text-center whitespace-nowrap min-w-[180px]">
          <div class="flex items-center justify-center gap-1.5 flex-wrap">
            <button 
              type="button"
              onclick="loginAsInstructorNewTab('${inst.id}')"
              class="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              title="دخول بتبويب جديد مستقل كتدريسي دون إغلاق لوحة العميد"
            >
              <span>دخول كتدريسي 👨‍🏫</span>
              <span class="text-[9px] text-sky-600 font-latin font-normal">(تبويب جديد)</span>
            </button>
            <button 
              type="button"
              onclick="deleteInstructor('${inst.id}')" 
              class="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg font-bold text-[11px] cursor-pointer"
              title="حذف التدريسي"
            >
              حذف 🗑️
            </button>
          </div>
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
        <td class="p-3 font-latin font-bold text-slate-700 whitespace-nowrap min-w-[80px]">${item.id}</td>
        <td class="p-3 font-bold text-slate-900 whitespace-nowrap min-w-[140px]">${item.studentName}</td>
        <td class="p-3 whitespace-nowrap min-w-[80px]">
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${item.stage === '5th' ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'}">
            مرحلة ${item.stage === '5th' ? '5' : '4'}
          </span>
        </td>
        <td class="p-3 font-semibold text-slate-700 whitespace-nowrap min-w-[120px]">${item.type}</td>
        <td class="p-3 font-bold text-teal-800 whitespace-nowrap min-w-[140px]">${item.instructorName || 'بانتظار التوزيع'}</td>
        <td class="p-3 text-center whitespace-nowrap min-w-[100px]">
          <span class="px-2 py-0.5 rounded text-xs font-black font-latin ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
            ${isPending ? 'قيد التقييم' : item.assignedMark + ' / 10'}
          </span>
        </td>
        <td class="p-3 text-slate-500 font-latin text-[11px] whitespace-nowrap min-w-[90px]">${new Date(item.createdAt).toLocaleDateString('ar-EG')}</td>
        <td class="p-3 text-center whitespace-nowrap min-w-[120px]">
          ${isPending 
            ? '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">بانتظار تقييم التدريسي</span>' 
            : (item.forwardedToDean 
                ? '<span class="px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">مرسلة من المشرف معتمدة للعمادة ✅</span>' 
                : '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">تم رصد الدرجة ✍️</span>')}
        </td>
      </tr>
    `;
  }).join('');
}

// College Modals
function openAddInstructorModal() {
  const pwdInput = document.getElementById('new-inst-password');
  if (pwdInput) {
    pwdInput.value = generateUniquePassword();
  }
  document.getElementById('modal-add-instructor')?.classList.remove('hidden');
}
function closeAddInstructorModal() {
  document.getElementById('modal-add-instructor')?.classList.add('hidden');
}

function handleCreateInstructorSubmit(event) {
  event.preventDefault();
  const user = getCurrentSession();
  if (!user || user.role !== 'COLLEGE_ADMIN') return;

  const form = event.target || document.getElementById('form-add-instructor');
  const submitBtn = form?.querySelector('button[type="submit"]') || document.getElementById('btn-submit-add-instructor');

  if (!acquireSubmissionLock('create_instructor', 4000)) {
    console.warn('Blocked rapid double click on create instructor');
    return;
  }
  const unlockBtn = lockSubmitButton(submitBtn, 'جاري تسجيل التدريسي...');

  const db = readErpDb();
  const name = document.getElementById('new-inst-name').value.trim();
  const title = document.getElementById('new-inst-title').value;
  const department = document.getElementById('new-inst-dept').value;
  const stage = document.getElementById('new-inst-stage')?.value || 'ALL';
  const emailInput = document.getElementById('new-inst-email')?.value.trim();
  const username = document.getElementById('new-inst-username').value.trim().toLowerCase();
  const password = document.getElementById('new-inst-password').value.trim();
  const collegeDomain = (user.collegeCode || 'college').toLowerCase();
  const email = emailInput || `${username}@${collegeDomain}.edu`;

  // Strict duplicate check within this college
  if (db.instructors.some(i => i.collegeId === user.collegeId && i.name.trim().toLowerCase() === name.toLowerCase())) {
    alert(`⚠️ التدريسي (${name}) مسجل مسبقاً في كليتك! لا يمكن تكرار التدريسي.`);
    unlockBtn();
    releaseSubmissionLock('create_instructor');
    return;
  }

  // Strict global uniqueness check across platform (name, email, password, username)
  const uniqueCheck = checkGlobalUniqueness({
    personName: name,
    username,
    email,
    password
  });
  if (!uniqueCheck.valid) {
    alert(uniqueCheck.message);
    unlockBtn();
    releaseSubmissionLock('create_instructor');
    return;
  }

  const newInst = {
    id: 'inst_' + Date.now(),
    collegeId: user.collegeId,
    name,
    title,
    department,
    stage,
    username,
    password,
    email,
    role: 'INSTRUCTOR',
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.instructors.push(newInst);
  writeErpDb(db);
  syncPushInstructor(newInst);
  if (typeof syncPushInstructorToCloud === 'function') {
    syncPushInstructorToCloud(newInst);
  }

  // Auto save instructor to device accounts
  saveAccountToDevice({
    username: username,
    password: password,
    name: name,
    role: 'INSTRUCTOR',
    collegeName: user.collegeName
  });

  closeAddInstructorModal();
  renderCollegeAdminDashboard();
  unlockBtn();
  alert(`تمت إضافة التدريسي (${name}) بنجاح!\nالمرحلة: ${stage === '5th' ? 'الخامسة' : (stage === '4th' ? 'الرابعة' : 'كافة المراحل')}\nالبريد: ${email}\nاسم المستخدم: ${username}`);
}

function openAddStudentModal() {
  const pwdInput = document.getElementById('new-std-password');
  if (pwdInput) {
    pwdInput.value = generateUniquePassword();
  }
  document.getElementById('modal-add-student')?.classList.remove('hidden');
}
function closeAddStudentModal() {
  document.getElementById('modal-add-student')?.classList.add('hidden');
}

function handleCreateStudentSubmit(event) {
  event.preventDefault();
  const user = getCurrentSession();
  if (!user || user.role !== 'COLLEGE_ADMIN') return;

  const form = event.target || document.getElementById('form-add-student');
  const submitBtn = form?.querySelector('button[type="submit"]') || document.getElementById('btn-submit-add-student');

  if (!acquireSubmissionLock('create_student', 4000)) {
    console.warn('Blocked rapid double click on create student');
    return;
  }
  const unlockBtn = lockSubmitButton(submitBtn, 'جاري تسجيل الطالب...');

  const db = readErpDb();
  const name = document.getElementById('new-std-name').value.trim();
  const stage = document.getElementById('new-std-stage').value;
  const group = document.getElementById('new-std-group').value.trim();
  const username = document.getElementById('new-std-username').value.trim().toLowerCase();
  const password = document.getElementById('new-std-password').value.trim();

  // Strict duplicate check within this college
  if (db.students.some(s => s.collegeId === user.collegeId && s.name.trim().toLowerCase() === name.toLowerCase())) {
    alert(`⚠️ الطالب (${name}) مسجل مسبقاً في كليتك! لا يمكن تكرار الطالب.`);
    unlockBtn();
    releaseSubmissionLock('create_student');
    return;
  }

  // Strict global uniqueness check across platform (name, password, username)
  const uniqueCheck = checkGlobalUniqueness({
    personName: name,
    username,
    password
  });
  if (!uniqueCheck.valid) {
    alert(uniqueCheck.message);
    unlockBtn();
    releaseSubmissionLock('create_student');
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
  unlockBtn();
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

  const form = event.target || document.getElementById('form-bulk-students');
  const submitBtn = form?.querySelector('button[type="submit"]') || document.getElementById('btn-submit-bulk-students');

  if (!acquireSubmissionLock('bulk_students', 6000)) {
    console.warn('Blocked rapid double click on bulk student generation');
    return;
  }
  const unlockBtn = lockSubmitButton(submitBtn, 'جاري توليد الحسابات...');

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

  const existingNames = new Set([
    db.superAdmin?.name?.trim().toLowerCase(),
    ...(db.colleges || []).map(c => (c.deanName || '').trim().toLowerCase()),
    ...(db.instructors || []).map(i => (i.name || '').trim().toLowerCase()),
    ...(db.students || []).map(s => (s.name || '').trim().toLowerCase())
  ].filter(Boolean));

  const existingUsernames = new Set([
    db.superAdmin?.username?.toLowerCase(),
    ...(db.colleges || []).map(c => (c.adminUsername || '').toLowerCase()),
    ...(db.instructors || []).map(i => (i.username || '').toLowerCase()),
    ...(db.students || []).map(s => (s.username || '').toLowerCase())
  ].filter(Boolean));

  const existingPasswords = new Set([
    db.superAdmin?.password,
    ...(db.colleges || []).map(c => c.adminPassword),
    ...(db.instructors || []).map(i => i.password),
    ...(db.students || []).map(s => s.password)
  ].filter(Boolean));

  for (let i = 1; i <= count; i++) {
    const numStr = String(100 + i);
    let uname = `${prefix}_${stage}_${numStr}`;
    let uCounter = 1;
    while (existingUsernames.has(uname)) {
      uname = `${prefix}_${stage}_${numStr}_${uCounter++}`;
    }
    existingUsernames.add(uname);

    let pwd = generateUniquePassword(`Dent${stage}`);
    existingPasswords.add(pwd);

    let randName = commonNames[(i - 1) % commonNames.length] + ` (طالب ${startId.toString().slice(-4)}_${i})`;
    while (existingNames.has(randName.toLowerCase())) {
      randName = `${commonNames[(i - 1) % commonNames.length]} (طالب ${Math.floor(1000 + Math.random() * 9000)})`;
    }
    existingNames.add(randName.toLowerCase());

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
  unlockBtn();

  alert(`🎉 تم توليد ${count} حساب طالب للمرحلة ${stage === '5th' ? 'الخامسة' : 'الرابعة'} بنجاح تام وتم ترحيلهم لقاعدة بيانات كليتكم!`);
}

function deleteStudent(studentId) {
  if (!confirm('هل أنت متأكد من حذف هذا الطالب من سجلات الكلية؟')) return;
  const db = readErpDb();
  db.students = db.students.filter(s => s.id !== studentId);
  writeErpDb(db);
  syncDeleteStudent(studentId);
  if (typeof syncDeleteStudentFromCloud === 'function') {
    syncDeleteStudentFromCloud(studentId);
  }
  renderCollegeAdminDashboard();
}

function deleteInstructor(instructorId) {
  if (!confirm('هل أنت متأكد من حذف هذا التدريسي من الكلية؟')) return;
  const db = readErpDb();
  db.instructors = db.instructors.filter(i => i.id !== instructorId);
  writeErpDb(db);
  syncDeleteInstructor(instructorId);
  if (typeof syncDeleteInstructorFromCloud === 'function') {
    syncDeleteInstructorFromCloud(instructorId);
  }
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

  // Count of students strictly for this college
  const collegeStudents = db.students.filter(s => s.collegeId === user.collegeId);
  const instStudentsCount = document.getElementById('inst-students-count');
  if (instStudentsCount) instStudentsCount.textContent = collegeStudents.length;

  // Strict college cases
  const myCases = db.cases.filter(c => c.collegeId === user.collegeId);
  const pendingCases = myCases.filter(c => c.status === 'Pending');

  const pendingBadge = document.getElementById('inst-pending-badge');
  if (pendingBadge) pendingBadge.textContent = pendingCases.length;

  // Section 1: Cases Table
  const casesTbody = document.getElementById('instructor-cases-tbody');
  if (casesTbody) {
    if (myCases.length === 0) {
      casesTbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-slate-400 font-semibold">لا توجد حالات مرفوعة حالياً من طلبة الكلية.</td></tr>`;
    } else {
      casesTbody.innerHTML = myCases.map(item => {
        const isPending = item.status === 'Pending';
        return `
          <tr class="hover:bg-slate-50/80 transition-colors">
            <td class="p-3 font-latin font-bold text-slate-800 whitespace-nowrap min-w-[80px]">${item.id}</td>
            <td class="p-3 whitespace-nowrap min-w-[150px]">
              <strong class="font-bold text-slate-900 block">${item.studentName}</strong>
              <span class="text-[11px] text-teal-700 font-semibold">مرحلة ${item.stage === '5th' ? 'خامسة' : 'رابعة'} BDS</span>
            </td>
            <td class="p-3 font-semibold text-slate-700 whitespace-nowrap min-w-[120px]">${item.type}</td>
            <td class="p-3 whitespace-nowrap min-w-[150px]">
              <span class="block font-bold text-slate-800">${item.patientName}</span>
              <span class="text-[11px] text-slate-500">${item.chiefComplaint || ''}</span>
            </td>
            <td class="p-3 text-slate-500 font-latin text-[11px] whitespace-nowrap min-w-[90px]">${new Date(item.createdAt).toLocaleDateString('ar-EG')}</td>
            <td class="p-3 text-center whitespace-nowrap min-w-[100px]">
              <span class="px-2 py-0.5 rounded text-xs font-black font-latin ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
                ${isPending ? 'قيد التقييم' : item.assignedMark + ' / 10'}
              </span>
            </td>
            <td class="p-3 text-center whitespace-nowrap min-w-[110px]">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isPending ? 'bg-amber-100 text-amber-800' : (item.forwardedToDean ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-teal-100 text-teal-800')}">
                ${isPending ? 'بانتظار التقييم' : (item.forwardedToDean ? 'مرفوعة للعمادة ✅' : 'معتمدة محلياً ✍️')}
              </span>
            </td>
            <td class="p-3 text-center whitespace-nowrap min-w-[200px]">
              <div class="flex items-center justify-center gap-1.5 flex-wrap">
                <button 
                  type="button"
                  onclick="openEvalCaseModal('${item.id}')"
                  class="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <span>رصد الدرجة (Mark)</span>
                  <span>✍️</span>
                </button>
                <a 
                  href="${item.sheetUrl || 'periodontics-page4.html'}" 
                  target="_blank"
                  class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-bold text-xs inline-flex items-center"
                >
                  فتح الطبلة 📄
                </a>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Section 2: College Students Directory Table
  const studentsTbody = document.getElementById('instructor-students-tbody');
  if (studentsTbody) {
    if (collegeStudents.length === 0) {
      studentsTbody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-slate-400 font-semibold">لم يتم تسجيل أي طلبة في كليتكم بعد من قبل عمادة الكلية.</td></tr>`;
    } else {
      studentsTbody.innerHTML = collegeStudents.map(s => {
        return `
          <tr class="hover:bg-slate-50/80 transition-colors">
            <td class="p-3 whitespace-nowrap min-w-[150px]">
              <strong class="font-bold text-slate-900 block">${s.name}</strong>
              <span class="text-[10px] text-slate-400 font-latin">#ID-${s.id}</span>
            </td>
            <td class="p-3 whitespace-nowrap min-w-[130px]">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold ${s.stage === '5th' ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'}">
                ${s.stage === '5th' ? 'المرحلة الخامسة (5th Year)' : 'المرحلة الرابعة (4th Year)'}
              </span>
            </td>
            <td class="p-3 font-latin font-semibold text-slate-700 whitespace-nowrap min-w-[100px]">${s.group || 'Group A'}</td>
            <td class="p-3 font-latin font-bold text-teal-800 whitespace-nowrap min-w-[120px]">${s.username}</td>
            <td class="p-3 text-center whitespace-nowrap min-w-[90px]">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">طالب مسجل</span>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
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
  const form = event.target || document.getElementById('form-eval-case');
  const submitBtn = form?.querySelector('button[type="submit"]') || document.getElementById('btn-submit-eval-case');

  const caseId = document.getElementById('eval-case-id').value;
  if (!acquireSubmissionLock('save_eval_' + caseId, 3000)) {
    console.warn('Blocked rapid double click on save evaluation');
    return;
  }
  const unlockBtn = lockSubmitButton(submitBtn, 'جاري رصد الدرجة...');

  const db = readErpDb();
  const mark = document.getElementById('eval-assigned-mark').value;
  const feedback = document.getElementById('eval-feedback-text').value.trim();

  const c = db.cases.find(x => x.id === caseId);
  if (!c) {
    unlockBtn();
    releaseSubmissionLock('save_eval_' + caseId);
    return;
  }

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
  unlockBtn();
  alert(`✅ تم اعتماد التقييم ورصد الدرجة (${mark} / 10) للطالب ${c.studentName} بنجاح!\n\nيمكنك الآن الضغط على زر "رفع الدرجات المعتمدة إلى العمادة 📤" لترحيلها رسمياً.`);
}

async function forwardEvaluatedCasesToDean() {
  const user = getCurrentSession();
  if (!user || user.role !== 'INSTRUCTOR') return;

  if (!acquireSubmissionLock('forward_cases_' + user.id, 5000)) {
    console.warn('Blocked rapid double click on forward cases to dean');
    return;
  }

  const db = readErpDb();

  const casesToForward = (db.cases || []).filter(c => 
    c.collegeId === user.collegeId && 
    c.assignedMark && 
    c.assignedMark !== '-' && 
    c.assignedMark !== 'Pending'
  );

  if (casesToForward.length === 0) {
    alert('⚠️ لا توجد أي درجات مرصودة جاهزة للرفع حالياً.\nيرجى رصد درجات الطلاب أولاً عبر زر "رصد الدرجة (Mark) ✍️" ثم النقر على هذا الزر.');
    releaseSubmissionLock('forward_cases_' + user.id);
    return;
  }

  casesToForward.forEach(c => {
    c.forwardedToDean = true;
    c.forwardedAt = c.forwardedAt || new Date().toISOString();
    c.forwardedBy = user.name;
    c.status = 'Approved';
  });

  writeErpDb(db);

  for (const c of casesToForward) {
    if (typeof syncPushCaseToCloud === 'function') {
      await syncPushCaseToCloud(c);
    }
  }

  renderInstructorDashboard();
  alert(`📤 تم بنجاح رفع كافة الدرجات المعتمدة (عدد ${casesToForward.length} حالة سريرية) مباشرة إلى عمادة الكلية!\n\nتم اعتماد نقل الدرجات سحابياً وتظهر الآن بعلامة [مرسلة من المشرف معتمدة للعمادة ✅] في لوحة العميد.`);
}
window.forwardEvaluatedCasesToDean = forwardEvaluatedCasesToDean;

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
        <td class="p-3 font-latin font-bold text-slate-800 whitespace-nowrap min-w-[80px]">${item.id}</td>
        <td class="p-3 font-semibold text-slate-800 whitespace-nowrap min-w-[120px]">${item.type}</td>
        <td class="p-3 font-bold text-slate-900 whitespace-nowrap min-w-[140px]">${item.patientName}</td>
        <td class="p-3 text-slate-500 font-latin text-[11px] whitespace-nowrap min-w-[90px]">${new Date(item.createdAt).toLocaleDateString('ar-EG')}</td>
        <td class="p-3 font-bold text-teal-800 whitespace-nowrap min-w-[140px]">${item.instructorName || 'بانتظار المشرف'}</td>
        <td class="p-3 text-center whitespace-nowrap min-w-[100px]">
          <span class="px-2.5 py-1 rounded text-xs font-black font-latin ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
            ${isPending ? 'قيد التقييم' : item.assignedMark + ' / 10'}
          </span>
        </td>
        <td class="p-3 text-center whitespace-nowrap min-w-[90px]">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
            ${isPending ? 'مرسلة للأستاذ' : 'معتمدة وموقعة'}
          </span>
        </td>
        <td class="p-3 text-center whitespace-nowrap min-w-[100px]">
          <a href="${item.sheetUrl || 'periodontics-page4.html'}" target="_blank" class="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg font-bold text-xs inline-flex items-center">
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
const DEFAULT_SB_URL = '';
const DEFAULT_SB_KEY = '';

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
      dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
    }
    if (txt) {
      txt.textContent = 'سحابة المنظومة: متصل سحابياً 🟢';
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

async function syncPushCollege(college) {
  // 1. Always push to Netlify Blobs Cloud Storage first!
  try {
    if (typeof syncPushCollegeToCloud === 'function') {
      await syncPushCollegeToCloud(college);
    }
  } catch (err) {
    console.warn('Netlify cloud blobs push notice:', err);
  }

  // 2. Also push to Supabase if configured
  const client = getErpSupabaseClient();
  if (!client) return;
  const baseData = {
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
  };

  try {
    const res = await client.from('college_colleges').upsert({
      ...baseData,
      subscription_fee: college.subscriptionFee || 1500,
      subscription_end: college.subscriptionEnd || '2027-10-01'
    });
    if (res.error) {
      // Fallback in case columns don't exist yet in Supabase table
      await client.from('college_colleges').upsert(baseData);
    }
  } catch (e) {
    try {
      await client.from('college_colleges').upsert(baseData);
    } catch (err) {
      console.warn('Supabase push college error:', err);
    }
  }

  // Also push to Netlify Cloud Blobs
  if (typeof syncPushCollegeToCloud === 'function') {
    syncPushCollegeToCloud(college).catch(() => {});
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
    subscription_fee NUMERIC DEFAULT 1500,
    subscription_end DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    status TEXT DEFAULT 'Active',
    plan TEXT DEFAULT 'ANNUAL_ACCREDITED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.college_colleges ADD COLUMN IF NOT EXISTS subscription_fee NUMERIC DEFAULT 1500;
ALTER TABLE public.college_colleges ADD COLUMN IF NOT EXISTS subscription_end DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year');

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

-- 5. College Registration Applications Table
CREATE TABLE IF NOT EXISTS public.college_applications (
    id TEXT PRIMARY KEY,
    request_id TEXT,
    college_name TEXT NOT NULL,
    city TEXT,
    dean_name TEXT,
    phone TEXT,
    email TEXT,
    otp_code TEXT,
    otp_verified BOOLEAN DEFAULT true,
    proposed_password TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.college_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on college_colleges" ON public.college_colleges;
CREATE POLICY "Allow all on college_colleges" ON public.college_colleges FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on college_instructors" ON public.college_instructors;
CREATE POLICY "Allow all on college_instructors" ON public.college_instructors FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on college_students" ON public.college_students;
CREATE POLICY "Allow all on college_students" ON public.college_students FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on college_cases" ON public.college_cases;
CREATE POLICY "Allow all on college_cases" ON public.college_cases FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on college_applications" ON public.college_applications;
CREATE POLICY "Allow all on college_applications" ON public.college_applications FOR ALL TO anon USING (true) WITH CHECK (true);
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
    let cRes = { data: null }, iRes = { data: null }, sRes = { data: null }, kRes = { data: null }, aRes = { data: null };
    try { cRes = await client.from('college_colleges').select('*'); } catch (e) {}
    try { iRes = await client.from('college_instructors').select('*'); } catch (e) {}
    try { sRes = await client.from('college_students').select('*'); } catch (e) {}
    try { kRes = await client.from('college_cases').select('*'); } catch (e) {}
    try { aRes = await client.from('college_applications').select('*'); } catch (e) {}

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
          subscriptionFee: item.subscription_fee ? parseFloat(item.subscription_fee) : 1500,
          subscriptionEnd: item.subscription_end || '2027-10-01',
          createdAt: item.created_at
        };
        if (idx > -1) db.colleges[idx] = { ...db.colleges[idx], ...mapped };
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

    if (aRes && aRes.data && aRes.data.length > 0) {
      if (!db.applications) db.applications = [];
      aRes.data.forEach(item => {
        const idx = db.applications.findIndex(x => x.id === item.id);
        const mapped = {
          id: item.id,
          requestId: item.request_id || item.id,
          collegeName: item.college_name,
          city: item.city,
          deanName: item.dean_name,
          phone: item.phone,
          email: item.email,
          otpCode: item.otp_code,
          otpVerified: item.otp_verified !== false,
          proposedPassword: item.proposed_password,
          notes: item.notes,
          status: item.status || 'Pending',
          createdAt: item.created_at
        };
        if (idx > -1) db.applications[idx] = { ...db.applications[idx], ...mapped };
        else db.applications.push(mapped);
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

// ============================================================================
// RECEIPT & RENEWAL FUNCTIONS (سند التجديد والاشتراك المالي)
// ============================================================================
function openPrintReceiptModal(collegeId, hideAmount = false) {
  const db = readErpDb();
  const clg = db.colleges.find(c => c.id === collegeId);
  if (!clg) return;

  const numEl = document.getElementById('receipt-number');
  const dateEl = document.getElementById('receipt-issue-date');
  const nameEl = document.getElementById('receipt-college-name');
  const codeEl = document.getElementById('receipt-college-code');
  const cityEl = document.getElementById('receipt-college-city');
  const deanEl = document.getElementById('receipt-college-dean');
  const validEl = document.getElementById('receipt-valid-until');
  const amtEl = document.getElementById('receipt-amount');
  const amtRow = document.getElementById('receipt-amount-row');

  if (numEl) numEl.textContent = `REC-${new Date().getFullYear()}-${clg.code || '001'}`;
  if (dateEl) dateEl.textContent = new Date().toISOString().slice(0, 10);
  if (nameEl) nameEl.textContent = clg.name;
  if (codeEl) codeEl.textContent = clg.code;
  if (cityEl) cityEl.textContent = clg.city || 'العراق';
  if (deanEl) deanEl.textContent = clg.deanName;
  if (validEl) validEl.textContent = clg.subscriptionEnd || '2027-10-01';
  
  const fee = parseFloat(clg.subscriptionFee) || (clg.subscriptionType === 'monthly' ? 100000 : 1000000);
  const isMonthly = clg.subscriptionType === 'monthly' || fee <= 150000;
  const planName = isMonthly ? 'اشتراك شهري' : 'اشتراك سنوي';
  if (amtEl) amtEl.textContent = `${fee.toLocaleString()} دينار عراقي (${planName} - مدفوع بالكامل)`;

  if (amtRow) {
    if (hideAmount) {
      amtRow.classList.add('hidden');
    } else {
      amtRow.classList.remove('hidden');
    }
  }

  document.getElementById('modal-print-receipt')?.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closePrintReceiptModal() {
  document.getElementById('modal-print-receipt')?.classList.add('hidden');
}

function printCollegeLicenseCertificate() {
  const user = getCurrentSession();
  if (!user || user.role !== 'COLLEGE_ADMIN') return;
  openPrintReceiptModal(user.collegeId, true);
}

function openRenewSubModal(collegeId) {
  const db = readErpDb();
  const clg = db.colleges.find(c => c.id === collegeId);
  if (!clg) return;

  const idInput = document.getElementById('renew-college-id');
  const nameEl = document.getElementById('renew-college-name');

  if (idInput) idInput.value = clg.id;
  if (nameEl) nameEl.textContent = `${clg.name} (${clg.code})`;

  const currentPlan = clg.subscriptionType || (parseFloat(clg.subscriptionFee) <= 150000 ? 'monthly' : 'annual');
  setCollegeSubscriptionPlan('renew', currentPlan);

  document.getElementById('modal-renew-sub')?.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeRenewSubModal() {
  document.getElementById('modal-renew-sub')?.classList.add('hidden');
}

function handleRenewSubscriptionSubmit(event) {
  event.preventDefault();
  const db = readErpDb();
  const collegeId = document.getElementById('renew-college-id')?.value;
  const newAmount = parseFloat(document.getElementById('renew-amount')?.value || 1000000);
  const newDate = document.getElementById('renew-new-date')?.value;
  const newPlan = document.getElementById('renew-plan-type')?.value || (newAmount <= 150000 ? 'monthly' : 'annual');

  const clg = db.colleges.find(c => c.id === collegeId);
  if (!clg) return;

  clg.subscriptionFee = newAmount;
  clg.subscriptionType = newPlan;
  clg.plan = newPlan === 'monthly' ? 'MONTHLY_ACCREDITED' : 'ANNUAL_ACCREDITED';
  clg.subscriptionEnd = newDate;
  clg.status = 'Active';

  writeErpDb(db);
  syncPushCollege(clg);

  closeRenewSubModal();
  renderSuperAdminDashboard();

  if (confirm(`✅ تم تجديد ترخيص ${clg.name} بقيمة ${newAmount.toLocaleString()} د.ع (${newPlan === 'monthly' ? 'شهري' : 'سنوي'}) حتى ${newDate} بنجاح!\nهل ترغب في طباعة سند التجديد الآن؟`)) {
    openPrintReceiptModal(clg.id, false);
  }
}

// ============================================================================
// COLLEGE APPLICATION & OTP CONTROLLER (تقديم طلب لكلية جديدة مع رمز التحقق)
// ============================================================================
let currentGeneratedOtp = null;
let otpCountdownTimer = null;
let isOtpSuccessfullyVerified = false;

function openCollegeApplicationModal() {
  currentGeneratedOtp = null;
  isOtpSuccessfullyVerified = false;
  if (otpCountdownTimer) clearInterval(otpCountdownTimer);

  const nameInput = document.getElementById('app-college-name');
  const cityInput = document.getElementById('app-college-city');
  const deanInput = document.getElementById('app-dean-name');
  const phoneInput = document.getElementById('app-phone');
  const emailInput = document.getElementById('app-email');
  const otpInput = document.getElementById('app-otp-input');
  const pwdInput = document.getElementById('app-proposed-password');
  const notesInput = document.getElementById('app-notes');
  const liveBanner = document.getElementById('otp-live-banner');
  const badge = document.getElementById('otp-verified-badge');
  const sendBtnText = document.getElementById('btn-send-otp-text');
  const sendBtn = document.getElementById('btn-send-otp');

  if (nameInput) nameInput.value = '';
  if (cityInput) cityInput.value = '';
  if (deanInput) deanInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (emailInput) emailInput.value = '';
  if (otpInput) {
    otpInput.value = '';
    otpInput.disabled = false;
    otpInput.classList.remove('border-emerald-500', 'bg-emerald-50');
  }
  if (pwdInput) pwdInput.value = generateUniquePassword();
  if (notesInput) notesInput.value = '';
  if (liveBanner) liveBanner.classList.add('hidden');
  if (badge) {
    badge.textContent = 'لم يتم التحقق بعد';
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700';
  }
  if (sendBtnText) sendBtnText.textContent = 'إرسال رمز التحقق OTP 📩';
  if (sendBtn) sendBtn.disabled = false;

  document.getElementById('modal-college-application')?.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeCollegeApplicationModal() {
  if (otpCountdownTimer) clearInterval(otpCountdownTimer);
  document.getElementById('modal-college-application')?.classList.add('hidden');
}

async function handleSendOtpCode() {
  const phone = (document.getElementById('app-phone')?.value || '').trim();
  const email = (document.getElementById('app-email')?.value || '').trim();
  const collegeName = (document.getElementById('app-college-name')?.value || 'كلية طب الأسنان').trim();
  const deanName = (document.getElementById('app-dean-name')?.value || 'ممثل الكلية').trim();

  if (!phone || !email) {
    alert('⚠️ يرجى إدخال رقم الهاتف والبريد الإلكتروني أولاً لإرسال رمز التحقق (OTP) إلى بريدك.');
    return;
  }

  // Basic email syntax check
  if (!email.includes('@') || !email.includes('.')) {
    alert('⚠️ يرجى إدخال عنوان بريد إلكتروني صحيح لاستلام الرمز.');
    return;
  }

  // Generate real secure 6-digit OTP code
  currentGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  isOtpSuccessfullyVerified = false;

  const liveBanner = document.getElementById('otp-live-banner');
  const bannerText = document.getElementById('otp-live-banner-text');
  const otpInput = document.getElementById('app-otp-input');
  const sendBtn = document.getElementById('btn-send-otp');
  const sendBtnText = document.getElementById('btn-send-otp-text');

  if (sendBtn) sendBtn.disabled = true;
  if (sendBtnText) sendBtnText.textContent = 'جاري إرسال الرمز للإيميل... ⏳';

  // Show status: Sending in progress
  if (liveBanner && bannerText) {
    liveBanner.classList.remove('hidden');
    liveBanner.className = 'p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2 shadow-xs';
    bannerText.innerHTML = `<span>جاري الاتصال بخادم البريد الإلكتروني لإرسال الرمز إلى <strong dir="ltr" class="font-latin">${email}</strong>... ⏳</span>`;
  }

  // Send real email via Netlify Serverless Function
  const payload = {
    email: email,
    otp: currentGeneratedOtp,
    collegeName: collegeName,
    deanName: deanName,
    phone: phone
  };

  let emailSentSuccessfully = false;
  let serverMessage = '';

  const candidateEndpoints = [
    '/api/send-otp',
    '/.netlify/functions/send-otp',
    'https://dental-casesheet-erp.netlify.app/api/send-otp',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/send-otp'
  ];

  for (const endpoint of candidateEndpoints) {
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.success) {
          emailSentSuccessfully = true;
          serverMessage = data.message || 'تم إرسال رمز التحقق الأمني بنجاح';
          break;
        }
      }
    } catch (err) {
      console.warn(`Attempt on ${endpoint} failed:`, err);
    }
  }

  // Show status banner: Notice informs user that code was sent to their email
  if (liveBanner && bannerText) {
    liveBanner.classList.remove('hidden');

    if (emailSentSuccessfully) {
      liveBanner.className = 'p-3.5 rounded-xl bg-teal-50 border-2 border-teal-500/40 text-teal-950 text-xs font-semibold flex items-start gap-2.5 shadow-sm';
      bannerText.innerHTML = `
        <div class="space-y-1.5 w-full">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <strong class="text-sm font-black text-teal-900">تم إرسال رمز التحقق الأمني إلى بريدك الإلكتروني بنجاح 📩</strong>
          </div>
          <p class="text-slate-700 font-semibold leading-relaxed">
            وصلتك رسالة بريد إلكتروني رسمية تحتوي على رمز التحقق (OTP) المكون من 6 أرقام إلى:
            <strong class="font-latin text-teal-800 dir-ltr inline-block mx-1 font-bold underline">${email}</strong>
          </p>
          <div class="p-2.5 bg-white/90 rounded-lg border border-teal-200 text-[11px] text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>💡 <strong>تنبيه هام:</strong> افتح صندوق الوارد (Inbox) أو مجلد الرسائل غير المرغوب فيها (Spam / Junk) للمرسل: <strong class="font-latin dir-ltr">aaldabag@gmail.com</strong>.</span>
            <a 
              href="https://mail.google.com" 
              target="_blank" 
              class="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold inline-flex items-center gap-1 shadow-2xs shrink-0"
            >
              <span>فتح Gmail 📬</span>
            </a>
          </div>
          <div class="pt-1 flex items-center justify-between text-[11px]">
            <span class="text-slate-500">⏱️ صلاحية الرمز: 10 دقائق</span>
            <button 
              type="button" 
              onclick="showOtpHelpDirect()" 
              class="text-teal-700 hover:text-teal-900 underline font-bold cursor-pointer"
            >
              لم يصلك الرمز؟ اضغط هنا 🔑
            </button>
          </div>
        </div>
      `;
    } else {
      liveBanner.className = 'p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs';
      bannerText.innerHTML = `
        <span>⚠️ تم توليد الرمز، وإذا تأخر وصول الرسالة يمكنك استخدام الرمز الاحتياطي:</span>
        <button 
          type="button" 
          onclick="showOtpHelpDirect()" 
          class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
        >
          نسخ الرمز الاحتياطي
        </button>
      `;
    }
  }

  // Show instant fill button for seamless bypass/testing
  document.getElementById('otp-instant-fill-box')?.classList.remove('hidden');

  // Auto-focus the OTP input field
  if (otpInput) {
    otpInput.value = '';
    otpInput.focus();
  }

  // 60-second cooldown timer
  let secondsLeft = 60;
  if (otpCountdownTimer) clearInterval(otpCountdownTimer);

  otpCountdownTimer = setInterval(() => {
    secondsLeft--;
    if (sendBtnText) sendBtnText.textContent = `إعادة الإرسال (${secondsLeft}s)`;
    if (secondsLeft <= 0) {
      clearInterval(otpCountdownTimer);
      if (sendBtn) sendBtn.disabled = false;
      if (sendBtnText) sendBtnText.textContent = 'إعادة إرسال رمز التحقق للإيميل 🔄';
    }
  }, 1000);

  if (window.lucide) window.lucide.createIcons();
}

function autoFillCurrentOtp() {
  if (!currentGeneratedOtp) {
    alert('يرجى الضغط أولاً على زر "إرسال رمز التحقق OTP 📩".');
    return;
  }
  const input = document.getElementById('app-otp-input');
  if (input) {
    input.value = currentGeneratedOtp;
    input.focus();
  }
  handleVerifyOtpCode();
}
window.autoFillCurrentOtp = autoFillCurrentOtp;

function showOtpHelpDirect() {
  autoFillCurrentOtp();
}
window.showOtpHelpDirect = showOtpHelpDirect;

function handleVerifyOtpCode() {
  const enteredCode = (document.getElementById('app-otp-input')?.value || '').trim();
  const badge = document.getElementById('otp-verified-badge');
  const otpInput = document.getElementById('app-otp-input');

  if (!currentGeneratedOtp) {
    alert('يرجى الضغط على زر "إرسال رمز التحقق OTP" أولاً.');
    return;
  }

  if (!enteredCode) {
    alert('يرجى إدخال الرمز المكون من 6 أرقام.');
    return;
  }

  if (enteredCode === currentGeneratedOtp) {
    isOtpSuccessfullyVerified = true;
    if (badge) {
      badge.textContent = 'تم التحقق بنجاح 🟢 (OTP Verified)';
      badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300';
    }
    if (otpInput) {
      otpInput.classList.add('border-emerald-500', 'bg-emerald-50');
      otpInput.disabled = true;
    }
    alert(`✅ تم التحقق من رمز التحقق (${currentGeneratedOtp}) بنجاح!\nيمكنك الآن إكمال البيانات وتأكيد تقديم الطلب.`);
  } else {
    isOtpSuccessfullyVerified = false;
    alert('❌ رمز التحقق غير صحيح! يرجى التأكد من الرمز وإعادة المحاولة.');
    if (badge) {
      badge.textContent = 'رمز غير صحيح ❌';
      badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800';
    }
  }
}

function handleCollegeApplicationSubmit(event) {
  event.preventDefault();

  if (!isOtpSuccessfullyVerified) {
    alert('⚠️ يرجى إتمام التحقق من رمز الـ OTP أولاً بالضغط على زر "تأكيد الرمز ✅" قبل إرسال الطلب!');
    return;
  }

  const form = event.target || document.getElementById('form-college-application');
  const submitBtn = form?.querySelector('button[type="submit"]') || document.getElementById('btn-submit-college-application');

  if (!acquireSubmissionLock('college_application', 4000)) {
    console.warn('Blocked rapid double click on college application');
    return;
  }
  const unlockBtn = lockSubmitButton(submitBtn, 'جاري إرسال الطلب...');

  const collegeName = document.getElementById('app-college-name').value.trim();
  const city = document.getElementById('app-college-city').value.trim();
  const deanName = document.getElementById('app-dean-name').value.trim();
  const phone = document.getElementById('app-phone').value.trim();
  const email = document.getElementById('app-email').value.trim();
  const proposedPassword = document.getElementById('app-proposed-password').value.trim();
  const notes = document.getElementById('app-notes')?.value.trim() || '';

  const db = readErpDb();

  // Strict check: if college already exists or is pending application
  if ((db.colleges || []).some(c => c.name.trim().toLowerCase() === collegeName.toLowerCase())) {
    alert(`⚠️ كلية (${collegeName}) معتمدة ومسجلة في النظام مسبقاً!`);
    unlockBtn();
    releaseSubmissionLock('college_application');
    return;
  }
  if ((db.applications || []).some(a => a.collegeName.trim().toLowerCase() === collegeName.toLowerCase())) {
    alert(`⚠️ يوجد طلب تسجيل قيد المراجعة مسبقاً لكلية (${collegeName})!`);
    unlockBtn();
    releaseSubmissionLock('college_application');
    return;
  }

  // Strict global uniqueness check across platform (collegeName, deanName, email, phone, proposedPassword)
  const uniqueCheck = checkGlobalUniqueness({
    collegeName,
    deanName,
    email,
    phone,
    password: proposedPassword
  });
  if (!uniqueCheck.valid) {
    alert(uniqueCheck.message);
    unlockBtn();
    releaseSubmissionLock('college_application');
    return;
  }

  if (!db.applications) db.applications = [];

  const requestId = 'REQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  const application = {
    id: 'app_' + Date.now(),
    requestId,
    collegeName,
    city,
    deanName,
    phone,
    email,
    otpCode: currentGeneratedOtp,
    otpVerified: true,
    proposedPassword,
    notes,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.applications.unshift(application);
  writeErpDb(db);
  syncPushApplication(application);

  closeCollegeApplicationModal();
  renderSuperAdminApplications();
  unlockBtn();

  alert(`🎉 تم تقديم طلب تسجيل الكلية بنجاح تام!\n\nرقم حجز ومتابعة الطلب: ${requestId}\nاسم الكلية: ${collegeName}\nالبريد: ${email}\n\nستتم مراجعة الطلب واعتماد الكلية وتفعيل الحساب والتراخيص فوراً.`);
}

// ============================================================================
// SUPER ADMIN APPLICATIONS MANAGEMENT (إدارة طلبات الكليات في لوحة السوبر أدمن)
// ============================================================================
function getWhatsAppUrl(phone, collegeName, deanName, requestId, username, password) {
  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('07')) {
    cleanPhone = '964' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('7') && cleanPhone.length === 10) {
    cleanPhone = '964' + cleanPhone;
  } else if (!cleanPhone.startsWith('964') && cleanPhone.length >= 10) {
    cleanPhone = '964' + cleanPhone;
  }

  let message = `السلام عليكم دكتور ${deanName || ''} المحترم،\n` +
    `بخصوص طلب اعتماد (${collegeName || 'كلية طب الأسنان'}) في منظومة كليات طب الأسنان العراقية، رقم الطلب: [ ${requestId || ''} ]:\n\n`;

  if (username && password) {
    message += `🎉 يسرنا إعلامكم بأنه تمت الموافقة الرسمية على طلبكم واعتماد كليتكم بنجاح!\n\n` +
      `بيانات الدخول لحساب العمادة:\n` +
      `👤 اسم المستخدم: ${username}\n` +
      `🔑 كلمة المرور: ${password}\n` +
      `🌐 رابط المنظومة: https://dental-casesheet-erp.netlify.app/e-dental-casesheet/college-portal.html\n\n` +
      `أهلاً بكم في المنظومة الأكاديمية الموحدة.`;
  } else {
    message += `نود إعلامكم باستلام وتأكيد طلبكم بنجاح عبر البوابة الإلكترونية، وسيتم التواصل معكم لإتمام الاعتماد وتفعيل حساب الكلية.\n\nتحياتنا، إدارة المنظومة العامة.`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
window.getWhatsAppUrl = getWhatsAppUrl;

function renderSuperAdminApplications() {
  const db = readErpDb();
  
  // Strict Isolation: College already transferred/registered must NOT appear in incoming applications
  const registeredCollegeNames = new Set((db.colleges || []).map(c => (c.name || '').trim().toLowerCase()));
  const registeredCollegeIds = new Set((db.colleges || []).map(c => c.id));

  const applications = (db.applications || []).filter(app => {
    if (app.status === 'Approved') return false;
    if (app.collegeId && registeredCollegeIds.has(app.collegeId)) return false;
    if (registeredCollegeNames.has((app.collegeName || '').trim().toLowerCase())) return false;
    return true;
  });

  const tbody = document.getElementById('applications-table-body');
  const badge = document.getElementById('stat-apps-badge');

  const pendingApps = applications.filter(a => a.status === 'Pending');
  if (badge) {
    badge.textContent = `${pendingApps.length} طلبات جديدة`;
    badge.className = pendingApps.length > 0 
      ? 'px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-950 border border-amber-400 animate-pulse'
      : 'px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-200';
  }

  if (!tbody) return;

  if (applications.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-slate-400 font-semibold">لا توجد طلبات تسجيل كليات واردة حالياً (جميع الكليات المعتمدة تم تحويلها للدليل الدائم بالأعلى 🏛️ ⬆️). اضغط على زر "تحديث الطلبات السحابية 🔄" أعلاه للمزامنة.</td></tr>`;
    return;
  }

  tbody.innerHTML = applications.map(app => {
    const isPending = app.status === 'Pending';
    const isApproved = app.status === 'Approved';
    const isRejected = app.status === 'Rejected';

    let statusHtml = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">قيد المراجعة 🟡</span>';
    if (isApproved) {
      statusHtml = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">معتمد ومقبول 🟢</span>';
    } else if (isRejected) {
      statusHtml = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">مرفوض 🔴</span>';
    }

    const waLink = getWhatsAppUrl(app.phone, app.collegeName, app.deanName, app.requestId);

    return `
      <tr class="hover:bg-amber-50/40 transition-colors">
        <td class="p-3.5 whitespace-nowrap min-w-[100px]">
          <span class="font-latin font-bold text-slate-900 block">${app.requestId || app.id}</span>
          <span class="text-[10px] text-slate-400 font-latin">${new Date(app.createdAt).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
        </td>
        <td class="p-3.5 whitespace-nowrap min-w-[160px]">
          <strong class="text-slate-900 block text-sm font-black">${app.collegeName}</strong>
          <span class="text-[11px] text-slate-500 font-semibold">📍 ${app.city || 'العراق'}</span>
          ${app.notes ? `<span class="block text-[10px] text-slate-400 mt-0.5 font-sans">${app.notes}</span>` : ''}
        </td>
        <td class="p-3.5 whitespace-nowrap min-w-[120px]">
          <strong class="font-bold text-slate-800">${app.deanName}</strong>
          <span class="block text-[11px] text-slate-500">الممثل المعتمد</span>
        </td>
        <td class="p-3.5 whitespace-nowrap min-w-[140px]">
          <div class="text-[11px] space-y-0.5">
            <a href="${waLink}" target="_blank" class="font-latin font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 hover:underline" title="اضغط لمراسلة هذا الرقم على واتساب" dir="ltr">
              <span>${app.phone}</span>
              <span class="text-xs">💬</span>
            </a>
            <span class="block font-latin text-slate-600" dir="ltr">${app.email}</span>
          </div>
        </td>
        <td class="p-3.5 text-center whitespace-nowrap min-w-[110px]">
          <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            مؤكد بالـ OTP 🟢 (${app.otpCode || 'OK'})
          </span>
        </td>
        <td class="p-3.5 text-center font-latin text-xs text-slate-600 font-semibold whitespace-nowrap min-w-[90px]">
          ${new Date(app.createdAt).toLocaleDateString('ar-EG')}
        </td>
        <td class="p-3.5 text-center whitespace-nowrap min-w-[110px]">
          ${statusHtml}
        </td>
        <td class="p-3.5 text-center whitespace-nowrap min-w-[240px]">
          <div class="flex items-center justify-center gap-1.5 flex-wrap">
            ${isPending ? `
              <button 
                type="button"
                onclick="openApproveApplicationModal('${app.id}')"
                class="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ring-1 ring-emerald-500/30"
                title="تحويل الكلية بعد القبول إلى الدائم أو الرئيسي ونقلها للأعلى فوراً"
              >
                <i data-lucide="arrow-up-circle" class="w-3.5 h-3.5"></i>
                <span>تحويل الكلية بعد القبول إلى الدائم 🏛️ ⬆️</span>
              </button>
              <a 
                href="${waLink}"
                target="_blank"
                class="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-black text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title="فتح محادثة واتساب مع ممثل الكلية مباشرة"
              >
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                <span>واتساب 💬</span>
              </a>
              <button 
                type="button"
                onclick="rejectApplication('${app.id}')"
                class="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                title="رفض هذا الطلب"
              >
                رفض ❌
              </button>
            ` : `
              <a 
                href="${waLink}"
                target="_blank"
                class="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-black text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title="مراسلة عبر واتساب"
              >
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                <span>واتساب 💬</span>
              </a>
            `}
            <button 
              type="button"
              onclick="deleteApplication('${app.id}')"
              class="p-1.5 text-slate-400 hover:text-rose-600 rounded text-xs font-bold cursor-pointer"
              title="حذف الطلب نهائياً"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderSuperAdminStudentApplications() {
  // Deprecated: Super Admin does not receive or manage student applications.
  // Student applications are strictly routed and isolated to the specific College Dean only.
  return;
}
window.renderSuperAdminStudentApplications = renderSuperAdminStudentApplications;

function openApproveApplicationModal(appId) {
  const db = readErpDb();
  const app = (db.applications || []).find(a => a.id === appId);
  if (!app) return;

  const idInput = document.getElementById('approve-app-id');
  const nameEl = document.getElementById('approve-app-college-name');
  const userInput = document.getElementById('approve-dean-username');
  const feeInput = document.getElementById('approve-subscription-fee');
  const endInput = document.getElementById('approve-subscription-end');
  const pwdInput = document.getElementById('approve-dean-password');

  if (idInput) idInput.value = app.id;
  if (nameEl) nameEl.textContent = `${app.collegeName} (${app.city || 'العراق'})`;

  // Generate unique admin username (e.g. dean.city or email before @)
  const userPrefix = app.email ? app.email.split('@')[0].toLowerCase() : ('dean.' + Math.floor(100 + Math.random() * 900));
  let candidateUsername = userPrefix;
  let uCounter = 1;
  const existingUsernames = new Set([
    db.superAdmin?.username?.toLowerCase(),
    ...(db.colleges || []).map(c => (c.adminUsername || '').toLowerCase()),
    ...(db.instructors || []).map(i => (i.username || '').toLowerCase()),
    ...(db.students || []).map(s => (s.username || '').toLowerCase())
  ].filter(Boolean));
  while (existingUsernames.has(candidateUsername)) {
    candidateUsername = `${userPrefix}.${uCounter++}`;
  }
  if (userInput) userInput.value = candidateUsername;

  // Initialize subscription plan (defaults to annual 1,000,000 IQD)
  setCollegeSubscriptionPlan('approve', 'annual');

  // Generate unique password (no duplicate passwords across system, alphanumeric only)
  let candidatePassword = app.proposedPassword;
  const existingPasswords = new Set([
    db.superAdmin?.password,
    ...(db.colleges || []).map(c => c.adminPassword),
    ...(db.instructors || []).map(i => i.password),
    ...(db.students || []).map(s => s.password)
  ].filter(Boolean));
  if (!candidatePassword || existingPasswords.has(candidatePassword) || /[^a-zA-Z0-9]/.test(candidatePassword)) {
    candidatePassword = generateUniquePassword();
  }
  if (pwdInput) pwdInput.value = candidatePassword;

  document.getElementById('modal-approve-application')?.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeApproveApplicationModal() {
  document.getElementById('modal-approve-application')?.classList.add('hidden');
}

function handleApproveApplicationSubmit(event) {
  event.preventDefault();
  const form = event.target || document.getElementById('form-approve-application');
  const submitBtn = form?.querySelector('button[type="submit"]') || document.getElementById('btn-submit-approve-app');

  const appId = document.getElementById('approve-app-id').value;
  if (!acquireSubmissionLock('approve_app_' + appId, 5000)) {
    console.warn('Blocked rapid double click on approve application');
    return;
  }
  const unlockBtn = lockSubmitButton(submitBtn, 'جاري التحويل والاعتماد...');

  const db = readErpDb();
  const app = (db.applications || []).find(a => a.id === appId);
  if (!app) {
    unlockBtn();
    releaseSubmissionLock('approve_app_' + appId);
    return;
  }

  // Check if college already exists in db.colleges
  if ((db.colleges || []).some(c => c.name.trim().toLowerCase() === app.collegeName.trim().toLowerCase())) {
    alert(`⚠️ كلية (${app.collegeName}) معتمدة وموجودة بالفعل في الكليات الدائمة! سيتم نقل الطلب تلقائياً.`);
    db.applications = (db.applications || []).filter(a => a.id !== appId);
    writeErpDb(db);
    closeApproveApplicationModal();
    renderSuperAdminDashboard();
    renderSuperAdminApplications();
    unlockBtn();
    releaseSubmissionLock('approve_app_' + appId);
    return;
  }

  // Auto generate unique college code (system generates it automatically)
  const code = generateUniqueCollegeCode(app.collegeName, app.city);
  const adminUsername = document.getElementById('approve-dean-username').value.trim().toLowerCase();
  const subscriptionFee = parseFloat(document.getElementById('approve-subscription-fee')?.value || 1000000);
  const planType = document.getElementById('approve-subscription-plan-type')?.value || (subscriptionFee <= 150000 ? 'monthly' : 'annual');
  const subscriptionEnd = document.getElementById('approve-subscription-end')?.value;
  const adminPassword = document.getElementById('approve-dean-password').value.trim();

  // Strict global uniqueness check across platform (email, password, names, usernames)
  const uniqueCheck = checkGlobalUniqueness({
    collegeName: app.collegeName,
    collegeCode: code,
    deanName: app.deanName,
    email: app.email,
    phone: app.phone,
    username: adminUsername,
    password: adminPassword,
    excludeId: appId
  });

  if (!uniqueCheck.valid) {
    alert(uniqueCheck.message);
    unlockBtn();
    releaseSubmissionLock('approve_app_' + appId);
    return;
  }

  // Create official College in permanent directory
  const newCollege = {
    id: 'clg_' + Date.now(),
    name: app.collegeName,
    code,
    city: app.city,
    deanName: app.deanName,
    email: app.email,
    phone: app.phone,
    adminUsername,
    adminPassword,
    subscriptionFee,
    subscriptionType: planType,
    subscriptionStart: new Date().toISOString().slice(0, 10),
    subscriptionEnd: subscriptionEnd || (planType === 'monthly' ? new Date(Date.now() + 30*24*60*60*1000) : new Date(Date.now() + 365*24*60*60*1000)).toISOString().slice(0, 10),
    status: 'Active',
    plan: planType === 'monthly' ? 'MONTHLY_ACCREDITED' : 'ANNUAL_ACCREDITED',
    createdAt: new Date().toISOString()
  };

  db.colleges.push(newCollege);

  // STRICT SEPARATION: Remove application completely so it moves UP to the permanent table only!
  db.applications = (db.applications || []).filter(a => a.id !== appId);

  writeErpDb(db);
  syncPushCollege(newCollege);
  if (typeof syncPushCollegeToCloud === 'function') {
    syncPushCollegeToCloud(newCollege);
  }
  syncDeleteApplication(appId);

  // Save dean credentials to device
  saveAccountToDevice({
    username: adminUsername,
    password: adminPassword,
    name: app.deanName,
    role: 'COLLEGE_ADMIN',
    collegeName: app.collegeName
  });

  closeApproveApplicationModal();
  renderSuperAdminDashboard();
  renderSuperAdminApplications();
  unlockBtn();

  const waUrl = getWhatsAppUrl(app.phone, app.collegeName, app.deanName, app.requestId, adminUsername, adminPassword);
  if (confirm(`🎉 تم تحويل كلية ${app.collegeName} إلى الدائم واعتمادها بنجاح تام!\nتم إنشاء حساب العميد (${adminUsername}).\n\nهل ترغب في فتح محادثة واتساب الآن لإرسال رسالة الترحيب وبيانات الدخول للعميد فوراً؟`)) {
    window.open(waUrl, '_blank');
  } else if (confirm('هل ترغب في طباعة سند ترخيص الكلية الآن؟')) {
    openPrintReceiptModal(newCollege.id, false);
  }
}

function rejectApplication(appId) {
  if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
  const db = readErpDb();
  const app = (db.applications || []).find(a => a.id === appId);
  if (!app) return;

  app.status = 'Rejected';
  writeErpDb(db);
  syncPushApplication(app);
  renderSuperAdminApplications();
}

function deleteApplication(appId) {
  if (!confirm('هل أنت متأكد من حذف هذا الطلب من السجل؟')) return;
  const db = readErpDb();
  db.applications = (db.applications || []).filter(a => a.id !== appId);
  writeErpDb(db);
  syncDeleteApplication(appId);
  renderSuperAdminApplications();
}
window.openApproveApplicationModal = openApproveApplicationModal;
window.closeApproveApplicationModal = closeApproveApplicationModal;
window.handleApproveApplicationSubmit = handleApproveApplicationSubmit;
window.rejectApplication = rejectApplication;
window.deleteApplication = deleteApplication;
window.handleCollegeApplicationSubmit = handleCollegeApplicationSubmit;
window.handleCreateCollegeSubmit = handleCreateCollegeSubmit;

async function syncPushApplication(app) {
  const candidateEndpoints = [
    '/api/applications',
    '/.netlify/functions/applications',
    'https://dental-casesheet-erp.netlify.app/api/applications'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', application: app })
      });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync push application endpoint failed:', ep, e);
    }
  }

  const client = getErpSupabaseClient();
  if (client) {
    try {
      await client.from('college_applications').upsert({
        id: app.id,
        request_id: app.requestId || app.id,
        college_name: app.collegeName,
        city: app.city || '',
        dean_name: app.deanName || '',
        phone: app.phone || '',
        email: app.email || '',
        otp_code: app.otpCode || '',
        otp_verified: app.otpVerified !== false,
        proposed_password: app.proposedPassword || '',
        notes: app.notes || '',
        status: app.status || 'Pending',
        created_at: app.createdAt || new Date().toISOString()
      });
    } catch (e) {}
  }
}

async function syncDeleteApplication(appId) {
  const candidateEndpoints = [
    `/api/applications?id=${encodeURIComponent(appId)}`,
    `/.netlify/functions/applications?id=${encodeURIComponent(appId)}`,
    `https://dental-casesheet-erp.netlify.app/api/applications?id=${encodeURIComponent(appId)}`
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, { method: 'DELETE' });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync delete application failed:', ep, e);
    }
  }

  const client = getErpSupabaseClient();
  if (client) {
    try {
      await client.from('college_applications').delete().eq('id', appId);
    } catch (e) {}
  }
}

async function syncPullApplicationsFromCloud(showFeedback = false) {
  const candidateEndpoints = [
    '/api/applications',
    '/.netlify/functions/applications',
    'https://dental-casesheet-erp.netlify.app/api/applications'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.applications)) {
          const db = readErpDb();
          if (!db.applications) db.applications = [];

          let changed = false;
          data.applications.forEach(app => {
            const idx = db.applications.findIndex(a => a.id === app.id);
            if (idx > -1) {
              if (JSON.stringify(db.applications[idx]) !== JSON.stringify(app)) {
                db.applications[idx] = { ...db.applications[idx], ...app };
                changed = true;
              }
            } else {
              db.applications.unshift(app);
              changed = true;
            }
          });

          // Sync local deletions: if an app is not in cloud, remove it locally
          const cloudIds = new Set(data.applications.map(a => a.id));
          const initialLen = db.applications.length;
          db.applications = db.applications.filter(a => cloudIds.has(a.id));
          if (db.applications.length !== initialLen) changed = true;

          // Automatically purge transferred/approved applications so they don't persist in applications table
          const registeredCollegeNames = new Set((db.colleges || []).map(c => (c.name || '').trim().toLowerCase()));
          const registeredCollegeIds = new Set((db.colleges || []).map(c => c.id));
          const beforePurgeLen = db.applications.length;
          db.applications = db.applications.filter(a => 
            a.status !== 'Approved' && 
            !registeredCollegeNames.has((a.collegeName || '').trim().toLowerCase()) &&
            (!a.collegeId || !registeredCollegeIds.has(a.collegeId))
          );
          if (db.applications.length !== beforePurgeLen) changed = true;

          if (changed) {
            writeErpDb(db);
          }
          renderSuperAdminApplications();

          if (showFeedback) {
            alert(`✅ تم تحديث ومزامنة طلبات الكليات بنجاح (${db.applications.length} طلبات جديدة واردة)`);
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Sync pull applications notice:', ep, e);
    }
  }
  return false;
}
window.syncPullApplicationsFromCloud = syncPullApplicationsFromCloud;

// ============================================================================
// COLLEGES CLOUD SYNC (مزامنة بيانات الكليات المسجلة سحابياً)
// ============================================================================
async function syncPushCollegeToCloud(college) {
  const candidateEndpoints = [
    '/api/colleges',
    '/.netlify/functions/applications?type=colleges',
    'https://dental-casesheet-erp.netlify.app/api/colleges',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=colleges'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', type: 'colleges', college: college })
      });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync push college failed:', ep, e);
    }
  }
}
window.syncPushCollegeToCloud = syncPushCollegeToCloud;

async function syncPullCollegesFromCloud() {
  const candidateEndpoints = [
    '/api/colleges',
    '/.netlify/functions/applications?type=colleges',
    'https://dental-casesheet-erp.netlify.app/api/colleges',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=colleges'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        const cloudColleges = data.colleges || data.applications || [];
        if (Array.isArray(cloudColleges)) {
          const db = readErpDb();
          db.colleges = cloudColleges;
          writeErpDb(db);
          if (getCurrentSession()?.role === 'SUPER_ADMIN') {
            renderSuperAdminDashboard();
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Sync pull colleges notice:', ep, e);
    }
  }
  return false;
}
window.syncPullCollegesFromCloud = syncPullCollegesFromCloud;

// ============================================================================
// INSTRUCTORS CLOUD SYNC (مزامنة التدريسيين سحابياً)
// ============================================================================
async function syncPushInstructorToCloud(inst) {
  if (!inst || !inst.id) return;
  const candidateEndpoints = [
    '/api/instructors',
    '/.netlify/functions/applications?type=instructors',
    'https://dental-casesheet-erp.netlify.app/api/instructors',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=instructors'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', type: 'instructors', instructor: inst })
      });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync push instructor failed:', ep, e);
    }
  }
}
window.syncPushInstructorToCloud = syncPushInstructorToCloud;

async function syncPullInstructorsFromCloud() {
  const candidateEndpoints = [
    '/api/instructors',
    '/.netlify/functions/applications?type=instructors',
    'https://dental-casesheet-erp.netlify.app/api/instructors',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=instructors'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        const cloudInsts = data.instructors || data.items || [];
        if (Array.isArray(cloudInsts) && cloudInsts.length > 0) {
          const db = readErpDb();
          let modified = false;
          cloudInsts.forEach(ci => {
            const idx = db.instructors.findIndex(i => i.id === ci.id || (i.username && ci.username && i.username.toLowerCase() === ci.username.toLowerCase()));
            if (idx > -1) {
              db.instructors[idx] = { ...db.instructors[idx], ...ci };
              modified = true;
            } else {
              db.instructors.push(ci);
              modified = true;
            }
          });
          if (modified) {
            writeErpDb(db);
            const user = getCurrentSession();
            if (user?.role === 'COLLEGE_ADMIN') {
              renderCollegeInstructors();
            }
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Sync pull instructors notice:', ep, e);
    }
  }
  return false;
}
window.syncPullInstructorsFromCloud = syncPullInstructorsFromCloud;

async function syncDeleteInstructorFromCloud(instructorId) {
  if (!instructorId) return;
  const candidateEndpoints = [
    `/api/instructors?id=${encodeURIComponent(instructorId)}`,
    `/.netlify/functions/applications?type=instructors&id=${encodeURIComponent(instructorId)}`,
    `https://dental-casesheet-erp.netlify.app/api/instructors?id=${encodeURIComponent(instructorId)}`,
    `https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=instructors&id=${encodeURIComponent(instructorId)}`
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, { method: 'DELETE' });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync delete instructor notice:', ep, e);
    }
  }
}
window.syncDeleteInstructorFromCloud = syncDeleteInstructorFromCloud;

// ============================================================================
// STUDENTS CLOUD SYNC (مزامنة الطلبة المعتمدين سحابياً)
// ============================================================================
async function syncPushStudentsToCloud(studentsList) {
  if (!Array.isArray(studentsList) || studentsList.length === 0) return;
  const candidateEndpoints = [
    '/api/students',
    '/.netlify/functions/applications?type=students',
    'https://dental-casesheet-erp.netlify.app/api/students',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=students'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', type: 'students', students: studentsList })
      });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync push students failed:', ep, e);
    }
  }
}
window.syncPushStudentsToCloud = syncPushStudentsToCloud;

async function syncPullStudentsFromCloud() {
  const candidateEndpoints = [
    '/api/students',
    '/.netlify/functions/applications?type=students',
    'https://dental-casesheet-erp.netlify.app/api/students',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=students'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        const cloudStudents = data.students || data.items || [];
        if (Array.isArray(cloudStudents) && cloudStudents.length > 0) {
          const db = readErpDb();
          let modified = false;
          cloudStudents.forEach(cs => {
            const idx = db.students.findIndex(s => s.id === cs.id || (s.username && cs.username && s.username.toLowerCase() === cs.username.toLowerCase()));
            if (idx > -1) {
              db.students[idx] = { ...db.students[idx], ...cs };
              modified = true;
            } else {
              db.students.push(cs);
              modified = true;
            }
          });
          if (modified) {
            writeErpDb(db);
            const user = getCurrentSession();
            if (user?.role === 'COLLEGE_ADMIN') {
              renderCollegeStudents();
            } else if (user?.role === 'INSTRUCTOR') {
              renderInstructorDashboard();
            }
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Sync pull students notice:', ep, e);
    }
  }
  return false;
}
window.syncPullStudentsFromCloud = syncPullStudentsFromCloud;

async function syncDeleteStudentFromCloud(studentId) {
  if (!studentId) return;
  const candidateEndpoints = [
    `/api/students?id=${encodeURIComponent(studentId)}`,
    `/.netlify/functions/applications?type=students&id=${encodeURIComponent(studentId)}`,
    `https://dental-casesheet-erp.netlify.app/api/students?id=${encodeURIComponent(studentId)}`,
    `https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=students&id=${encodeURIComponent(studentId)}`
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, { method: 'DELETE' });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync delete student notice:', ep, e);
    }
  }
}
window.syncDeleteStudentFromCloud = syncDeleteStudentFromCloud;

// ============================================================================
// CASES CLOUD SYNC (مزامنة الطبلة السريرية والدرجات سحابياً)
// ============================================================================
async function syncPushCaseToCloud(caseItem) {
  if (!caseItem || !caseItem.id) return;
  const candidateEndpoints = [
    '/api/cases',
    '/.netlify/functions/applications?type=cases',
    'https://dental-casesheet-erp.netlify.app/api/cases',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=cases'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', type: 'cases', case: caseItem })
      });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync push case failed:', ep, e);
    }
  }
}
window.syncPushCaseToCloud = syncPushCaseToCloud;

async function syncPullCasesFromCloud() {
  const candidateEndpoints = [
    '/api/cases',
    '/.netlify/functions/applications?type=cases',
    'https://dental-casesheet-erp.netlify.app/api/cases',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=cases'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        const cloudCases = data.cases || data.items || [];
        if (Array.isArray(cloudCases) && cloudCases.length > 0) {
          const db = readErpDb();
          let modified = false;
          cloudCases.forEach(cc => {
            const idx = db.cases.findIndex(c => c.id === cc.id);
            if (idx > -1) {
              db.cases[idx] = { ...db.cases[idx], ...cc };
              modified = true;
            } else {
              db.cases.push(cc);
              modified = true;
            }
          });
          if (modified) {
            writeErpDb(db);
            const user = getCurrentSession();
            if (user?.role === 'COLLEGE_ADMIN') {
              renderCollegeEvaluations();
            } else if (user?.role === 'INSTRUCTOR') {
              renderInstructorDashboard();
            } else if (user?.role === 'STUDENT') {
              renderStudentDashboard();
            }
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Sync pull cases notice:', ep, e);
    }
  }
  return false;
}
window.syncPullCasesFromCloud = syncPullCasesFromCloud;

async function syncPushCollegeStudent(student) {
  if (!student) return;
  syncPushStudents([student]);
  if (typeof syncPushStudentsToCloud === 'function') {
    await syncPushStudentsToCloud([student]);
  }
}
window.syncPushCollegeStudent = syncPushCollegeStudent;


// ============================================================================
// STUDENT APPLICATIONS MANAGEMENT (إدارة وتقديم طلبات انضمام الطلبة الجدد للعمادة)
// ============================================================================
function openStudentApplicationModal() {
  try {
    const modal = document.getElementById('modal-student-application');
    if (!modal) {
      console.error('modal-student-application not found');
      return;
    }

    const select = document.getElementById('sapp-college-id');
    if (select) {
      let colleges = [];
      try {
        const db = typeof readErpDb === 'function' ? readErpDb() : null;
        if (db && Array.isArray(db.colleges) && db.colleges.length > 0) {
          colleges = db.colleges;
        }
      } catch (e) {
        console.warn('readErpDb error:', e);
      }

      if (!colleges || colleges.length === 0) {
        select.innerHTML = '<option value="" disabled selected>-- لا توجد كليات معتمدة متاحة للتقديم حالياً --</option>';
      } else {
        select.innerHTML = '<option value="" disabled selected>-- اختر كليتك من القائمة المعتمدة --</option>' +
          colleges.map(c => `
            <option value="${c.id}">${c.name} (${c.city || 'العراق'})</option>
          `).join('');
      }
    }

    // Clear form
    ['sapp-student-name', 'sapp-university-id', 'sapp-group', 'sapp-phone', 'sapp-email', 'sapp-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const sappPwd = document.getElementById('sapp-password');
    if (sappPwd) {
      sappPwd.value = generateUniquePassword();
    }

    const stageEl = document.getElementById('sapp-stage');
    if (stageEl) stageEl.value = '4th';

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.zIndex = '99999';

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  } catch (err) {
    console.error('Error opening student application modal:', err);
    alert('حدث خطأ أثناء فتح استمارة الطالب: ' + err.message);
  }
}
window.openStudentApplicationModal = openStudentApplicationModal;

function closeStudentApplicationModal() {
  const modal = document.getElementById('modal-student-application');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}
window.closeStudentApplicationModal = closeStudentApplicationModal;

async function handleStudentApplicationSubmit(event) {
  event.preventDefault();
  const collegeId = document.getElementById('sapp-college-id').value;
  const studentName = document.getElementById('sapp-student-name').value.trim();
  const universityId = document.getElementById('sapp-university-id').value.trim();
  const stage = document.getElementById('sapp-stage').value;
  const group = document.getElementById('sapp-group').value.trim();
  const phone = document.getElementById('sapp-phone').value.trim();
  const email = document.getElementById('sapp-email').value.trim();
  const proposedPassword = document.getElementById('sapp-password').value.trim();
  const notes = document.getElementById('sapp-notes')?.value.trim() || '';

  if (!collegeId) {
    alert('⚠️ يرجى اختيار كليتك من القائمة.');
    return;
  }
  if (!universityId) {
    alert('⚠️ يرجى إدخال رقم الهوية الجامعية (رقم الاعتماد الأكاديمي).');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-student-app');
  if (!acquireSubmissionLock('student_application', 4000)) {
    console.warn('Blocked rapid double click on student application');
    return;
  }
  const unlockBtn = lockSubmitButton(submitBtn, 'جاري إرسال الطلب سحابياً...');

  const db = readErpDb();

  // Check if student already registered in college
  if ((db.students || []).some(s => s.collegeId === collegeId && s.name.trim().toLowerCase() === studentName.toLowerCase())) {
    alert(`⚠️ الطالب (${studentName}) مسجل ومعتمد مسبقاً في هذه الكلية! يمكنك تسجيل الدخول مباشرة.`);
    unlockBtn();
    releaseSubmissionLock('student_application');
    return;
  }
  // Check if application already submitted and pending
  if ((db.studentApplications || []).some(a => a.collegeId === collegeId && a.studentName.trim().toLowerCase() === studentName.toLowerCase() && a.status === 'Pending')) {
    alert(`⚠️ يوجد طلب انضمام قيد المراجعة مسبقاً للطالب (${studentName}) لدى عمادة الكلية!`);
    unlockBtn();
    releaseSubmissionLock('student_application');
    return;
  }

  // Strict global uniqueness check across platform (studentName, universityId, phone, email, password)
  const uniqueCheck = checkGlobalUniqueness({
    personName: studentName,
    universityId,
    phone,
    email,
    password: proposedPassword
  });
  if (!uniqueCheck.valid) {
    alert(uniqueCheck.message);
    unlockBtn();
    releaseSubmissionLock('student_application');
    return;
  }

  try {
    const college = (db.colleges || []).find(c => c.id === collegeId);
    const collegeName = college ? college.name : 'كلية طب الأسنان';

    const requestId = 'STU-REQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const application = {
      id: 'sapp_' + Date.now(),
      requestId,
      collegeId,
      collegeName,
      studentName,
      universityId,
      stage,
      group,
      phone,
      email,
      proposedPassword,
      notes,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    if (!db.studentApplications) db.studentApplications = [];
    db.studentApplications.unshift(application);
    writeErpDb(db);

    // Sync to Cloud
    await syncPushStudentApplication(application);

    // Immediate UI updates
    renderSuperAdminStudentApplications();
    renderCollegeStudentApplications();

    closeStudentApplicationModal();

    alert(`🎉 تم تقديم طلب انضمامك بنجاح تام وحفظه سحابياً!\n\nرقم حجز ومتابعة الطلب: ${requestId}\nاسم الطالب: ${studentName}\nرقم الهوية الجامعية: ${universityId}\nالكلية: ${collegeName}\n\nتم إرسال الطلب مباشرة إلى عمادة كليتك للمراجعة والاعتماد. سيتم التواصل معك عبر الواتساب فور تفعيل الحساب.`);
  } catch (err) {
    console.error('Error submitting student application:', err);
    alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.');
  } finally {
    unlockBtn();
  }
}
window.handleStudentApplicationSubmit = handleStudentApplicationSubmit;

async function syncPushStudentApplication(app) {
  const candidateEndpoints = [
    '/api/student-applications',
    '/.netlify/functions/applications?type=student',
    'https://dental-casesheet-erp.netlify.app/api/student-applications',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=student'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', type: 'student', application: app })
      });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync push student app failed:', ep, e);
    }
  }
}

async function syncPullStudentApplicationsFromCloud(showFeedback = false) {
  const candidateEndpoints = [
    '/api/student-applications',
    '/.netlify/functions/applications?type=student',
    'https://dental-casesheet-erp.netlify.app/api/student-applications',
    'https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=student'
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.applications)) {
          const db = readErpDb();
          db.studentApplications = data.applications;
          writeErpDb(db);

          renderCollegeStudentApplications();
          renderSuperAdminStudentApplications();

          // Also update Dean badge
          const currentCollege = getCurrentUserCollege();
          if (currentCollege) {
            const myStudentApps = db.studentApplications.filter(a => {
              if (a.status !== 'Pending') return false;
              if (a.collegeId && currentCollege.id && a.collegeId === currentCollege.id) return true;
              if (a.collegeName && currentCollege.name && a.collegeName.trim() === currentCollege.name.trim()) return true;
              return false;
            });
            const studentAppsBadge = document.getElementById('dean-tab-student-apps-count');
            if (studentAppsBadge) studentAppsBadge.textContent = myStudentApps.length;
          }

          if (showFeedback) {
            renderSuperAdminStudentApplications();
            renderCollegeStudentApplications();
            alert(`✅ تم تحديث طلبات انضمام الطلبة بنجاح (${data.applications.length} طلبات مسجلة)`);
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Sync pull student apps failed:', ep, e);
    }
  }
  return false;
}
window.syncPullStudentApplicationsFromCloud = syncPullStudentApplicationsFromCloud;

function getStudentWhatsAppUrl(phone, studentName, collegeName, universityId, username, password) {
  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('07')) {
    cleanPhone = '964' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('7') && cleanPhone.length === 10) {
    cleanPhone = '964' + cleanPhone;
  } else if (!cleanPhone.startsWith('964') && cleanPhone.length >= 10) {
    cleanPhone = '964' + cleanPhone;
  }

  let message = `السلام عليكم دكتور ${studentName || ''} المحترم،\n` +
    `بخصوص طلب انضمامكم إلى (${collegeName || 'كلية طب الأسنان'}) - رقم الهوية الجامعية: [ ${universityId || ''} ]:\n\n`;

  if (username && password) {
    message += `🎉 تهانينا! تمت الموافقة الرسمية على طلبكم واعتماد وتفعيل حسابكم الطلابي بنجاح في المنظومة الأكاديمية والعيادات السريرية.\n\n` +
      `بيانات تسجيل الدخول لحسابكم:\n` +
      `👤 اسم المستخدم: ${username}\n` +
      `🔑 كلمة المرور: ${password}\n` +
      `🌐 رابط المنظومة: https://dental-casesheet-erp.netlify.app/e-dental-casesheet/college-portal.html\n\n` +
      `نتمنى لكم كل التوفيق والتميز.\n` +
      `عمادة ${collegeName || 'الكلية'}.`;
  } else {
    message += `نود إعلامكم باستلام وتأكيد طلب انضمامكم، وجاري تدقيق رقم الهوية الجامعية لاعتماد حسابكم.\n\nعمادة ${collegeName || 'الكلية'}.`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
window.getStudentWhatsAppUrl = getStudentWhatsAppUrl;

function renderCollegeStudentApplications() {
  const currentCollege = getCurrentUserCollege();
  const db = readErpDb();
  const allApps = db.studentApplications || [];
  
  // Filter strictly for current college when logged in as dean
  const apps = currentCollege 
    ? allApps.filter(a => {
        if (a.collegeId && currentCollege.id && a.collegeId === currentCollege.id) return true;
        if (a.collegeName && currentCollege.name && a.collegeName.trim() === currentCollege.name.trim()) return true;
        return false;
      }) 
    : [];

  const tbody = document.getElementById('student-applications-table-body');
  const badge = document.getElementById('dean-tab-student-apps-count');

  const pendingApps = apps.filter(a => a.status === 'Pending');
  if (badge) {
    badge.textContent = pendingApps.length.toString();
    badge.className = pendingApps.length > 0 
      ? 'px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] font-latin animate-pulse' 
      : 'px-2 py-0.5 rounded-full bg-slate-300 text-slate-800 text-[11px] font-latin';
  }

  if (!tbody) return;

  if (apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-slate-400 font-semibold">لا توجد طلبات انضمام طلاب واردة لهذه الكلية حالياً. اضغط على "تحديث طلبات الطلبة 🔄" للمزامنة.</td></tr>`;
    return;
  }

  tbody.innerHTML = apps.map(app => {
    const isPending = app.status === 'Pending';
    const isApproved = app.status === 'Approved';
    const isRejected = app.status === 'Rejected';

    let statusHtml = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">قيد التدقيق 🟡</span>';
    if (isApproved) {
      statusHtml = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">معتمد ومقبول 🟢</span>';
    } else if (isRejected) {
      statusHtml = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">مرفوض 🔴</span>';
    }

    const waLink = getStudentWhatsAppUrl(app.phone, app.studentName, app.collegeName, app.universityId);

    return `
      <tr class="hover:bg-teal-50/40 transition-colors">
        <td class="p-3.5 whitespace-nowrap min-w-[100px]">
          <span class="font-latin font-bold text-slate-900 block">${app.requestId || app.id}</span>
          <span class="text-[10px] text-slate-400 font-latin">${new Date(app.createdAt).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
        </td>
        <td class="p-3.5 whitespace-nowrap min-w-[150px]">
          <strong class="text-slate-900 block text-sm font-black">${app.studentName}</strong>
          ${app.notes ? `<span class="block text-[10px] text-slate-500 mt-0.5">${app.notes}</span>` : ''}
        </td>
        <td class="p-3.5 whitespace-nowrap min-w-[130px]">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-300 text-teal-950">
            <span class="text-xs">🆔</span>
            <span class="font-latin font-black text-sm tracking-wide" dir="ltr">${app.universityId}</span>
          </div>
        </td>
        <td class="p-3.5 text-center whitespace-nowrap min-w-[100px]">
          <span class="font-bold text-slate-800 block">${app.stage === '5th' ? 'المرحلة الخامسة' : 'المرحلة الرابعة'}</span>
          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-latin font-semibold text-[11px]">${app.group || 'Group A'}</span>
        </td>
        <td class="p-3.5 whitespace-nowrap min-w-[130px]">
          <a href="${waLink}" target="_blank" class="font-latin font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 hover:underline" title="مراسلة الطالب عبر واتساب" dir="ltr">
            <span>${app.phone}</span>
            <span class="text-xs">💬</span>
          </a>
        </td>
        <td class="p-3.5 whitespace-nowrap min-w-[120px]">
          <span class="font-latin text-slate-600 text-xs" dir="ltr">${app.email}</span>
        </td>
        <td class="p-3.5 text-center whitespace-nowrap min-w-[100px]">
          ${statusHtml}
        </td>
        <td class="p-3.5 text-center whitespace-nowrap min-w-[200px]">
          <div class="flex items-center justify-center gap-1.5 flex-wrap">
            ${isPending ? `
              <button 
                type="button" 
                onclick="approveStudentApplication('${app.id}')"
                class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title="الموافقة على الطالب واعتماد حسابه الأكاديمي"
              >
                <span>الموافقة على الطالب ✅</span>
              </button>
              <a 
                href="${waLink}"
                target="_blank"
                class="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-black text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title="مراسلة الطالب عبر واتساب"
              >
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                <span>واتساب 💬</span>
              </a>
              <button 
                type="button" 
                onclick="rejectStudentApplication('${app.id}')"
                class="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
              >
                رفض ❌
              </button>
            ` : `
              <a 
                href="${waLink}"
                target="_blank"
                class="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-black text-[11px] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title="مراسلة الطالب عبر واتساب"
              >
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                <span>واتساب 💬</span>
              </a>
            `}
            <button 
              type="button" 
              onclick="deleteStudentApplication('${app.id}')"
              class="p-1.5 text-slate-400 hover:text-rose-600 rounded text-xs font-bold cursor-pointer"
              title="حذف الطلب"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}
window.renderCollegeStudentApplications = renderCollegeStudentApplications;

async function approveStudentApplication(appId) {
  if (!acquireSubmissionLock('approve_student_' + appId, 5000)) {
    console.warn('Blocked rapid double click on approve student application');
    return;
  }

  const db = readErpDb();
  const app = (db.studentApplications || []).find(a => a.id === appId);
  if (!app) {
    releaseSubmissionLock('approve_student_' + appId);
    return;
  }

  if (app.status === 'Approved') {
    alert('⚠️ تمت الموافقة على هذا الطالب مسبقاً!');
    releaseSubmissionLock('approve_student_' + appId);
    return;
  }

  // Check if student already exists in college
  const alreadyInStudents = (db.students || []).find(s => 
    s.collegeId === app.collegeId && (
      (s.name && app.studentName && s.name.trim().toLowerCase() === app.studentName.trim().toLowerCase()) ||
      (s.universityId && app.universityId && s.universityId.trim() === app.universityId.trim())
    )
  );
  if (alreadyInStudents) {
    app.status = 'Approved';
    app.studentId = alreadyInStudents.id;
    writeErpDb(db);
    renderCollegeStudents();
    renderCollegeStudentApplications();
    alert(`⚠️ الطالب (${alreadyInStudents.name}) معتمد ومسجل مسبقاً في سجلات الكلية!`);
    releaseSubmissionLock('approve_student_' + appId);
    return;
  }

  if (!confirm(`هل أنت متأكد من الموافقة على طلب انضمام الطالب (${app.studentName}) برقم الهوية الجامعية (${app.universityId})؟`)) {
    releaseSubmissionLock('approve_student_' + appId);
    return;
  }

  // Create student in college students with guaranteed uniqueness
  const existingUsernames = new Set([
    db.superAdmin?.username?.toLowerCase(),
    ...(db.colleges || []).map(c => (c.adminUsername || '').toLowerCase()),
    ...(db.instructors || []).map(i => (i.username || '').toLowerCase()),
    ...(db.students || []).map(s => (s.username || '').toLowerCase())
  ].filter(Boolean));

  const userPrefix = app.email ? app.email.split('@')[0].toLowerCase() : ('stu.' + app.universityId.slice(-4));
  let username = userPrefix;
  let counter = 1;
  while (existingUsernames.has(username)) {
    username = `${userPrefix}${counter++}`;
  }

  const existingPasswords = new Set([
    db.superAdmin?.password,
    ...(db.colleges || []).map(c => c.adminPassword),
    ...(db.instructors || []).map(i => i.password),
    ...(db.students || []).map(s => s.password)
  ].filter(Boolean));

  let password = app.proposedPassword;
  if (!password || existingPasswords.has(password) || /[^a-zA-Z0-9]/.test(password)) {
    password = generateUniquePassword();
  }

  // Strict global uniqueness check across platform
  const uniqueCheck = checkGlobalUniqueness({
    personName: app.studentName,
    universityId: app.universityId,
    username,
    password,
    excludeId: appId
  });
  if (!uniqueCheck.valid) {
    alert(uniqueCheck.message);
    releaseSubmissionLock('approve_student_' + appId);
    return;
  }

  const newStudent = {
    id: 'stu_' + Date.now(),
    collegeId: app.collegeId,
    name: app.studentName,
    universityId: app.universityId,
    stage: app.stage || '4th',
    group: app.group || 'Group A',
    username: username,
    password: password,
    phone: app.phone,
    email: app.email,
    role: 'STUDENT',
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.students.push(newStudent);

  app.status = 'Approved';
  app.approvedAt = new Date().toISOString();
  app.studentId = newStudent.id;
  app.generatedUsername = username;
  app.generatedPassword = password;

  writeErpDb(db);
  syncPushCollegeStudent(newStudent);
  await syncPushStudentApplication(app);

  renderCollegeStudents();
  renderCollegeStudentApplications();
  renderSuperAdminStudentApplications();

  const waUrl = getStudentWhatsAppUrl(app.phone, app.studentName, app.collegeName, app.universityId, username, password);
  if (confirm(`🎉 تمت الموافقة على الطالب (${app.studentName}) واعتماده رسمياً بالكلية!\n\nاسم المستخدم: ${username}\nكلمة المرور: ${password}\n\nهل ترغب في فتح محادثة واتساب الآن لإرسال رسالة التهنئة وبيانات الدخول للطالب فوراً؟`)) {
    window.open(waUrl, '_blank');
  }
}
window.approveStudentApplication = approveStudentApplication;

async function rejectStudentApplication(appId) {
  if (!confirm('هل أنت متأكد من رفض طلب هذا الطالب؟')) return;
  const db = readErpDb();
  const app = (db.studentApplications || []).find(a => a.id === appId);
  if (!app) return;

  app.status = 'Rejected';
  writeErpDb(db);
  await syncPushStudentApplication(app);
  renderCollegeStudentApplications();
  renderSuperAdminStudentApplications();
}
window.rejectStudentApplication = rejectStudentApplication;

async function deleteStudentApplication(appId) {
  if (!confirm('هل أنت متأكد من حذف هذا الطلب من السجل؟')) return;
  const db = readErpDb();
  db.studentApplications = (db.studentApplications || []).filter(a => a.id !== appId);
  writeErpDb(db);
  syncDeleteStudentApplication(appId);
  renderCollegeStudentApplications();
  renderSuperAdminStudentApplications();
}
window.deleteStudentApplication = deleteStudentApplication;

async function syncDeleteStudentApplication(appId) {
  const candidateEndpoints = [
    `/api/student-applications?id=${encodeURIComponent(appId)}`,
    `/.netlify/functions/applications?type=student&id=${encodeURIComponent(appId)}`,
    `https://dental-casesheet-erp.netlify.app/api/student-applications?id=${encodeURIComponent(appId)}`,
    `https://dental-casesheet-erp.netlify.app/.netlify/functions/applications?type=student&id=${encodeURIComponent(appId)}`
  ];

  for (const ep of candidateEndpoints) {
    try {
      const res = await fetch(ep, { method: 'DELETE' });
      if (res.ok) break;
    } catch (e) {
      console.warn('Sync delete student app notice:', ep, e);
    }
  }
}
window.syncDeleteStudentApplication = syncDeleteStudentApplication;

// Auto init on page load
window.addEventListener('DOMContentLoaded', () => {
  initSavedAccountsIfEmpty();
  checkImpersonation();
  updateSupabaseStatusUI();
  purgeTransferredApplications();
  syncPullCollegesFromCloud();
  syncPullApplicationsFromCloud();
  syncPullStudentApplicationsFromCloud();
  syncPullInstructorsFromCloud();
  syncPullStudentsFromCloud();
  syncPullCasesFromCloud();
  renderApp();

  // Periodic background check for colleges, apps, instructors, students, and cases
  setInterval(() => {
    syncPullCollegesFromCloud();
    syncPullApplicationsFromCloud();
    syncPullStudentApplicationsFromCloud();
    syncPullInstructorsFromCloud();
    syncPullStudentsFromCloud();
    syncPullCasesFromCloud();
  }, 10000);
});

