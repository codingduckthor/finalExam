using Exam.DTOs.MedicalRecord;

namespace Exam.Interfaces.Services;

public interface IMedicalRecordService
{
    Task CreateAsync(CreateMedicalRecordDto dto);

    Task<MedicalRecordResponseDto?> GetByIdAsync(int id);

    Task<List<MedicalRecordResponseDto>>
        GetPatientHistoryAsync(int patientId);
}