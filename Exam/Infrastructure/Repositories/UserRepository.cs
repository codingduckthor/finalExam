using Exam.Domain;
using Exam.Infrastructure;
using Exam.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Exam.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task<User?> GetByLoginAsync(string login)
    {
        return await _context.Users
            .FirstOrDefaultAsync(x => x.Login == login);
    }

    public Task<User?> GetByIdAsync(int id) => _context.Users.FindAsync(id).AsTask();

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
