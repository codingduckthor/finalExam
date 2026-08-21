using Exam.DTOs.Patient;

namespace Exam.Interfaces.Services;

public interface IPatientService
{
    Task CreatePatientAsync(CreatePatientDto dto);
    Task<List<Exam.Domain.Patient>> GetAllAsync();
}
