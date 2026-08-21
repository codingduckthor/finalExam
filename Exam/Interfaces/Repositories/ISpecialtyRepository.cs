using Exam.Domain;

namespace Exam.Interfaces.Repositories;

public interface ISpecialtyRepository
{
    Task AddAsync(Specialty specialty);

    Task<List<Specialty>> GetAllAsync();

    Task<bool> ExistsAsync(int id);

    Task SaveChangesAsync();
}
