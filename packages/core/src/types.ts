// Shared types for psyapp-saas

export type UserRole = 'patient' | 'therapist' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientProfile {
  userId: string;
  dateOfBirth?: Date;
  emergencyContact?: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
  medicalHistory?: string;
  preferences?: PatientPreferences;
}

export interface TherapistProfile {
  userId: string;
  licenseNumber: string;
  licenseState: string;
  specialties: string[];
  bio?: string;
  yearsOfExperience?: number;
  education?: EducationEntry[];
  availability?: WeeklyAvailability;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
}

export interface PatientPreferences {
  preferredCommunication: 'email' | 'sms' | 'phone';
  timezone: string;
  language: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  yearCompleted: number;
}

export interface WeeklyAvailability {
  monday?: TimeRange[];
  tuesday?: TimeRange[];
  wednesday?: TimeRange[];
  thursday?: TimeRange[];
  friday?: TimeRange[];
  saturday?: TimeRange[];
  sunday?: TimeRange[];
}

export interface TimeRange {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface Appointment {
  id: string;
  patientId: string;
  therapistId: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type AppointmentType = 'initial_consultation' | 'follow_up' | 'crisis_session' | 'group_session';

export interface SessionNote {
  id: string;
  appointmentId: string;
  therapistId: string;
  content: string;
  moodRating?: number; // 1-10
  riskAssessment?: RiskAssessment;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskAssessment {
  selfHarmRisk: RiskLevel;
  suicideRisk: RiskLevel;
  harmToOthersRisk: RiskLevel;
  notes?: string;
}

export type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'imminent';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
