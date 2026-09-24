import { Patient, Scan } from '../types';

/**
 * Escapes a field for CSV according to RFC 4180:
 * - If value contains commas, double quotes, or newlines, wrap in double quotes
 * - Double quotes inside are escaped by doubling them ("")
 */
function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats phone / aadhaar numbers to prevent spreadsheet software
 * from converting them into scientific notation (e.g. 9.82E+11).
 */
function escapeIdentifier(val?: string | number): string {
  if (!val) return '';
  const str = String(val).trim();
  // Prepend single quote or wrap to keep as text representation in Excel/Sheets
  return `"${str}"`;
}

/**
 * Exports a list of patients to an offline-ready CSV file.
 * Includes UTF-8 BOM so Excel & LibreOffice render Hindi/regional text and symbols without corruption.
 */
export function exportPatientsToCSV(
  patients: Patient[], 
  options?: {
    customFilename?: string;
    includeVitalsBreakdown?: boolean;
  }
): { filename: string; count: number } {
  const headers = [
    'Patient ID',
    'Full Name',
    'Age',
    'Gender',
    'Aadhaar / National ID',
    'Date of Birth',
    'Marital Status',
    'Verification Status',
    'Phone Number',
    'Village / Health Centre',
    'Diabetes History (Years)',
    'Random Blood Glucose (mg/dL)',
    'HbA1c Glycated (%)',
    'Blood Pressure (Systolic)',
    'Blood Pressure (Diastolic)',
    'Blood Pressure (Formatted)',
    'Medical History & Clinical Notes',
    'Enrolled Date',
    'Last Updated Date'
  ];

  const rows = patients.map((p) => {
    const formattedId = `PAT-${p.id.toString().padStart(4, '0')}`;
    const bpFormatted = p.systolic_bp && p.diastolic_bp ? `${p.systolic_bp}/${p.diastolic_bp} mmHg` : '';
    const enrolledDate = p.created_at ? new Date(p.created_at).toLocaleString() : '';
    const updatedDate = p.updated_at ? new Date(p.updated_at).toLocaleString() : enrolledDate;

    return [
      escapeCsvCell(formattedId),
      escapeCsvCell(p.name),
      escapeCsvCell(p.age),
      escapeCsvCell(p.gender),
      escapeIdentifier(p.aadhaar_no || ''),
      escapeCsvCell(p.dob || ''),
      escapeCsvCell(p.marital_status || 'Unspecified'),
      escapeCsvCell(p.verification_method || 'Manual'),
      escapeIdentifier(p.phone || ''),
      escapeCsvCell(p.village || 'Rural Health Centre'),
      escapeCsvCell(p.diabetes_years ?? ''),
      escapeCsvCell(p.blood_sugar ?? ''),
      escapeCsvCell(p.hba1c ?? ''),
      escapeCsvCell(p.systolic_bp ?? ''),
      escapeCsvCell(p.diastolic_bp ?? ''),
      escapeCsvCell(bpFormatted),
      escapeCsvCell(p.medical_history || ''),
      escapeCsvCell(enrolledDate),
      escapeCsvCell(updatedDate)
    ].join(',');
  });

  // Construct CSV content with UTF-8 BOM for Microsoft Excel / LibreOffice compatibility
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  // Generate dated filename
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  const filename = options?.customFilename || `drishti_patients_cohort_${dateStr}_${timeStr}.csv`;

  // Trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    filename,
    count: patients.length
  };
}

/**
 * Exports a single patient's comprehensive dossier including retinal scans to CSV.
 */
export function exportSinglePatientDossierToCSV(patient: Patient, scans: Scan[]): { filename: string } {
  const metaHeaders = ['Section', 'Attribute', 'Value'];
  const metaRows: string[][] = [
    ['PATIENT DEMOGRAPHICS', 'Patient ID', `PAT-${patient.id.toString().padStart(4, '0')}`],
    ['PATIENT DEMOGRAPHICS', 'Full Name', patient.name],
    ['PATIENT DEMOGRAPHICS', 'Age / Gender', `${patient.age} years / ${patient.gender}`],
    ['PATIENT DEMOGRAPHICS', 'Aadhaar / ID', patient.aadhaar_no || 'Not registered'],
    ['PATIENT DEMOGRAPHICS', 'Phone', patient.phone || 'None'],
    ['PATIENT DEMOGRAPHICS', 'Village / Sub-Centre', patient.village || 'Rural PHC'],
    ['CLINICAL VITALS', 'Random Blood Glucose', patient.blood_sugar ? `${patient.blood_sugar} mg/dL` : 'Not recorded'],
    ['CLINICAL VITALS', 'Glycated HbA1c', patient.hba1c ? `${patient.hba1c}%` : 'Not recorded'],
    ['CLINICAL VITALS', 'Blood Pressure', patient.systolic_bp && patient.diastolic_bp ? `${patient.systolic_bp}/${patient.diastolic_bp} mmHg` : 'Not recorded'],
    ['CLINICAL VITALS', 'Known Diabetes Duration', patient.diabetes_years ? `${patient.diabetes_years} years` : 'Not recorded'],
    ['CLINICAL VITALS', 'Medical History', patient.medical_history || 'No preexisting conditions noted'],
    ['CLINICAL VITALS', 'Enrolled At', patient.created_at ? new Date(patient.created_at).toLocaleString() : '—'],
  ];

  const scanHeaders = ['SCAN RECORD', 'Scan ID', 'Date', 'Type', 'DR Grade', 'Diagnosis', 'Risk Tier', 'AI Engine'];
  const scanRows: string[][] = scans.map(s => [
    'RETINAL SCAN',
    `SCAN-${s.id}`,
    new Date(s.created_at).toLocaleString(),
    s.scan_type,
    `Grade ${s.grade.toFixed(1)}`,
    s.diagnosis,
    s.risk_tier || 'Low',
    s.engine || 'MATLAB-DeepLearning-ResNet50'
  ]);

  const csvLines: string[] = [
    metaHeaders.map(escapeCsvCell).join(','),
    ...metaRows.map(r => r.map(escapeCsvCell).join(',')),
    '',
    scanHeaders.map(escapeCsvCell).join(','),
    ...scanRows.map(r => r.map(escapeCsvCell).join(','))
  ];

  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  const sanitizedName = patient.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const filename = `drishti_dossier_pat_${patient.id}_${sanitizedName}_${dateStr}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { filename };
}
