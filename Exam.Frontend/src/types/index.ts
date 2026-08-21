export enum UserRole {
  Admin = 1,
  Doctor = 2,
  Registrar = 3,
  Patient = 4,
}

export const UserRoleNames: Record<UserRole, string> = {
  [UserRole.Admin]: 'Администратор',
  [UserRole.Doctor]: 'Врач',
  [UserRole.Registrar]: 'Регистратор',
  [UserRole.Patient]: 'Пациент',
};

export enum AppointmentStatus {
  Scheduled = 1,
  Completed = 2,
  Cancelled = 3,
  NoShow = 4,
}

export enum WeekDay {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}

export const WeekDayNames: Record<WeekDay, string> = {
  [WeekDay.Monday]: 'Понедельник',
  [WeekDay.Tuesday]: 'Вторник',
  [WeekDay.Wednesday]: 'Среда',
  [WeekDay.Thursday]: 'Четверг',
  [WeekDay.Friday]: 'Пятница',
  [WeekDay.Saturday]: 'Суббота',
  [WeekDay.Sunday]: 'Воскресенье',
};

export interface UserResponseDto {
  id: number;
  login: string;
  role: UserRole;
}

export interface AuthResponseDto {
  token: string;
}

export interface SpecialtyDto {
  id: number;
  name: string;
}

export interface DoctorResponseDto {
  id: number;
  fullName: string;
  specialty: string;
}

export interface OfficeResponseDto {
  id: number;
  number: string;
  floor: number;
}

export interface DoctorScheduleResponseDto {
  id: number;
  doctorName: string;
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
}

export interface AppointmentSlotResponseDto {
  id: number;
  doctorName: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface AppointmentResponseDto {
  appointmentId: number;
  doctorName: string;
  specialty: string;
  dateTime: string;
}

export interface MedicalRecordResponseDto {
  id: number;
  appointmentId: number;
  doctorId: number;
  doctorName: string;
  patientId: number;
  patientName: string;
  complaints: string;
  diagnosis: string;
  treatment: string;
  anamnesisVitae: string;
  anamnesisMorbi: string;
  generalExamination: string;
  statusLocalis: string;
  analyses: string;
  recommendations: string;
  createdAt: string;
}

// Request DTOs
export interface LoginDto {
  login: string;
  password?: string;
}

export interface RegisterDto {
  login: string;
  password?: string;
  role: UserRole;
  fullName: string;
  birthDate: string;
}

export interface CreateDoctorDto {
  fullName: string;
  specialtyId: number;
  officeId: number;
  login: string;
  password: string;
}

export interface CreatePatientDto {
  fullName: string;
  birthDate: string;
}

export interface CreateOfficeDto {
  number: string;
  floor: number;
}

export interface CreateSpecialtyDto {
  name: string;
}

export interface CreateDoctorScheduleDto {
  doctorId: number;
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
}

export interface CreateAppointmentSlotDto {
  doctorId: number;
  startTime: string;
  endTime: string;
}

export interface CreateAppointmentDto {
  patientId: number;
  appointmentSlotId: number;
}

export interface CreateMedicalRecordDto {
  appointmentId: number;
  complaints: string;
  diagnosis: string;
  treatment: string;
}
