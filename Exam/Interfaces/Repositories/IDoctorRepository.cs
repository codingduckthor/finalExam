using Exam.Domain;

namespace Exam.Interfaces.Repositories;

public interface IDoctorRepository
{
    Task AddAsync(Doctor doctor);

    Task<List<Doctor>> GetBySpecialtyAsync(int specialtyId);

    Task<bool> ExistsAsync(int id);
    Task<Doctor?> GetByUserIdAsync(int userId);

    Task SaveChangesAsync();
}
