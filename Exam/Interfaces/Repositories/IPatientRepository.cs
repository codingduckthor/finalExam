using Exam.Domain;

namespace Exam.Interfaces.Repositories;

public interface IPatientRepository
{
    Task AddAsync(Patient patient);

    Task<List<Patient>> GetAllAsync();

    Task<bool> ExistsAsync(int id);
    Task<Patient?> GetByUserIdAsync(int userId);

    Task SaveChangesAsync();
}
