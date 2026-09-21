/**
 * E-Dental CaseSheet Platform - Supabase Cloud Synchronization Engine
 * Academic Year 2026–2027 • College of Dentistry Clinical Information System
 */

(function () {
  const STORAGE_KEY_URL = 'e_dental_supabase_url';
  const STORAGE_KEY_KEY = 'e_dental_supabase_key';
  const STORAGE_KEY_MODE = 'e_dental_supabase_mode'; // 'live', 'demo', or 'offline'

  // SQL Schema Script for one-click setup in Supabase SQL Editor
  const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- E-Dental CaseSheet • Database Schema (Supabase PostgreSQL)
-- Academic Year 2026-2027 • College of Dentistry CIS
-- ========================================================

-- 1. Create Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_number TEXT UNIQUE,
    full_name TEXT NOT NULL,
    age TEXT,
    sex TEXT,
    occupation TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Case Sheets Table
CREATE TABLE IF NOT EXISTS public.case_sheets (
    id TEXT PRIMARY KEY,
    patient_file TEXT,
    patient_name TEXT NOT NULL,
    patient_age TEXT,
    patient_sex TEXT,
    patient_phone TEXT,
    dept_id TEXT NOT NULL,
    dept_name TEXT NOT NULL,
    sheet_id TEXT NOT NULL,
    sheet_code TEXT NOT NULL,
    sheet_title TEXT NOT NULL,
    student_id TEXT DEFAULT 'STU-4891',
    student_name TEXT DEFAULT 'د. علي حيدر الموسوي',
    chief_complaint TEXT,
    chief_complaint_notes TEXT,
    hpi_data JSONB DEFAULT '{}'::jsonb,
    past_dental_history JSONB DEFAULT '{}'::jsonb,
    medical_history JSONB DEFAULT '{}'::jsonb,
    current_medications JSONB DEFAULT '{}'::jsonb,
    blood_pressure JSONB DEFAULT '{}'::jsonb,
    family_history TEXT,
    social_history TEXT,
    extraoral_exam JSONB DEFAULT '{}'::jsonb,
    odontogram_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'draft',
    supervisor_score TEXT,
    supervisor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (RLS) - Allow Access for Clinical App
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_sheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on patients" ON public.patients;
CREATE POLICY "Allow anon all on patients" ON public.patients FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on case_sheets" ON public.case_sheets;
CREATE POLICY "Allow anon all on case_sheets" ON public.case_sheets FOR ALL TO anon USING (true) WITH CHECK (true);

-- Indexes for lightning fast clinical queries
CREATE INDEX IF NOT EXISTS idx_case_sheets_dept ON public.case_sheets(dept_id);
CREATE INDEX IF NOT EXISTS idx_case_sheets_sheet ON public.case_sheets(sheet_id);
CREATE INDEX IF NOT EXISTS idx_case_sheets_student ON public.case_sheets(student_id);
CREATE INDEX IF NOT EXISTS idx_case_sheets_status ON public.case_sheets(status);
`;

  const DEFAULT_URL = 'https://nkshybnrzzxkqyusultb.supabase.co';
  const DEFAULT_KEY = 'sb_publishable_FAbhaWvsEJI4sX_C83o6UA_bqeqcuek';

  let clientInstance = null;

  // Initialize Client
  function getClient() {
    if (clientInstance) return clientInstance;

    const url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_URL;
    const key = localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_KEY;

    if (url && key && window.supabase && window.supabase.createClient) {
      try {
        clientInstance = window.supabase.createClient(url.trim(), key.trim());
        return clientInstance;
      } catch (err) {
        console.error('Error creating Supabase client:', err);
        return null;
      }
    }
    return null;
  }

  // Check if configured
  function isConfigured() {
    const url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_URL;
    const key = localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_KEY;
    return Boolean(url && key);
  }

  // Get current credentials
  function getCredentials() {
    return {
      url: localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_URL,
      key: localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_KEY,
      mode: localStorage.getItem(STORAGE_KEY_MODE) || 'live'
    };
  }

  // Save Credentials
  function saveCredentials(url, key) {
    if (url && key) {
      localStorage.setItem(STORAGE_KEY_URL, url.trim());
      localStorage.setItem(STORAGE_KEY_KEY, key.trim());
      localStorage.setItem(STORAGE_KEY_MODE, 'live');
      clientInstance = null; // reset
      getClient();
      return true;
    }
    return false;
  }

  // Disconnect / Clear
  function disconnect() {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    localStorage.setItem(STORAGE_KEY_MODE, 'offline');
    clientInstance = null;
  }

  // Test Connection
  async function testConnection(url, key) {
    if (!window.supabase || !window.supabase.createClient) {
      return { success: false, message: 'مكتبة Supabase JS غير محملة في الصفحة' };
    }

    try {
      const tempClient = window.supabase.createClient(url.trim(), key.trim());
      // Query case_sheets table or health check
      const { data, error } = await tempClient.from('case_sheets').select('id').limit(1);

      if (error) {
        // Check if error is because table does not exist yet
        if (error.code === '42P01' || error.message.includes('relation "public.case_sheets" does not exist')) {
          return {
            success: true,
            needsSchema: true,
            message: 'تم الاتصال بمشروع سوبابيس بنجاح! تنبيه: جدول case_sheets غير منشأ بعد. يرجى تنفيذ كود SQL المرفق.'
          };
        }
        return { success: false, message: `خطأ في الاتصال: ${error.message} (${error.code || ''})` };
      }

      return { success: true, needsSchema: false, message: 'تم الاتصال بقاعدة بيانات سوبابيس بنجاح تام! 🟢' };
    } catch (err) {
      return { success: false, message: 'تعذر الاتصال بسوبابيس: ' + err.message };
    }
  }

  // Save Case Sheet to Supabase
  async function saveCase(casePayload) {
    const client = getClient();
    if (!client) {
      // Offline fallback: save to localStorage
      saveCaseToLocalFallback(casePayload);
      return {
        success: true,
        source: 'local',
        message: 'تم الحفظ محلياً في الذاكرة (سوبابيس غير متصل).'
      };
    }

    try {
      // 1. Prepare record
      const record = {
        id: casePayload.id,
        patient_file: casePayload.patientFile || 'AQ-2026-841',
        patient_name: casePayload.patientName || 'مريض سريري',
        patient_age: casePayload.patientAge || '25',
        patient_sex: casePayload.patientSex || 'M',
        patient_phone: casePayload.patientPhone || '',
        dept_id: casePayload.deptId || 'omfs',
        dept_name: casePayload.deptName || 'جراحة الفم والفكين',
        sheet_id: casePayload.sheetId || 'omfs-ext-01',
        sheet_code: casePayload.sheetCode || 'OMFS-EXT-01',
        sheet_title: casePayload.sheetTitle || 'طبلة القلع السريرية',
        student_id: casePayload.studentId || 'STU-4891',
        student_name: casePayload.studentName || 'د. علي حيدر الموسوي',
        chief_complaint: casePayload.chiefComplaint || '',
        chief_complaint_notes: casePayload.chiefComplaintNotes || '',
        hpi_data: casePayload.hpiData || {},
        past_dental_history: casePayload.pastDentalHistory || {},
        medical_history: casePayload.medicalHistory || {},
        current_medications: casePayload.currentMedications || {},
        blood_pressure: casePayload.bloodPressure || {},
        family_history: casePayload.familyHistory || '',
        social_history: casePayload.socialHistory || '',
        extraoral_exam: casePayload.extraoralExam || {},
        odontogram_data: casePayload.odontogramData || {},
        status: casePayload.status || 'draft',
        supervisor_score: casePayload.supervisorScore || null,
        supervisor_notes: casePayload.supervisorNotes || null,
        updated_at: new Date().toISOString()
      };

      // 2. Upsert to Supabase
      const { data, error } = await client
        .from('case_sheets')
        .upsert(record, { onConflict: 'id' })
        .select();

      if (error) {
        console.warn('Supabase save error, falling back to local:', error);
        saveCaseToLocalFallback(casePayload);
        return {
          success: true,
          source: 'local_fallback',
          error: error.message,
          message: 'تم الحفظ محلياً (تعذر الرفع السحابي: ' + error.message + ')'
        };
      }

      // Also save to local storage as secondary backup
      saveCaseToLocalFallback(casePayload);

      return {
        success: true,
        source: 'supabase',
        data: data,
        message: 'تم الحفظ والمزامنة السحابية بنجاح في سوبابيس! 🟢☁️'
      };
    } catch (err) {
      console.error('Fatal error saving to Supabase:', err);
      saveCaseToLocalFallback(casePayload);
      return {
        success: true,
        source: 'local_fallback',
        message: 'تم الحفظ محلياً بسبب خطأ اتصال: ' + err.message
      };
    }
  }

  // Update Status / Supervisor Review in Supabase
  async function submitCaseReview(caseId, reviewPayload) {
    const client = getClient();
    if (!client) {
      return { success: true, source: 'local', message: 'تم الاعتماد محلياً' };
    }

    try {
      const updateData = {
        status: reviewPayload.status || 'submitted',
        supervisor_score: reviewPayload.score || '9/10',
        supervisor_notes: reviewPayload.notes || 'معتمد سريرياً',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('case_sheets')
        .update(updateData)
        .eq('id', caseId)
        .select();

      if (error) throw error;
      return { success: true, source: 'supabase', data };
    } catch (err) {
      console.warn('Error submitting review to Supabase:', err);
      return { success: false, error: err.message };
    }
  }

  // Fetch all cases for current student from Supabase
  async function fetchCases(studentId = 'STU-4891') {
    const client = getClient();
    if (!client) {
      const local = JSON.parse(localStorage.getItem('e_dental_drafts') || '[]');
      return { success: true, source: 'local', data: local };
    }

    try {
      const { data, error } = await client
        .from('case_sheets')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { success: true, source: 'supabase', data: data || [] };
    } catch (err) {
      console.warn('Error fetching from Supabase, loading local:', err);
      const local = JSON.parse(localStorage.getItem('e_dental_drafts') || '[]');
      return { success: true, source: 'local', data: local, error: err.message };
    }
  }

  // Helper: Save to localStorage as backup
  function saveCaseToLocalFallback(casePayload) {
    try {
      const localDrafts = JSON.parse(localStorage.getItem('e_dental_drafts') || '[]');
      const existingIdx = localDrafts.findIndex(d => d.id === casePayload.id);
      if (existingIdx >= 0) {
        localDrafts[existingIdx] = { ...localDrafts[existingIdx], ...casePayload };
      } else {
        localDrafts.push(casePayload);
      }
      localStorage.setItem('e_dental_drafts', JSON.stringify(localDrafts));
    } catch (e) {
      console.error('Local backup save failed:', e);
    }
  }

  // Export to window
  window.EDentalSupabase = {
    isConfigured,
    getClient,
    getCredentials,
    saveCredentials,
    disconnect,
    testConnection,
    saveCase,
    submitCaseReview,
    fetchCases,
    SQL_SCHEMA: SUPABASE_SQL_SCHEMA
  };
})();
