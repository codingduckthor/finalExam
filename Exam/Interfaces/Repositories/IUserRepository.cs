using Exam.Domain;

namespace Exam.Interfaces.Repositories;

public interface IUserRepository
{
    Task AddAsync(User user);
    Task<User?> GetByLoginAsync(string login);
    Task<User?> GetByIdAsync(int id);
    Task<List<User>> GetAllAsync();
    Task SaveChangesAsync();
}
