using Exam.Domain;

namespace Exam.Interfaces.Repositories;

public interface IMedicalRecordRepository
{
    Task AddAsync(MedicalRecord record);

    Task<MedicalRecord?> GetByIdAsync(int id);

    Task<List<MedicalRecord>> GetByPatientAsync(int patientId);

    Task SaveChangesAsync();
}