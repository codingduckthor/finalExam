using Exam.Domain;

namespace Exam.Interfaces.Repositories;

public interface IOfficeRepository
{
    Task AddAsync(Office office);

    Task<List<Office>> GetAllAsync();

    Task<Office?> GetByIdAsync(int id);
    Task<bool> ExistsAsync(int id);

    Task DeleteAsync(Office office);

    Task SaveChangesAsync();
}
