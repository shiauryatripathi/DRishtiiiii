export interface Patient {
  id: number;
  aadhaar_no?: string;
  dob?: string;
  marital_status?: 'Married' | 'Unmarried' | 'Other';
  verification_method?: 'Biometric' | 'Manual' | 'None';
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone?: string;
  village?: string;
  diabetes_years?: number;
  blood_sugar?: number; // mg/dL
  hba1c?: number; // %
  systolic_bp?: number;
  diastolic_bp?: number;
  medical_history?: string;
  created_at: string;
  updated_at?: string;
}

export interface QueuePatient extends Patient {
  scan_count?: number;
  diagnostic_status?: 'PENDING' | 'DIAGNOSED';
  latest_scan?: {
    id: number;
    grade: number;
    diagnosis: string;
    risk_tier?: string;
    created_at: string;
  } | null;
}

export interface PatientQueueResponse {
  total: number;
  pending: number;
  diagnosed: number;
  patients: QueuePatient[];
}

export interface XAIBiomarker {
  name: string;
  countOrValue: string;
  attributionPercent: number; // e.g. 35%
  quadrant: string;
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  description: string;
}

export interface XAIQuadrantAnalysis {
  quadrant: 'Superior Temporal' | 'Inferior Temporal' | 'Superior Nasal' | 'Inferior Nasal' | 'Macula / Fovea' | 'Optic Disc';
  status: 'Normal' | 'Mild Lesions' | 'Active Hemorrhages' | 'Exudate Cluster' | 'Ischemia';
  lesionCount: number;
  confidence: number;
  notes: string;
}

export interface XAIDoItem {
  title: string;
  description: string;
  priority: 'Immediate' | 'High' | 'Routine';
  category: 'Clinical' | 'Diet' | 'Lifestyle' | 'Medication';
}

export interface XAIDontItem {
  title: string;
  description: string;
  dangerLevel: 'Critical' | 'Severe' | 'Warning';
  reason: string;
}

export interface XAIDosAndDonts {
  dos: XAIDoItem[];
  donts: XAIDontItem[];
}

export interface XAIReport {
  personalizedExplanation: string;
  fovealEvaluation: string;
  vascularCalibreNotes: string;
  biomarkers: XAIBiomarker[];
  quadrants: XAIQuadrantAnalysis[];
  dosAndDonts: XAIDosAndDonts;
  referralTimeline: string;
  generatedBy: string;
  generatedAt: string;
}

export interface Scan {
  id: number;
  patient_id: number;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  scan_type: 'UPLOAD' | 'ADAPTIVE_LENS';
  image_path?: string;
  preprocessed_path?: string;
  gradcam_path?: string;
  grade: number;
  confidence?: number;
  diagnosis: string;
  explainability?: string;
  clinical_action?: string;
  risk_tier?: 'Low' | 'Moderate' | 'High' | 'Critical';
  engine?: 'MathWorks MATLAB ResNet-50 & CLAHE Engine' | 'MATLAB Engine API (Local R2024b)' | 'MATLAB-DeepLearning-ResNet50' | 'Edge-Simulation' | string;
  matlab_metrics?: any;
  created_at: string;
  xai_report?: XAIReport;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  recommendations?: {
    diet: string[];
    home_remedies: string[];
    exercises: string[];
    deficiencies: string[];
    urgent_referral: boolean;
  };
}

export interface RealtimeEvent {
  type: 'PATIENT_ADDED' | 'PATIENT_UPDATED' | 'SCAN_COMPLETED' | 'PING';
  data?: any;
  timestamp: string;
}
