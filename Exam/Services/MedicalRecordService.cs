using Exam.Domain;
using Exam.Domain.Enums;
using Exam.DTOs.MedicalRecord;
using Exam.Interfaces.Repositories;
using Exam.Interfaces.Services;

namespace Exam.Services;

public class MedicalRecordService : IMedicalRecordService
{
    private readonly IMedicalRecordRepository _medicalRecordRepository;
    private readonly IAppointmentRepository _appointmentRepository;

    public MedicalRecordService(
        IMedicalRecordRepository medicalRecordRepository,
        IAppointmentRepository appointmentRepository)
    {
        _medicalRecordRepository = medicalRecordRepository;
        _appointmentRepository = appointmentRepository;
    }

    public async Task CreateAsync(CreateMedicalRecordDto dto)
    {
        var appointment =
            await _appointmentRepository.GetByIdAsync(dto.AppointmentId);

        if (appointment == null)
            throw new InvalidOperationException(
                "Прием не найден.");

        if (appointment.Status != AppointmentStatus.Completed)
            throw new InvalidOperationException(
                "Медицинскую запись можно создать только после завершенного приема.");

        if (appointment.MedicalRecord != null)
            throw new InvalidOperationException(
                "Для данного приема медицинская запись уже существует.");

        var record = new MedicalRecord
        {
            AppointmentId = appointment.Id,

            DoctorId =
                appointment.AppointmentSlot.DoctorId,

            PatientId =
                appointment.PatientId,

            Complaints = dto.Complaints,

            Diagnosis = dto.Diagnosis,

            Treatment = dto.Treatment,
            AnamnesisVitae = dto.AnamnesisVitae,
            AnamnesisMorbi = dto.AnamnesisMorbi,
            GeneralExamination = dto.GeneralExamination,
            StatusLocalis = dto.StatusLocalis,
            Analyses = dto.Analyses,
            Recommendations = dto.Recommendations,

            CreatedAt = DateTime.UtcNow
        };

        await _medicalRecordRepository.AddAsync(record);

        await _medicalRecordRepository.SaveChangesAsync();
    }

    public async Task<MedicalRecordResponseDto?> GetByIdAsync(int id)
    {
        var record =
            await _medicalRecordRepository.GetByIdAsync(id);

        if (record == null)
            return null;

        return new MedicalRecordResponseDto
        {
            Id = record.Id,

            AppointmentId = record.AppointmentId,

            DoctorId = record.DoctorId,

            DoctorName = record.Doctor.FullName,

            PatientId = record.PatientId,

            PatientName = record.Patient.FullName,

            Complaints = record.Complaints,

            Diagnosis = record.Diagnosis,

            Treatment = record.Treatment,
            AnamnesisVitae = record.AnamnesisVitae,
            AnamnesisMorbi = record.AnamnesisMorbi,
            GeneralExamination = record.GeneralExamination,
            StatusLocalis = record.StatusLocalis,
            Analyses = record.Analyses,
            Recommendations = record.Recommendations,

            CreatedAt = record.CreatedAt
        };
    }

    public async Task<List<MedicalRecordResponseDto>>
        GetPatientHistoryAsync(int patientId)
    {
        var records =
            await _medicalRecordRepository.GetByPatientAsync(patientId);

        return records.Select(record =>
            new MedicalRecordResponseDto
            {
                Id = record.Id,

                AppointmentId = record.AppointmentId,

                DoctorId = record.DoctorId,

                DoctorName = record.Doctor.FullName,

                PatientId = record.PatientId,

                PatientName = record.Patient.FullName,

                Complaints = record.Complaints,

                Diagnosis = record.Diagnosis,

                Treatment = record.Treatment,
                AnamnesisVitae = record.AnamnesisVitae,
                AnamnesisMorbi = record.AnamnesisMorbi,
                GeneralExamination = record.GeneralExamination,
                StatusLocalis = record.StatusLocalis,
                Analyses = record.Analyses,
                Recommendations = record.Recommendations,

                CreatedAt = record.CreatedAt
            }).ToList();
    }
}
